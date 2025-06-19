import axios from 'axios';
import { useState, useEffect } from 'react';

// Base API endpoints
const BASE_RPC_URL = 'https://mainnet.base.org';
const BASE_BLOCKSCOUT_URL = 'https://base.blockscout.com/api/v2';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper function to make RPC calls
const makeRpcCall = async (method, params = []) => {
  try {
    const response = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      method,
      params,
      id: 1
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data.result;
  } catch (error) {
    console.error(`RPC call failed for ${method}:`, error);
    return null;
  }
};

// Helper function to make Blockscout API calls
const makeBlockscoutCall = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_BLOCKSCOUT_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Blockscout call failed for ${endpoint}:`, error);
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

// Calculate TPS from recent blocks
const calculateTPS = async () => {
  try {
    // Get latest block number
    const latestBlockNumber = await makeRpcCall('eth_blockNumber');
    if (!latestBlockNumber) return null;

    const latest = parseInt(latestBlockNumber, 16);
    const blocksToCheck = 10; // Check last 10 blocks
    
    let totalTransactions = 0;
    let totalTime = 0;
    
    // Get transaction counts for recent blocks
    for (let i = 0; i < blocksToCheck; i++) {
      const blockNumber = latest - i;
      const block = await makeRpcCall('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, false]);
      
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
    console.error('Error calculating TPS:', error);
    return null;
  }
};

// Get gas price from recent blocks
const getGasPrice = async () => {
  try {
    const gasPrice = await makeRpcCall('eth_gasPrice');
    if (gasPrice) {
      // Convert from wei to gwei
      const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;
      return gasPriceGwei;
    }
    return null;
  } catch (error) {
    console.error('Error getting gas price:', error);
    return null;
  }
};

// Get network stats from Blockscout
const getNetworkStats = async () => {
  try {
    const stats = await makeBlockscoutCall('/stats');
    return stats;
  } catch (error) {
    console.error('Error getting network stats:', error);
    return null;
  }
};

// Get Base token price and market data
const getBaseMarketData = async () => {
  try {
    // Base token ID on CoinGecko
    const baseData = await makeCoinGeckoCall('/simple/price?ids=base&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    return baseData?.base;
  } catch (error) {
    console.error('Error getting Base market data:', error);
    return null;
  }
};

// Get TVL (Total Value Locked) for Base
const getBaseTVL = async () => {
  try {
    // Using DefiLlama API for TVL data
    const response = await axios.get('https://api.llama.fi/protocols');
    const baseProtocol = response.data.find(p => p.name === 'Base');
    return baseProtocol?.tvl || null;
  } catch (error) {
    console.error('Error getting Base TVL:', error);
    return null;
  }
};

// Main function to get all Base data
export const getBaseData = async () => {
  try {
    console.log('Fetching Base data...');
    
    // Fetch all data in parallel with timeout
    const timeout = 10000; // 10 second timeout
    const fetchWithTimeout = (promise) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);
    };
    
    const [tps, gasPrice, , marketData, tvl] = await Promise.allSettled([
      fetchWithTimeout(calculateTPS()),
      fetchWithTimeout(getGasPrice()),
      fetchWithTimeout(getNetworkStats()),
      fetchWithTimeout(getBaseMarketData()),
      fetchWithTimeout(getBaseTVL())
    ]);
    
    // Extract successful results
    const successfulTps = tps.status === 'fulfilled' ? tps.value : null;
    const successfulGasPrice = gasPrice.status === 'fulfilled' ? gasPrice.value : null;
    const successfulMarketData = marketData.status === 'fulfilled' ? marketData.value : null;
    const successfulTvl = tvl.status === 'fulfilled' ? tvl.value : null;
    
    // Calculate finality (Base is an optimistic rollup, so ~7 days for full finality)
    const finality = '7 days'; // Optimistic rollup finality
    
    // Calculate uptime (simplified - in reality you'd track this over time)
    const uptime = 99.5; // Base has been very reliable
    
    // Format gas price for display
    // Convert from gwei to dollars (1 gwei = 0.000000001 ETH, and assuming ETH price around $3000)
    const ethPrice = 3000; // Approximate ETH price
    const formattedGasPrice = successfulGasPrice ? `$${(successfulGasPrice * 0.000000001 * ethPrice).toFixed(4)}` : null;
    
    // Calculate market cap
    const marketCap = successfulMarketData?.usd_market_cap ? `$${(successfulMarketData.usd_market_cap / 1e9).toFixed(1)}B` : null;
    
    // Calculate 24h volume
    const volume24h = successfulMarketData?.usd_24h_vol ? `$${(successfulMarketData.usd_24h_vol / 1e6).toFixed(1)}M` : null;
    
    const baseData = {
      tps: successfulTps || 100, // Fallback to estimated TPS
      gasPrice: formattedGasPrice || '$0.05',
      finality,
      uptime,
      marketCap: marketCap || '$8.1B',
      volume24h: volume24h || '$456M',
      tvl: successfulTvl ? `$${(successfulTvl / 1e6).toFixed(1)}M` : '$2.1B',
      priceChange24h: successfulMarketData?.usd_24h_change || 1.5,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        tps: successfulTps ? 'live' : 'estimated',
        gasPrice: successfulGasPrice ? 'live' : 'estimated',
        marketData: successfulMarketData ? 'live' : 'estimated',
        tvl: successfulTvl ? 'live' : 'estimated'
      }
    };
    
    console.log('Base data fetched:', baseData);
    return baseData;
    
  } catch (error) {
    console.error('Error fetching Base data:', error);
    // Return fallback data
    return {
      tps: 100,
      gasPrice: '$0.05',
      finality: '7 days',
      uptime: 99.5,
      marketCap: '$8.1B',
      volume24h: '$456M',
      tvl: '$2.1B',
      priceChange24h: 1.5,
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
export const useBaseData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseData = await getBaseData();
        setData(baseData);
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