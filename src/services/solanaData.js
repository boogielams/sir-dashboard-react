import axios from 'axios';
import { useState, useEffect } from 'react';

// Solana API endpoints
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
const SOLANA_BEACH_URL = 'https://api.solanabeach.io/v1';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper function to make Solana RPC calls
const makeSolanaRpcCall = async (method, params = []) => {
  try {
    const response = await axios.post(SOLANA_RPC_URL, {
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
    console.error(`Solana RPC call failed for ${method}:`, error);
    return null;
  }
};

// Helper function to make Solana Beach API calls
const makeSolanaBeachCall = async (endpoint) => {
  try {
    const response = await axios.get(`${SOLANA_BEACH_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Solana Beach call failed for ${endpoint}:`, error);
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

// Get Solana TPS
const getSolanaTPS = async () => {
  try {
    // Try Solana Beach first
    const beachStats = await makeSolanaBeachCall('/stats');
    if (beachStats && beachStats.tps) {
      return beachStats.tps;
    }
    
    // Fallback to RPC calculation
    const recentBlocks = await makeSolanaRpcCall('getRecentPerformanceSamples', [10]);
    if (recentBlocks && recentBlocks.length > 0) {
      const totalTps = recentBlocks.reduce((sum, block) => sum + (block.numTransactions || 0), 0);
      const avgTps = totalTps / recentBlocks.length;
      return Math.round(avgTps);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Solana TPS:', error);
    return null;
  }
};

// Get Solana transaction fee (approximate)
const getSolanaTransactionFee = async () => {
  try {
    // Solana fees are typically around 0.000005 SOL
    const solPrice = await getSolanaPrice();
    const feeInSol = 0.000005;
    const feeInUsd = feeInSol * solPrice;
    return `$${feeInUsd.toFixed(6)}`;
  } catch (error) {
    console.error('Error getting Solana transaction fee:', error);
    return null;
  }
};

// Get Solana price
const getSolanaPrice = async () => {
  try {
    const solData = await makeCoinGeckoCall('/simple/price?ids=solana&vs_currencies=usd');
    return solData?.solana?.usd || 100; // Fallback price
  } catch (error) {
    console.error('Error getting Solana price:', error);
    return 100; // Fallback price
  }
};

// Get Solana market data
const getSolanaMarketData = async () => {
  try {
    const solData = await makeCoinGeckoCall('/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    return solData?.solana;
  } catch (error) {
    console.error('Error getting Solana market data:', error);
    return null;
  }
};

// Get Solana TVL
const getSolanaTVL = async () => {
  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    const solProtocol = response.data.find(p => p.name === 'Solana');
    return solProtocol?.tvl || null;
  } catch (error) {
    console.error('Error getting Solana TVL:', error);
    return null;
  }
};

// Get Solana network stats
const getSolanaNetworkStats = async () => {
  try {
    const stats = await makeSolanaBeachCall('/stats');
    return stats;
  } catch (error) {
    console.error('Error getting Solana network stats:', error);
    return null;
  }
};

// Main function to get all Solana data
export const getSolanaData = async () => {
  try {
    console.log('Fetching Solana data...');
    
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
    
    const [tps, transactionFee, marketData, tvl] = await Promise.allSettled([
      fetchWithTimeout(getSolanaTPS()),
      fetchWithTimeout(getSolanaTransactionFee()),
      fetchWithTimeout(getSolanaMarketData()),
      fetchWithTimeout(getSolanaTVL())
    ]);
    
    // Extract successful results
    const successfulTps = tps.status === 'fulfilled' ? tps.value : null;
    const successfulTransactionFee = transactionFee.status === 'fulfilled' ? transactionFee.value : null;
    const successfulMarketData = marketData.status === 'fulfilled' ? marketData.value : null;
    const successfulTvl = tvl.status === 'fulfilled' ? tvl.value : null;
    
    // Solana finality (PoH)
    const finality = '0.8s';
    
    // Solana uptime
    const uptime = 98.1;
    
    // Calculate market cap
    const marketCap = successfulMarketData?.usd_market_cap ? `$${(successfulMarketData.usd_market_cap / 1e9).toFixed(1)}B` : null;
    
    // Calculate 24h volume
    const volume24h = successfulMarketData?.usd_24h_vol ? `$${(successfulMarketData.usd_24h_vol / 1e9).toFixed(1)}B` : null;
    
    const solData = {
      tps: successfulTps || 3000, // Fallback to estimated TPS
      gasPrice: successfulTransactionFee || '$0.002', // Using transaction fee as gas price equivalent
      finality,
      uptime,
      marketCap: marketCap || '$89.2B',
      volume24h: volume24h || '$2.1B',
      tvl: successfulTvl ? `$${(successfulTvl / 1e9).toFixed(1)}B` : '$8.5B',
      priceChange24h: successfulMarketData?.usd_24h_change || -0.8,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        tps: successfulTps ? 'live' : 'estimated',
        gasPrice: successfulTransactionFee ? 'live' : 'estimated',
        marketData: successfulMarketData ? 'live' : 'estimated',
        tvl: successfulTvl ? 'live' : 'estimated'
      }
    };
    
    console.log('Solana data fetched:', solData);
    return solData;
    
  } catch (error) {
    console.error('Error fetching Solana data:', error);
    // Return fallback data
    return {
      tps: 3000,
      gasPrice: '$0.002',
      finality: '0.8s',
      uptime: 98.1,
      marketCap: '$89.2B',
      volume24h: '$2.1B',
      tvl: '$8.5B',
      priceChange24h: -0.8,
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
export const useSolanaData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const solData = await getSolanaData();
        setData(solData);
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