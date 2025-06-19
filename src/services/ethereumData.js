import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_KEYS } from '../config/apiKeys';

// Ethereum API endpoints
const ETHERSCAN_API_KEY = API_KEYS.ETHERSCAN;
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper function to make Etherscan API calls
const makeEtherscanCall = async (module, action, params = {}) => {
  try {
    const response = await axios.get(ETHERSCAN_BASE_URL, {
      params: {
        module,
        action,
        apikey: ETHERSCAN_API_KEY,
        ...params
      }
    });
    return response.data.result;
  } catch (error) {
    console.error(`Etherscan call failed for ${module}.${action}:`, error);
    return null;
  }
};

// Helper function to make CoinGecko API calls
const makeCoinGeckoCall = async (endpoint) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`CoinGecko call failed for ${endpoint}:`, error);
    return null;
  }
};

// Get Ethereum gas prices
const getEthereumGasPrice = async () => {
  try {
    const gasOracle = await makeEtherscanCall('gastracker', 'gasoracle');
    if (gasOracle) {
      // Convert from Gwei to USD (approximate)
      const gweiPrice = parseInt(gasOracle.ProposeGasPrice);
      const ethPrice = await getEthereumPrice();
      const usdPrice = (gweiPrice * 1e-9) * ethPrice; // Convert gwei to ETH, then to USD
      return `$${usdPrice.toFixed(2)}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting Ethereum gas price:', error);
    return null;
  }
};

// Get Ethereum price
const getEthereumPrice = async () => {
  try {
    const ethData = await makeCoinGeckoCall('/simple/price?ids=ethereum&vs_currencies=usd');
    return ethData?.ethereum?.usd || 2000; // Fallback price
  } catch (error) {
    console.error('Error getting Ethereum price:', error);
    return 2000; // Fallback price
  }
};

// Calculate Ethereum TPS from recent blocks
const calculateEthereumTPS = async () => {
  try {
    // Get latest block number
    const latestBlock = await makeEtherscanCall('proxy', 'eth_blockNumber');
    if (!latestBlock) return null;

    const latest = parseInt(latestBlock, 16);
    const blocksToCheck = 10;
    
    let totalTransactions = 0;
    let totalTime = 0;
    
    // Get transaction counts for recent blocks
    for (let i = 0; i < blocksToCheck; i++) {
      const blockNumber = latest - i;
      const block = await makeEtherscanCall('proxy', 'eth_getBlockByNumber', {
        tag: `0x${blockNumber.toString(16)}`,
        boolean: 'false'
      });
      
      if (block && block.transactions) {
        totalTransactions += block.transactions.length;
      }
      
      // Get block timestamp
      if (block && block.timestamp) {
        const timestamp = parseInt(block.timestamp, 16);
        if (i === 0) {
          totalTime = timestamp;
        } else if (i === blocksToCheck - 1) {
          totalTime = totalTime - timestamp;
        }
      }
    }
    
    // Calculate TPS (transactions per second)
    if (totalTime > 0) {
      return Math.round(totalTransactions / totalTime);
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating Ethereum TPS:', error);
    return null;
  }
};

// Get Ethereum market data
const getEthereumMarketData = async () => {
  try {
    const ethData = await makeCoinGeckoCall('/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    return ethData?.ethereum;
  } catch (error) {
    console.error('Error getting Ethereum market data:', error);
    return null;
  }
};

// Get Ethereum TVL
const getEthereumTVL = async () => {
  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    const ethProtocol = response.data.find(p => p.name === 'Ethereum');
    return ethProtocol?.tvl || null;
  } catch (error) {
    console.error('Error getting Ethereum TVL:', error);
    return null;
  }
};

// Main function to get all Ethereum data
export const getEthereumData = async () => {
  try {
    console.log('Fetching Ethereum data...');
    
    // Fetch all data in parallel with timeout
    const timeout = 10000;
    const fetchWithTimeout = (promise) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);
    };
    
    const [tps, gasPrice, marketData, tvl] = await Promise.allSettled([
      fetchWithTimeout(calculateEthereumTPS()),
      fetchWithTimeout(getEthereumGasPrice()),
      fetchWithTimeout(getEthereumMarketData()),
      fetchWithTimeout(getEthereumTVL())
    ]);
    
    // Extract successful results
    const successfulTps = tps.status === 'fulfilled' ? tps.value : null;
    const successfulGasPrice = gasPrice.status === 'fulfilled' ? gasPrice.value : null;
    const successfulMarketData = marketData.status === 'fulfilled' ? marketData.value : null;
    const successfulTvl = tvl.status === 'fulfilled' ? tvl.value : null;
    
    // Ethereum finality (PoS)
    const finality = '12s';
    
    // Ethereum uptime (very reliable)
    const uptime = 99.95;
    
    // Calculate market cap
    const marketCap = successfulMarketData?.usd_market_cap ? `$${(successfulMarketData.usd_market_cap / 1e9).toFixed(1)}B` : null;
    
    // Calculate 24h volume
    const volume24h = successfulMarketData?.usd_24h_vol ? `$${(successfulMarketData.usd_24h_vol / 1e9).toFixed(1)}B` : null;
    
    const ethData = {
      tps: successfulTps || 15, // Fallback to estimated TPS
      gasPrice: successfulGasPrice || '$2.50',
      finality,
      uptime,
      marketCap: marketCap || '$445.8B',
      volume24h: volume24h || '$12.4B',
      tvl: successfulTvl ? `$${(successfulTvl / 1e9).toFixed(1)}B` : '$45.2B',
      priceChange24h: successfulMarketData?.usd_24h_change || 0.1,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        tps: successfulTps ? 'live' : 'estimated',
        gasPrice: successfulGasPrice ? 'live' : 'estimated',
        marketData: successfulMarketData ? 'live' : 'estimated',
        tvl: successfulTvl ? 'live' : 'estimated'
      }
    };
    
    console.log('Ethereum data fetched:', ethData);
    return ethData;
    
  } catch (error) {
    console.error('Error fetching Ethereum data:', error);
    // Return fallback data
    return {
      tps: 15,
      gasPrice: '$2.50',
      finality: '12s',
      uptime: 99.95,
      marketCap: '$445.8B',
      volume24h: '$12.4B',
      tvl: '$45.2B',
      priceChange24h: 0.1,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch live data',
      dataQuality: {
        tps: 'estimated',
        gasPrice: 'estimated',
        marketData: 'estimated',
        tvl: 'estimated'
      }
    };
  }
};

// Hook for React components
export const useEthereumData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ethData = await getEthereumData();
        setData(ethData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error };
}; 