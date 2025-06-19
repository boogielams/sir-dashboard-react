import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_KEYS } from '../config/apiKeys';

// BSC API endpoints
const BSCSCAN_API_KEY = API_KEYS.BSCSCAN;
const BSCSCAN_BASE_URL = 'https://api.bscscan.com/api';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper function to make BscScan API calls
const makeBscScanCall = async (module, action, params = {}) => {
  try {
    const response = await axios.get(BSCSCAN_BASE_URL, {
      params: {
        module,
        action,
        apikey: BSCSCAN_API_KEY,
        ...params
      }
    });
    return response.data.result;
  } catch (error) {
    console.error(`BscScan call failed for ${module}.${action}:`, error);
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

// Get BSC gas prices
const getBSCGasPrice = async () => {
  try {
    const gasOracle = await makeBscScanCall('gastracker', 'gasoracle');
    if (gasOracle) {
      // Convert from Gwei to USD (approximate)
      const gweiPrice = parseInt(gasOracle.ProposeGasPrice);
      const bnbPrice = await getBSCPrice();
      const usdPrice = (gweiPrice * 1e-9) * bnbPrice; // Convert gwei to BNB, then to USD
      return `$${usdPrice.toFixed(4)}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting BSC gas price:', error);
    return null;
  }
};

// Get BSC price
const getBSCPrice = async () => {
  try {
    const bnbData = await makeCoinGeckoCall('/simple/price?ids=binancecoin&vs_currencies=usd');
    return bnbData?.binancecoin?.usd || 300; // Fallback price
  } catch (error) {
    console.error('Error getting BSC price:', error);
    return 300; // Fallback price
  }
};

// Calculate BSC TPS from recent blocks
const calculateBSCTPS = async () => {
  try {
    // Get latest block number
    const latestBlock = await makeBscScanCall('proxy', 'eth_blockNumber');
    if (!latestBlock) return null;

    const latest = parseInt(latestBlock, 16);
    const blocksToCheck = 10;
    
    let totalTransactions = 0;
    let totalTime = 0;
    
    // Get transaction counts for recent blocks
    for (let i = 0; i < blocksToCheck; i++) {
      const blockNumber = latest - i;
      const block = await makeBscScanCall('proxy', 'eth_getBlockByNumber', {
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
    console.error('Error calculating BSC TPS:', error);
    return null;
  }
};

// Get BSC market data
const getBSCMarketData = async () => {
  try {
    const bnbData = await makeCoinGeckoCall('/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    return bnbData?.binancecoin;
  } catch (error) {
    console.error('Error getting BSC market data:', error);
    return null;
  }
};

// Get BSC TVL
const getBSCTVL = async () => {
  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    const bscProtocol = response.data.find(p => p.name === 'BNB Chain');
    return bscProtocol?.tvl || null;
  } catch (error) {
    console.error('Error getting BSC TVL:', error);
    return null;
  }
};

// Main function to get all BSC data
export const getBSCData = async () => {
  try {
    console.log('Fetching BSC data...');
    
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
      fetchWithTimeout(calculateBSCTPS()),
      fetchWithTimeout(getBSCGasPrice()),
      fetchWithTimeout(getBSCMarketData()),
      fetchWithTimeout(getBSCTVL())
    ]);
    
    // Extract successful results
    const successfulTps = tps.status === 'fulfilled' ? tps.value : null;
    const successfulGasPrice = gasPrice.status === 'fulfilled' ? gasPrice.value : null;
    const successfulMarketData = marketData.status === 'fulfilled' ? marketData.value : null;
    const successfulTvl = tvl.status === 'fulfilled' ? tvl.value : null;
    
    // BSC finality (PoSA)
    const finality = '3s';
    
    // BSC uptime
    const uptime = 99.2;
    
    // Calculate market cap
    const marketCap = successfulMarketData?.usd_market_cap ? `$${(successfulMarketData.usd_market_cap / 1e9).toFixed(1)}B` : null;
    
    // Calculate 24h volume
    const volume24h = successfulMarketData?.usd_24h_vol ? `$${(successfulMarketData.usd_24h_vol / 1e9).toFixed(1)}B` : null;
    
    const bscData = {
      tps: successfulTps || 300, // Fallback to estimated TPS
      gasPrice: successfulGasPrice || '$0.15',
      finality,
      uptime,
      marketCap: marketCap || '$45.2B',
      volume24h: volume24h || '$1.8B',
      tvl: successfulTvl ? `$${(successfulTvl / 1e9).toFixed(1)}B` : '$3.2B',
      priceChange24h: successfulMarketData?.usd_24h_change || 0.2,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        tps: successfulTps ? 'live' : 'estimated',
        gasPrice: successfulGasPrice ? 'live' : 'estimated',
        marketData: successfulMarketData ? 'live' : 'estimated',
        tvl: successfulTvl ? 'live' : 'estimated'
      }
    };
    
    console.log('BSC data fetched:', bscData);
    return bscData;
    
  } catch (error) {
    console.error('Error fetching BSC data:', error);
    // Return fallback data
    return {
      tps: 300,
      gasPrice: '$0.15',
      finality: '3s',
      uptime: 99.2,
      marketCap: '$45.2B',
      volume24h: '$1.8B',
      tvl: '$3.2B',
      priceChange24h: 0.2,
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
export const useBSCData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bscData = await getBSCData();
        setData(bscData);
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