import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_KEYS } from '../config/apiKeys';

// Polygon API endpoints
const POLYGONSCAN_API_KEY = API_KEYS.POLYGONSCAN;
const POLYGONSCAN_BASE_URL = 'https://api.polygonscan.com/api';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper function to make Polygonscan API calls
const makePolygonscanCall = async (module, action, params = {}) => {
  try {
    const response = await axios.get(POLYGONSCAN_BASE_URL, {
      params: {
        module,
        action,
        apikey: POLYGONSCAN_API_KEY,
        ...params
      }
    });
    return response.data.result;
  } catch (error) {
    console.error(`Polygonscan call failed for ${module}.${action}:`, error);
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

// Get Polygon gas prices
const getPolygonGasPrice = async () => {
  try {
    const gasOracle = await makePolygonscanCall('gastracker', 'gasoracle');
    if (gasOracle) {
      // Convert from Gwei to USD (approximate)
      const gweiPrice = parseInt(gasOracle.ProposeGasPrice);
      const maticPrice = await getPolygonPrice();
      const usdPrice = (gweiPrice * 1e-9) * maticPrice; // Convert gwei to MATIC, then to USD
      return `$${usdPrice.toFixed(6)}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting Polygon gas price:', error);
    return null;
  }
};

// Get Polygon price
const getPolygonPrice = async () => {
  try {
    const maticData = await makeCoinGeckoCall('/simple/price?ids=matic-network&vs_currencies=usd');
    return maticData?.['matic-network']?.usd || 0.8; // Fallback price
  } catch (error) {
    console.error('Error getting Polygon price:', error);
    return 0.8; // Fallback price
  }
};

// Calculate Polygon TPS from recent blocks
const calculatePolygonTPS = async () => {
  try {
    // Get latest block number
    const latestBlock = await makePolygonscanCall('proxy', 'eth_blockNumber');
    if (!latestBlock) return null;

    const latest = parseInt(latestBlock, 16);
    const blocksToCheck = 10;
    
    let totalTransactions = 0;
    let totalTime = 0;
    
    // Get transaction counts for recent blocks
    for (let i = 0; i < blocksToCheck; i++) {
      const blockNumber = latest - i;
      const block = await makePolygonscanCall('proxy', 'eth_getBlockByNumber', {
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
    console.error('Error calculating Polygon TPS:', error);
    return null;
  }
};

// Get Polygon market data
const getPolygonMarketData = async () => {
  try {
    const maticData = await makeCoinGeckoCall('/simple/price?ids=matic-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    return maticData?.['matic-network'];
  } catch (error) {
    console.error('Error getting Polygon market data:', error);
    return null;
  }
};

// Get Polygon TVL
const getPolygonTVL = async () => {
  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    const polygonProtocol = response.data.find(p => p.name === 'Polygon');
    return polygonProtocol?.tvl || null;
  } catch (error) {
    console.error('Error getting Polygon TVL:', error);
    return null;
  }
};

// Main function to get all Polygon data
export const getPolygonData = async () => {
  try {
    console.log('Fetching Polygon data...');
    
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
      fetchWithTimeout(calculatePolygonTPS()),
      fetchWithTimeout(getPolygonGasPrice()),
      fetchWithTimeout(getPolygonMarketData()),
      fetchWithTimeout(getPolygonTVL())
    ]);
    
    // Extract successful results
    const successfulTps = tps.status === 'fulfilled' ? tps.value : null;
    const successfulGasPrice = gasPrice.status === 'fulfilled' ? gasPrice.value : null;
    const successfulMarketData = marketData.status === 'fulfilled' ? marketData.value : null;
    const successfulTvl = tvl.status === 'fulfilled' ? tvl.value : null;
    
    // Polygon finality (PoS)
    const finality = '2.3s';
    
    // Polygon uptime
    const uptime = 98.8;
    
    // Calculate market cap
    const marketCap = successfulMarketData?.usd_market_cap ? `$${(successfulMarketData.usd_market_cap / 1e9).toFixed(1)}B` : null;
    
    // Calculate 24h volume
    const volume24h = successfulMarketData?.usd_24h_vol ? `$${(successfulMarketData.usd_24h_vol / 1e6).toFixed(1)}M` : null;
    
    const polygonData = {
      tps: successfulTps || 350, // Fallback to estimated TPS
      gasPrice: successfulGasPrice || '$0.001',
      finality,
      uptime,
      marketCap: marketCap || '$11.7B',
      volume24h: volume24h || '$623M',
      tvl: successfulTvl ? `$${(successfulTvl / 1e6).toFixed(1)}M` : '$1.2B',
      priceChange24h: successfulMarketData?.usd_24h_change || -1.2,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        tps: successfulTps ? 'live' : 'estimated',
        gasPrice: successfulGasPrice ? 'live' : 'estimated',
        marketData: successfulMarketData ? 'live' : 'estimated',
        tvl: successfulTvl ? 'live' : 'estimated'
      }
    };
    
    console.log('Polygon data fetched:', polygonData);
    return polygonData;
    
  } catch (error) {
    console.error('Error fetching Polygon data:', error);
    // Return fallback data
    return {
      tps: 350,
      gasPrice: '$0.001',
      finality: '2.3s',
      uptime: 98.8,
      marketCap: '$11.7B',
      volume24h: '$623M',
      tvl: '$1.2B',
      priceChange24h: -1.2,
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
export const usePolygonData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const polygonData = await getPolygonData();
        setData(polygonData);
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