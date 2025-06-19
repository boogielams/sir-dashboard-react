import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Star, Zap, Search, Heart, Download, AlertTriangle, Eye, Calculator, BarChart3, Activity, Brain, Target, Sparkles, Info } from 'lucide-react';
import solanaLogo from './assets/solana.svg';
import { useBaseData } from './services/blockchainData';
import { useEthereumData } from './services/ethereumData';
import { useSolanaData } from './services/solanaData';
import { usePolygonData } from './services/polygonData';
import { useBSCData } from './services/bscData';
import { createPortal } from 'react-dom';

// Tooltip Component
const InfoTooltip = ({ children, content, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = React.useRef();

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    const rect = ref.current.getBoundingClientRect();
    setCoords({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <span className="relative inline-block" ref={ref}>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center cursor-help"
      >
        {children}
        <Info className="w-4 h-4 text-gray-400 ml-1" />
      </span>
      {showTooltip && typeof window !== 'undefined' && createPortal(
        <div
          className={`fixed z-[9999]`}
          style={{
            left: coords.x,
            top: position === 'top' ? coords.y - 12 : coords.y + 32
          }}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 max-w-xs shadow-lg border relative">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}></div>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
};

// Network Logo Component with actual blockchain logos
const NetworkLogo = ({ network, size = 'text-3xl', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Map size classes to actual dimensions
  const sizeMap = {
    'text-lg': 'w-6 h-6',
    'text-xl': 'w-7 h-7', 
    'text-2xl': 'w-8 h-8',
    'text-3xl': 'w-10 h-10',
    'text-4xl': 'w-12 h-12'
  };
  
  const getLogoUrl = (networkId) => {
    const logoUrls = {
      'solana': solanaLogo,
      'ethereum': 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      'polygon': 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
      'arbitrum': 'https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png',
      'base': 'https://raw.githubusercontent.com/base/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg',
      'sei': 'https://cdn.sei.io/assets/Sei_Symbol_Gradient.svg',
      'sui': 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
      'optimism': 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png',
      'avalanche': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
      'bsc': 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    };
    
    return logoUrls[networkId] || null;
  };
  
  const logoUrl = getLogoUrl(network.id);
  
  // Reset loading/error state when logoUrl changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [logoUrl]);
  
  // If no logo URL or image failed to load, show fallback
  if (!logoUrl || imageError) {
    return (
      <div className={`${sizeMap[size] || 'w-8 h-8'} flex items-center justify-center bg-gray-100 rounded-full ${className}`}>
        <span className="text-lg font-bold text-gray-600">
          {network.logoFallback}
        </span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <img
        src={logoUrl}
        alt={`${network.name} logo`}
        className={`${sizeMap[size] || 'w-8 h-8'} object-contain rounded-full ${className}`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        style={{ 
          display: imageLoaded ? 'block' : 'none',
          backgroundColor: 'white'
        }}
      />
      {!imageLoaded && (
        <div className={`${sizeMap[size] || 'w-8 h-8'} flex items-center justify-center bg-gray-100 rounded-full animate-pulse`}>
          <span className="text-lg font-bold text-gray-600">
            {network.logoFallback}
          </span>
        </div>
      )}
    </div>
  );
};

// Enhanced mock data with more detailed metrics
const mockNetworks = [
  {
    id: 'solana',
    name: 'Solana',
    logoFallback: '◉',
    tier: 'S',
    score: 91.3,
    rank: 1,
    change24h: -0.8,
    change7d: 2.1,
    change30d: 8.4,
    speed: 92,
    cost: 88,
    reliability: 75,
    devExp: 95,
    liquidity: 98,
    security: 85,
    parallel: 85,
    payments: 92,
    marketCap: '$89.2B',
    volume24h: '$2.1B',
    tps: 3000,
    finality: '0.8s',
    gasPrice: '$0.002',
    uptime: 98.1,
    ecosystem: 'Mature',
    founded: 2020,
    consensus: 'Proof of History',
    prediction6m: 90.8,
    marketCorrelation: 0.85,
    developerActivity: 95,
    communitySize: 180000,
    partnerships: 45,
    githubStars: 12500
  },
  {
    id: 'base',
    name: 'Base',
    logoFallback: '🔵',
    tier: 'A',
    score: 87.2,
    rank: 3,
    change24h: 1.5,
    change7d: 3.2,
    change30d: 15.7,
    speed: 75,
    cost: 85,
    reliability: 88,
    devExp: 92,
    liquidity: 89,
    security: 90,
    parallel: 0,
    payments: 88,
    marketCap: '$8.1B',
    volume24h: '$456M',
    tps: 100,
    finality: '2.1s',
    gasPrice: '$0.05',
    uptime: 99.2,
    ecosystem: 'Growing',
    founded: 2023,
    consensus: 'Optimistic Rollup',
    prediction6m: 89.1,
    marketCorrelation: 0.92,
    developerActivity: 78,
    communitySize: 67000,
    partnerships: 31,
    githubStars: 8900
  },
  {
    id: 'sei',
    name: 'Sei',
    logoFallback: '⚡',
    tier: 'A',
    score: 84.1,
    rank: 1,
    change24h: 2.1,
    change7d: 5.3,
    change30d: 12.1,
    speed: 98,
    cost: 95,
    reliability: 89,
    devExp: 65,
    liquidity: 45,
    security: 82,
    parallel: 100,
    payments: 85,
    marketCap: '$2.4B',
    volume24h: '$145M',
    tps: 12000,
    finality: '0.4s',
    gasPrice: '$0.0008',
    uptime: 99.2,
    ecosystem: 'Emerging',
    founded: 2022,
    consensus: 'Tendermint',
    prediction6m: 88.5,
    marketCorrelation: 0.73,
    developerActivity: 72,
    communitySize: 45000,
    partnerships: 23,
    githubStars: 1250
  },
  {
    id: 'sui',
    name: 'Sui',
    logoFallback: '🔷',
    tier: 'A',
    score: 82.3,
    rank: 4,
    change24h: 1.8,
    change7d: 4.2,
    change30d: 18.5,
    speed: 95,
    cost: 90,
    reliability: 85,
    devExp: 75,
    liquidity: 55,
    security: 88,
    parallel: 95,
    payments: 80,
    marketCap: '$3.2B',
    volume24h: '$89M',
    tps: 8000,
    finality: '0.5s',
    gasPrice: '$0.001',
    uptime: 99.5,
    ecosystem: 'Emerging',
    founded: 2022,
    consensus: 'Proof of Stake',
    prediction6m: 86.2,
    marketCorrelation: 0.68,
    developerActivity: 68,
    communitySize: 35000,
    partnerships: 28,
    githubStars: 2100
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    logoFallback: '🔷',
    tier: 'B',
    score: 74.1,
    rank: 5,
    change24h: 0.3,
    change7d: -1.1,
    change30d: 4.2,
    speed: 65,
    cost: 82,
    reliability: 88,
    devExp: 89,
    liquidity: 91,
    security: 92,
    parallel: 0,
    payments: 68,
    marketCap: '$15.3B',
    volume24h: '$892M',
    tps: 40,
    finality: '7.2s',
    gasPrice: '$0.08',
    uptime: 99.1,
    ecosystem: 'Mature',
    founded: 2021,
    consensus: 'Optimistic Rollup',
    prediction6m: 76.3,
    marketCorrelation: 0.88,
    developerActivity: 82,
    communitySize: 95000,
    partnerships: 52,
    githubStars: 6700
  },
  {
    id: 'optimism',
    name: 'Optimism',
    logoFallback: '🟠',
    tier: 'B',
    score: 72.8,
    rank: 6,
    change24h: 0.8,
    change7d: 2.1,
    change30d: 6.8,
    speed: 70,
    cost: 80,
    reliability: 85,
    devExp: 88,
    liquidity: 85,
    security: 90,
    parallel: 0,
    payments: 70,
    marketCap: '$12.1B',
    volume24h: '$567M',
    tps: 45,
    finality: '6.5s',
    gasPrice: '$0.06',
    uptime: 99.3,
    ecosystem: 'Mature',
    founded: 2021,
    consensus: 'Optimistic Rollup',
    prediction6m: 75.1,
    marketCorrelation: 0.85,
    developerActivity: 79,
    communitySize: 82000,
    partnerships: 41,
    githubStars: 5200
  },
  {
    id: 'polygon',
    name: 'Polygon',
    logoFallback: '🟣',
    tier: 'B',
    score: 71.8,
    rank: 7,
    change24h: -1.2,
    change7d: -2.8,
    change30d: 1.5,
    speed: 72,
    cost: 85,
    reliability: 82,
    devExp: 86,
    liquidity: 78,
    security: 84,
    parallel: 0,
    payments: 65,
    marketCap: '$11.7B',
    volume24h: '$623M',
    tps: 350,
    finality: '2.3s',
    gasPrice: '$0.001',
    uptime: 98.8,
    ecosystem: 'Mature',
    founded: 2017,
    consensus: 'Proof of Stake',
    prediction6m: 73.2,
    marketCorrelation: 0.79,
    developerActivity: 73,
    communitySize: 120000,
    partnerships: 67,
    githubStars: 4500
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    logoFallback: '❄️',
    tier: 'B',
    score: 68.5,
    rank: 8,
    change24h: -0.5,
    change7d: 1.2,
    change30d: 3.8,
    speed: 78,
    cost: 75,
    reliability: 80,
    devExp: 82,
    liquidity: 72,
    security: 85,
    parallel: 60,
    payments: 62,
    marketCap: '$8.9B',
    volume24h: '$345M',
    tps: 4500,
    finality: '3s',
    gasPrice: '$0.02',
    uptime: 99.7,
    ecosystem: 'Mature',
    founded: 2020,
    consensus: 'Proof of Stake',
    prediction6m: 70.8,
    marketCorrelation: 0.82,
    developerActivity: 71,
    communitySize: 88000,
    partnerships: 38,
    githubStars: 3800
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    logoFallback: '🟡',
    tier: 'C',
    score: 65.2,
    rank: 9,
    change24h: 0.2,
    change7d: -0.8,
    change30d: 2.1,
    speed: 85,
    cost: 70,
    reliability: 75,
    devExp: 78,
    liquidity: 88,
    security: 72,
    parallel: 0,
    payments: 75,
    marketCap: '$45.2B',
    volume24h: '$1.8B',
    tps: 300,
    finality: '3s',
    gasPrice: '$0.15',
    uptime: 99.2,
    ecosystem: 'Mature',
    founded: 2020,
    consensus: 'Proof of Staked Authority',
    prediction6m: 67.5,
    marketCorrelation: 0.75,
    developerActivity: 65,
    communitySize: 150000,
    partnerships: 89,
    githubStars: 2800
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    logoFallback: '💎',
    tier: 'C',
    score: 58.2,
    rank: 10,
    change24h: 0.1,
    change7d: -0.5,
    change30d: -2.1,
    speed: 25,
    cost: 35,
    reliability: 95,
    devExp: 98,
    liquidity: 100,
    security: 100,
    parallel: 0,
    payments: 58,
    marketCap: '$445.8B',
    volume24h: '$12.4B',
    tps: 15,
    finality: '15s',
    gasPrice: '$2.50',
    uptime: 99.95,
    ecosystem: 'Dominant',
    founded: 2015,
    consensus: 'Proof of Stake',
    prediction6m: 62.1,
    marketCorrelation: 1.0,
    developerActivity: 98,
    communitySize: 500000,
    partnerships: 200,
    githubStars: 45000
  }
];

const useCaseWeights = {
  general: { speed: 24, cost: 22, reliability: 19, devExp: 15, liquidity: 5, security: 5, parallel: 5, payments: 5 },
  trading: { speed: 20, cost: 20, reliability: 15, devExp: 5, liquidity: 12, security: 8, parallel: 5, payments: 15 },
  service: { speed: 20, cost: 30, reliability: 15, devExp: 15, liquidity: 3, security: 5, parallel: 2, payments: 10 },
  enterprise: { speed: 15, cost: 10, reliability: 25, devExp: 18, liquidity: 3, security: 15, parallel: 2, payments: 7 }
};

const tierColors = {
  S: { bg: 'bg-gradient-to-r from-yellow-400 to-orange-500', text: 'text-white', border: 'border-yellow-400', light: 'bg-yellow-50', accent: '#f59e0b' },
  A: { bg: 'bg-gradient-to-r from-green-400 to-blue-500', text: 'text-white', border: 'border-green-400', light: 'bg-green-50', accent: '#10b981' },
  B: { bg: 'bg-gradient-to-r from-blue-400 to-purple-500', text: 'text-white', border: 'border-blue-400', light: 'bg-blue-50', accent: '#3b82f6' },
  C: { bg: 'bg-gradient-to-r from-gray-400 to-gray-600', text: 'text-white', border: 'border-gray-400', light: 'bg-gray-50', accent: '#6b7280' },
  D: { bg: 'bg-gradient-to-r from-red-400 to-pink-500', text: 'text-white', border: 'border-red-400', light: 'bg-red-50', accent: '#f87171' },
  F: { bg: 'bg-gradient-to-r from-red-600 to-red-800', text: 'text-white', border: 'border-red-600', light: 'bg-red-50', accent: '#dc2626' }
};

// Generate comprehensive historical data
const generateHistoricalData = (baseScore, days = 90) => {
  const data = [];
  let currentScore = baseScore;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add realistic score evolution
    const volatility = Math.random() * 4 - 2; // -2 to +2
    const trend = (Math.random() - 0.5) * 0.5; // Small trend component
    currentScore = Math.max(0, Math.min(100, currentScore + volatility + trend));
    
    data.push({
      date: date.toISOString().split('T')[0],
      score: currentScore,
      timestamp: date.getTime(),
      volume: Math.random() * 1000000000,
      transactions: Math.floor(Math.random() * 50000),
      activeUsers: Math.floor(Math.random() * 10000)
    });
  }
  return data;
};

const SIRDashboard = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('general');
  const [selectedNetwork, setSelectedNetwork] = useState('sei');
  const [selectedNetworks, setSelectedNetworks] = useState(['sei']);
  const [timeframe, setTimeframe] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(['sei']);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAlerts, setShowAlerts] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customWeights, setCustomWeights] = useState(null);
  const [costCalculator, setCostCalculator] = useState({
    transactions: 1000,
    frequency: 'daily',
    complexity: 'simple'
  });
  
  const [historicalData, setHistoricalData] = useState({});

  // Fetch real Base data
  const { data: baseData, loading: baseLoading, error: baseError } = useBaseData(30000); // Refresh every 30 seconds

  // Fetch real data for all networks
  const { data: ethData, loading: ethLoading, error: ethError } = useEthereumData(30000);
  const { data: solData, loading: solLoading, error: solError } = useSolanaData(30000);
  const { data: polygonData, loading: polygonLoading, error: polygonError } = usePolygonData(30000);
  const { data: bscData, loading: bscLoading, error: bscError } = useBSCData(30000);

  // Merge real Base data with mock data
  const getNetworksWithLiveData = useCallback(() => {
    if (!baseData && !ethData && !solData && !polygonData && !bscData) return mockNetworks;
    
    return mockNetworks.map(network => {
      if (network.id === 'base' && baseData) {
        return {
          ...network,
          tps: baseData.tps || network.tps,
          gasPrice: baseData.gasPrice || network.gasPrice,
          finality: baseData.finality || network.finality,
          uptime: baseData.uptime || network.uptime,
          marketCap: baseData.marketCap || network.marketCap,
          volume24h: baseData.volume24h || network.volume24h,
          change24h: baseData.priceChange24h || network.change24h,
          lastUpdated: baseData.lastUpdated,
          isLiveData: true,
          dataQuality: baseData.dataQuality
        };
      }
      if (network.id === 'ethereum' && ethData) {
        return {
          ...network,
          tps: ethData.tps || network.tps,
          gasPrice: ethData.gasPrice || network.gasPrice,
          finality: ethData.finality || network.finality,
          uptime: ethData.uptime || network.uptime,
          marketCap: ethData.marketCap || network.marketCap,
          volume24h: ethData.volume24h || network.volume24h,
          change24h: ethData.priceChange24h || network.change24h,
          lastUpdated: ethData.lastUpdated,
          isLiveData: true,
          dataQuality: ethData.dataQuality
        };
      }
      if (network.id === 'solana' && solData) {
        return {
          ...network,
          tps: solData.tps || network.tps,
          gasPrice: solData.gasPrice || network.gasPrice,
          finality: solData.finality || network.finality,
          uptime: solData.uptime || network.uptime,
          marketCap: solData.marketCap || network.marketCap,
          volume24h: solData.volume24h || network.volume24h,
          change24h: solData.priceChange24h || network.change24h,
          lastUpdated: solData.lastUpdated,
          isLiveData: true,
          dataQuality: solData.dataQuality
        };
      }
      if (network.id === 'polygon' && polygonData) {
        return {
          ...network,
          tps: polygonData.tps || network.tps,
          gasPrice: polygonData.gasPrice || network.gasPrice,
          finality: polygonData.finality || network.finality,
          uptime: polygonData.uptime || network.uptime,
          marketCap: polygonData.marketCap || network.marketCap,
          volume24h: polygonData.volume24h || network.volume24h,
          change24h: polygonData.priceChange24h || network.change24h,
          lastUpdated: polygonData.lastUpdated,
          isLiveData: true,
          dataQuality: polygonData.dataQuality
        };
      }
      if (network.id === 'bsc' && bscData) {
        return {
          ...network,
          tps: bscData.tps || network.tps,
          gasPrice: bscData.gasPrice || network.gasPrice,
          finality: bscData.finality || network.finality,
          uptime: bscData.uptime || network.uptime,
          marketCap: bscData.marketCap || network.marketCap,
          volume24h: bscData.volume24h || network.volume24h,
          change24h: bscData.priceChange24h || network.change24h,
          lastUpdated: bscData.lastUpdated,
          isLiveData: true,
          dataQuality: bscData.dataQuality
        };
      }
      return network;
    });
  }, [baseData, ethData, solData, polygonData, bscData]);

  useEffect(() => {
    const data = {};
    getNetworksWithLiveData().forEach(network => {
      data[network.id] = generateHistoricalData(network.score, 90);
    });
    setHistoricalData(data);
  }, [getNetworksWithLiveData]);

  // AI Analysis Functions
  const analyzeProject = (query) => {
    // Simulated AI analysis - in real implementation, this would call an LLM API
    const analysis = {
      'high-frequency trading bot': {
        analysis: "Your HFT bot requires ultra-low latency and consistent execution. Speed and reliability are critical, while cost optimization matters for profitability at scale.",
        weights: { speed: 35, cost: 25, reliability: 20, devExp: 10, liquidity: 5, security: 3, parallel: 1, payments: 1 },
        projectType: "High-Frequency Trading Bot"
      },
      'nft marketplace': {
        analysis: "NFT marketplaces need robust infrastructure for high transaction volumes, good developer tools for complex smart contracts, and strong security for valuable assets.",
        weights: { speed: 20, cost: 15, reliability: 25, devExp: 20, liquidity: 5, security: 10, parallel: 3, payments: 2 },
        projectType: "NFT Marketplace"
      },
      'defi': {
        analysis: "DeFi applications require deep liquidity, battle-tested security, and reliable execution. Developer experience is crucial for complex financial protocols.",
        weights: { speed: 15, cost: 10, reliability: 20, devExp: 15, liquidity: 25, security: 12, parallel: 2, payments: 1 },
        projectType: "DeFi Application"
      },
      'prediction market': {
        analysis: "Prediction markets need real-time data processing, high reliability for accurate settlements, and good liquidity for market makers.",
        weights: { speed: 25, cost: 20, reliability: 25, devExp: 10, liquidity: 15, security: 3, parallel: 1, payments: 1 },
        projectType: "Prediction Market"
      }
    };

    // Simple keyword matching - in reality, this would be much more sophisticated
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('trading') || queryLower.includes('hft') || queryLower.includes('arbitrage')) {
      return analysis['high-frequency trading bot'];
    }
    if (queryLower.includes('nft') || queryLower.includes('marketplace') || queryLower.includes('collectible')) {
      return analysis['nft marketplace'];
    }
    if (queryLower.includes('defi') || queryLower.includes('yield') || queryLower.includes('lending') || queryLower.includes('swap')) {
      return analysis['defi'];
    }
    if (queryLower.includes('prediction') || queryLower.includes('betting') || queryLower.includes('oracle')) {
      return analysis['prediction market'];
    }
    
    // Default analysis for unrecognized queries
    return {
      analysis: "Based on your project description, I've created a balanced weighting that prioritizes performance and reliability while considering your specific requirements.",
      weights: { speed: 24, cost: 22, reliability: 19, devExp: 15, liquidity: 8, security: 7, parallel: 3, payments: 2 },
      projectType: "Custom AI Agent Project"
    };
  };

  const handleAiAnalysis = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = analyzeProject(aiQuery);
    setAiResponse(analysis);
    setIsAnalyzing(false);
  };

  const applyAiWeights = () => {
    if (aiResponse) {
      setCustomWeights(aiResponse.weights);
      setSelectedUseCase('custom');
    }
  };

  const resetToGeneral = () => {
    setCustomWeights(null);
    setSelectedUseCase('general');
    setAiResponse(null);
    setAiQuery('');
  };

  const calculateUseCaseScore = useCallback((network, useCase) => {
    const weights = useCase === 'custom' ? customWeights : useCaseWeights[useCase];
    if (!weights) return network.score;
    
    return (
      (network.speed * weights.speed +
       network.cost * weights.cost +
       network.reliability * weights.reliability +
       network.devExp * weights.devExp +
       network.liquidity * weights.liquidity +
       network.security * weights.security +
       network.parallel * weights.parallel +
       network.payments * weights.payments) / 100
    ).toFixed(1);
  }, [customWeights]);

  const rankedNetworks = useMemo(() => {
    let filtered = getNetworksWithLiveData();
    if (searchTerm) {
      filtered = filtered.filter(network => 
        network.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered
      .map(network => ({
        ...network,
        adjustedScore: parseFloat(calculateUseCaseScore(network, selectedUseCase))
      }))
      .sort((a, b) => b.adjustedScore - a.adjustedScore)
      .map((network, index) => ({ ...network, adjustedRank: index + 1 }));
  }, [selectedUseCase, searchTerm, calculateUseCaseScore, getNetworksWithLiveData]);

  const selectedNetworkData = rankedNetworks.find(n => n.id === selectedNetwork);

  // Advanced analytics calculations
  const trendAnalysis = useMemo(() => {
    return rankedNetworks.map(network => ({
      ...network,
      momentum: (network.change7d + network.change30d) / 2,
      volatility: Math.abs(network.change24h) + Math.abs(network.change7d - network.change24h),
      growthRate: network.change30d / 30
    })).sort((a, b) => b.momentum - a.momentum);
  }, [rankedNetworks]);

  const marketCorrelationData = useMemo(() => {
    return rankedNetworks.map(network => ({
      name: network.name,
      sirScore: network.adjustedScore,
      marketCap: parseFloat(network.marketCap.replace(/[$B]/g, '')),
      correlation: network.marketCorrelation
    }));
  }, [rankedNetworks]);

  const formatChange = (change) => {
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : change < 0 ? TrendingDown : Minus;
    const colorClass = isPositive ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const getDimensionData = (network) => [
    { subject: 'Speed', value: network.speed, fullMark: 100 },
    { subject: 'Cost', value: network.cost, fullMark: 100 },
    { subject: 'Reliability', value: network.reliability, fullMark: 100 },
    { subject: 'Dev Experience', value: network.devExp, fullMark: 100 },
    { subject: 'Liquidity', value: network.liquidity, fullMark: 100 },
    { subject: 'Security', value: network.security, fullMark: 100 },
    { subject: 'Parallel', value: network.parallel, fullMark: 100 },
    { subject: 'Payments', value: network.payments, fullMark: 100 }
  ];

  const toggleFavorite = (networkId) => {
    setFavorites(prev => 
      prev.includes(networkId) 
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    );
  };

  const calculateCosts = () => {
    const multiplier = costCalculator.frequency === 'daily' ? 365 : 
                     costCalculator.frequency === 'weekly' ? 52 : 12;
    const complexityMultiplier = costCalculator.complexity === 'simple' ? 1 : 
                                costCalculator.complexity === 'medium' ? 5 : 20;
    
    return rankedNetworks.map(network => {
      const gasPrice = parseFloat(network.gasPrice.replace('$', ''));
      const annualCost = costCalculator.transactions * gasPrice * complexityMultiplier * multiplier;
      return {
        ...network,
        annualCost,
        monthlyCost: annualCost / 12,
        dailyCost: annualCost / 365
      };
    }).sort((a, b) => a.annualCost - b.annualCost);
  };

  const costAnalysis = calculateCosts();

  const getAlerts = () => {
    const alerts = [];
    rankedNetworks.forEach(network => {
      if (network.change24h < -5) {
        alerts.push({
          type: 'warning',
          title: `${network.name} Score Declined`,
          message: `SIR score dropped ${Math.abs(network.change24h).toFixed(1)}% in 24h`,
          network: network.id
        });
      }
      if (network.uptime < 99) {
        alerts.push({
          type: 'error',
          title: `${network.name} Uptime Alert`,
          message: `Network uptime below 99% (${network.uptime}%)`,
          network: network.id
        });
      }
      if (network.change30d > 10) {
        alerts.push({
          type: 'success',
          title: `${network.name} Strong Growth`,
          message: `SIR score improved ${network.change30d.toFixed(1)}% this month`,
          network: network.id
        });
      }
    });
    return alerts;
  };

  const alerts = getAlerts();

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with AI Chat */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-4xl">🤖</span>
                  SIR Analytics Platform
                </h1>
                <p className="text-gray-600 mt-1">Advanced Blockchain AI Readiness Intelligence</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search networks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="border-t pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">AI Project Analyzer</h3>
                      <InfoTooltip 
                        content={
                          <div>
                            <div className="font-semibold mb-2">Use Case Weighting</div>
                            <div className="text-xs space-y-1">
                              <div><strong>General:</strong> Balanced weights for most AI projects</div>
                              <div><strong>Trading:</strong> Emphasizes speed, cost, and payments</div>
                              <div><strong>Service:</strong> Prioritizes cost and reliability</div>
                              <div><strong>Enterprise:</strong> Focuses on reliability and security</div>
                              <div><strong>Custom:</strong> AI-optimized weights for your specific project</div>
                            </div>
                            <div className="mt-2 text-xs text-gray-300">
                              Weights automatically adjust SIR scores to match your use case.
                            </div>
                          </div>
                        }
                      >
                        <span></span>
                      </InfoTooltip>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Describe your AI agent project and I'll customize the blockchain rankings for your specific needs
                    </p>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., 'I'm building a DeFi trading bot that needs to execute 1000+ transactions per day with minimal latency...'"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiAnalysis()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <button
                        onClick={handleAiAnalysis}
                        disabled={!aiQuery.trim() || isAnalyzing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Response */}
                    {aiResponse && (
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 rounded-full p-1">
                            <Target className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">Custom Analysis for Your Project</h4>
                            <p className="text-sm text-gray-700 mb-3">{aiResponse.analysis}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              {Object.entries(aiResponse.weights).map(([key, weight]) => (
                                <div key={key} className="bg-gray-50 rounded p-2">
                                  <div className="text-xs text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                  </div>
                                  <div className="font-bold text-blue-600">{weight}%</div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={applyAiWeights}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                Apply Custom Weights
                              </button>
                              <button
                                onClick={resetToGeneral}
                                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                              >
                                Reset to General
                              </button>
                              <span className="text-xs text-gray-500">
                                Ranking updated for: <strong>{aiResponse.projectType}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Examples */}
                    {!aiResponse && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Try:</span>
                        {[
                          "High-frequency trading bot",
                          "NFT marketplace with AI curation", 
                          "Cross-chain DeFi yield optimizer",
                          "Real-time prediction market"
                        ].map((example) => (
                          <button
                            key={example}
                            onClick={() => setAiQuery(example)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="flex flex-wrap gap-2">
            <TabButton id="overview" label="Overview" icon={BarChart3} active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="comparison" label="Compare" icon={Eye} active={activeTab === 'comparison'} onClick={setActiveTab} />
            <TabButton id="analytics" label="Analytics" icon={Activity} active={activeTab === 'analytics'} onClick={setActiveTab} />
            <TabButton id="calculator" label="Cost Calculator" icon={Calculator} active={activeTab === 'calculator'} onClick={setActiveTab} />
            <TabButton id="predictions" label="Predictions" icon={Brain} active={activeTab === 'predictions'} onClick={setActiveTab} />
            <TabButton id="alerts" label={`Alerts (${alerts.length})`} icon={AlertTriangle} active={activeTab === 'alerts'} onClick={setActiveTab} />
          </div>
        </div>

        {/* Alerts Panel */}
        {showAlerts && alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Network Alerts
              </h3>
              <button 
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'success' ? 'bg-green-50 border-green-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-red-50 border-red-400'
                }`}>
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Main Leaderboard - First and Prominent */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <InfoTooltip 
                      content={
                        <div>
                          <div className="font-semibold mb-2">SIR Score Framework</div>
                          <div className="space-y-1 text-xs">
                            <div><strong>SIR</strong> = Speed + Intelligence + Reliability</div>
                            <div>• <strong>Speed:</strong> TPS, finality, latency (24%)</div>
                            <div>• <strong>Cost:</strong> Gas fees, transaction costs (22%)</div>
                            <div>• <strong>Reliability:</strong> Uptime, security, stability (19%)</div>
                            <div>• <strong>Dev Experience:</strong> Tooling, documentation, community (15%)</div>
                            <div>• <strong>Liquidity:</strong> TVL, trading volume (5%)</div>
                            <div>• <strong>Security:</strong> Audit history, attack resistance (5%)</div>
                            <div>• <strong>Parallel:</strong> Concurrent processing capability (5%)</div>
                            <div>• <strong>Payments:</strong> Payment infrastructure quality (5%)</div>
                          </div>
                          <div className="mt-2 text-xs text-gray-300">
                            Weights adjust based on your selected use case or AI analysis.
                          </div>
                        </div>
                      }
                    >
                      <h2 className="text-2xl font-bold text-gray-900">AI Readiness Leaderboard</h2>
                    </InfoTooltip>
                    <p className="text-gray-600 mt-1">
                      {customWeights 
                        ? `Custom ranking for: ${aiResponse?.projectType}` 
                        : `Ranked by ${selectedUseCase.replace(/([A-Z])/g, ' $1').toLowerCase()} agent suitability`
                      }
                    </p>
                    {customWeights && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          AI-Optimized Weights
                        </span>
                        <button
                          onClick={resetToGeneral}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Reset to default
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveTab('comparison')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Compare Selected
                    </button>
                    <button 
                      onClick={() => setActiveTab('calculator')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cost Calculator
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Network</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          Tier
                          <InfoTooltip content={<div><div className="font-semibold mb-2">Tier System</div><div className="text-xs space-y-1"><div><strong>S-Tier:</strong> Elite AI-ready networks (90+ score)</div><div><strong>A-Tier:</strong> Excellent performance (80-89 score)</div><div><strong>B-Tier:</strong> Good performance (70-79 score)</div><div><strong>C-Tier:</strong> Adequate performance (60-69 score)</div><div><strong>D-Tier:</strong> Below average (50-59 score)</div><div><strong>F-Tier:</strong> Poor performance (&lt;50 score)</div></div></div>} />
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          SIR Score
                          <InfoTooltip content={<div><div className="font-semibold mb-2">SIR Score</div><div className="text-xs space-y-1"><div>Weighted average of 8 key metrics:</div><div>• Speed (24%): TPS, finality, latency</div><div>• Cost (22%): Gas fees, transaction costs</div><div>• Reliability (19%): Uptime, stability</div><div>• Dev Experience (15%): Tooling, community</div><div>• Liquidity (5%): TVL, trading volume</div><div>• Security (5%): Audit history, attack resistance</div><div>• Parallel (5%): Concurrent processing</div><div>• Payments (5%): Payment infrastructure</div></div></div>} />
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          TPS
                          <InfoTooltip content={<div><div className="font-semibold mb-2">Transactions Per Second</div><div className="text-xs"><div>Real-time calculation from recent blocks</div><div>• Higher TPS = better for high-frequency operations</div><div>• Critical for AI agents requiring fast execution</div><div>• Live data from network APIs when available</div></div></div>} />
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          Finality
                          <InfoTooltip content={<div><div className="font-semibold mb-2">Finality</div><div className="text-xs"><div>Time for transaction to be irreversible</div><div>• Lower = faster settlement</div><div>• Critical for real-time applications</div><div>• Varies by consensus mechanism</div></div></div>} />
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          Gas Price
                          <InfoTooltip content={<div><div className="font-semibold mb-2">Gas Price</div><div className="text-xs"><div>Average cost per transaction</div><div>• Lower = more cost-effective</div><div>• Live data from network gas oracles</div><div>• Affects AI agent operating costs</div></div></div>} />
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">24h Change</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">30d Change</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankedNetworks.map((network) => (
                      <tr 
                        key={network.id} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedNetwork === network.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedNetwork(network.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-900">#{network.adjustedRank}</span>
                            {network.adjustedRank <= 3 && (
                              <span className="ml-2 text-lg">
                                {network.adjustedRank === 1 ? '🥇' : network.adjustedRank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <NetworkLogo network={network} />
                            <div>
                              <div className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                {network.name}
                                {network.isLiveData && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Live
                                  </span>
                                )}
                                {network.id === 'base' && baseLoading && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    Loading...
                                  </span>
                                )}
                                {network.id === 'base' && baseError && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Error
                                  </span>
                                )}
                                {network.id === 'ethereum' && ethLoading && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    Loading...
                                  </span>
                                )}
                                {network.id === 'ethereum' && ethError && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Error
                                  </span>
                                )}
                                {network.id === 'solana' && solLoading && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    Loading...
                                  </span>
                                )}
                                {network.id === 'solana' && solError && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Error
                                  </span>
                                )}
                                {network.id === 'polygon' && polygonLoading && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    Loading...
                                  </span>
                                )}
                                {network.id === 'polygon' && polygonError && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Error
                                  </span>
                                )}
                                {network.id === 'bsc' && bscLoading && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    Loading...
                                  </span>
                                )}
                                {network.id === 'bsc' && bscError && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Error
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{network.ecosystem} ecosystem</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${tierColors[network.tier].bg} ${tierColors[network.tier].text}`}>
                            {network.tier}-Tier
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xl font-bold text-gray-900">{network.adjustedScore}</div>
                          <div className="text-sm text-gray-500">Predicted: {network.prediction6m}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{network.tps.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">transactions/sec</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{network.finality}</div>
                          <div className="text-xs text-gray-500">to finality</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{network.gasPrice}</div>
                          <div className="text-xs text-gray-500">avg transaction</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatChange(network.change24h)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatChange(network.change30d)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(network.id);
                              }}
                              className={`p-2 rounded-lg ${favorites.includes(network.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'} transition-colors`}
                              title="Add to favorites"
                            >
                              <Heart className="w-4 h-4" fill={favorites.includes(network.id) ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNetworks(prev => 
                                  prev.includes(network.id) 
                                    ? prev.filter(id => id !== network.id)
                                    : [...prev, network.id].slice(0, 3)
                                );
                              }}
                              className={`p-2 rounded-lg ${selectedNetworks.includes(network.id) ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'} transition-colors`}
                              title="Add to comparison"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Stats - Now Below Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Top Rated Network</p>
                    <p className="text-2xl font-bold text-gray-900">{rankedNetworks[0]?.name}</p>
                    <p className="text-sm text-gray-600">Score: {rankedNetworks[0]?.adjustedScore}</p>
                  </div>
                  <div className="text-3xl">
                    <NetworkLogo network={rankedNetworks[0]} size="text-3xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(rankedNetworks.reduce((sum, n) => sum + n.adjustedScore, 0) / rankedNetworks.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">Across all networks</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Best Performer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {trendAnalysis[0]?.name}
                    </p>
                    <p className="text-sm text-green-600">+{trendAnalysis[0]?.momentum.toFixed(1)}% momentum</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">S-Tier Networks</p>
                    <p className="text-2xl font-bold text-gray-900">{rankedNetworks.filter(n => n.tier === 'S').length}</p>
                    <p className="text-sm text-gray-600">Elite AI-ready</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Secondary Content in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Network Details */}
              <div className="space-y-6">
                {selectedNetworkData && (
                  <>
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                      <div className="flex items-center gap-3 mb-4">
                        <NetworkLogo network={selectedNetworkData} />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedNetworkData.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tierColors[selectedNetworkData.tier].bg} ${tierColors[selectedNetworkData.tier].text}`}>
                              {selectedNetworkData.tier}-Tier
                            </span>
                            <span className="text-gray-500">#{selectedNetworkData.adjustedRank}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">SIR Score</span>
                          <div className="font-bold text-xl">{selectedNetworkData.adjustedScore}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Prediction</span>
                          <div className="font-bold text-xl">{selectedNetworkData.prediction6m}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">TPS</span>
                          <div className="font-medium">{selectedNetworkData.tps.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Finality</span>
                          <div className="font-medium">{selectedNetworkData.finality}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gas Price</span>
                          <div className="font-medium">{selectedNetworkData.gasPrice}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Uptime</span>
                          <div className="font-medium">{selectedNetworkData.uptime}%</div>
                        </div>
                      </div>
                      
                      {/* Live Data Indicator for Base */}
                      {selectedNetworkData.isLiveData && selectedNetworkData.lastUpdated && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-800 font-medium">Live Data</span>
                            <span className="text-green-600">
                              Last updated: {new Date(selectedNetworkData.lastUpdated).toLocaleTimeString()}
                            </span>
                          </div>
                          {selectedNetworkData.dataQuality && (
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(selectedNetworkData.dataQuality).map(([key, quality]) => (
                                <div key={key} className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${quality === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                  <span className="text-gray-600 capitalize">{key}:</span>
                                  <span className={quality === 'live' ? 'text-green-700' : 'text-yellow-700'}>
                                    {quality}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border">
                      <InfoTooltip 
                        content={
                          <div>
                            <div className="font-semibold mb-2">Performance Profile</div>
                            <div className="text-xs space-y-1">
                              <div>Radar chart showing 8 key dimensions:</div>
                              <div>• <strong>Speed:</strong> TPS, finality, latency</div>
                              <div>• <strong>Cost:</strong> Gas fees, transaction costs</div>
                              <div>• <strong>Reliability:</strong> Uptime, stability</div>
                              <div>• <strong>Dev Experience:</strong> Tooling, community</div>
                              <div>• <strong>Liquidity:</strong> TVL, trading volume</div>
                              <div>• <strong>Security:</strong> Audit history, attack resistance</div>
                              <div>• <strong>Parallel:</strong> Concurrent processing</div>
                              <div>• <strong>Payments:</strong> Payment infrastructure</div>
                            </div>
                          </div>
                        }
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Performance Profile</h4>
                      </InfoTooltip>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={getDimensionData(selectedNetworkData)}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" className="text-xs" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                            <Radar 
                              name={selectedNetworkData.name} 
                              dataKey="value" 
                              stroke={tierColors[selectedNetworkData.tier].accent}
                              fill={tierColors[selectedNetworkData.tier].accent}
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Historical Chart */}
              <div className="space-y-6">
                {selectedNetworkData && historicalData[selectedNetwork] && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {selectedNetworkData.name} Performance History
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData[selectedNetwork]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                            formatter={(value, name) => [
                              name === 'score' ? value.toFixed(1) : value.toLocaleString(),
                              name === 'score' ? 'SIR Score' : 
                              name === 'volume' ? 'Volume ($)' :
                              name === 'transactions' ? 'Transactions' : 'Active Users'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={false}
                            name="score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* Network Comparison */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Network Comparison</h3>
              <p className="text-gray-600 mb-6">Select up to 3 networks to compare (click eye icon in leaderboard)</p>
              
              {selectedNetworks.length > 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Metric</th>
                          {selectedNetworks.map(id => {
                            const network = rankedNetworks.find(n => n.id === id);
                            return (
                              <th key={id} className="text-center py-2">
                                <div className="flex flex-col items-center">
                                  <NetworkLogo network={network} size="text-lg" />
                                  <span className="text-xs">{network?.name}</span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { key: 'adjustedScore', label: 'SIR Score' },
                          { key: 'speed', label: 'Speed' },
                          { key: 'cost', label: 'Cost' },
                          { key: 'reliability', label: 'Reliability' },
                          { key: 'tps', label: 'TPS' },
                          { key: 'finality', label: 'Finality' },
                          { key: 'gasPrice', label: 'Gas Price' }
                        ].map(metric => (
                          <tr key={metric.key} className="border-b">
                            <td className="py-2 font-medium">{metric.label}</td>
                            {selectedNetworks.map(id => {
                              const network = rankedNetworks.find(n => n.id === id);
                              const value = network?.[metric.key];
                              return (
                                <td key={id} className="text-center py-2">
                                  {typeof value === 'number' ? 
                                    (metric.key === 'tps' ? value.toLocaleString() : value) : 
                                    value
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Comparison Radar Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getDimensionData(rankedNetworks.find(n => n.id === selectedNetworks[0]))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" className="text-xs" />
                        <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
                        {selectedNetworks.map((id, index) => {
                          const network = rankedNetworks.find(n => n.id === id);
                          const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                          return (
                            <Radar 
                              key={id}
                              name={network?.name} 
                              dataKey="value" 
                              stroke={colors[index]}
                              fill={colors[index]}
                              fillOpacity={0.1}
                              strokeWidth={2}
                              data={getDimensionData(network)}
                            />
                          );
                        })}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select networks from the leaderboard to compare them here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Market Correlation */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Market Cap vs SIR Score Correlation</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={marketCorrelationData}>
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="marketCap" 
                      name="Market Cap (B)" 
                      tickFormatter={(value) => `$${value}B`}
                    />
                    <YAxis type="number" dataKey="sirScore" name="SIR Score" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sirScore' ? value : `$${value}B`,
                        name === 'sirScore' ? 'SIR Score' : 'Market Cap'
                      ]}
                    />
                    <Scatter dataKey="sirScore" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Momentum Leaders</h3>
                <div className="space-y-3">
                  {trendAnalysis.slice(0, 5).map((network, index) => (
                    <div key={network.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <NetworkLogo network={network} size="text-lg" />
                        <div>
                          <span className="font-medium">{network.name}</span>
                          <div className="text-sm text-gray-600">Momentum: +{network.momentum.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{network.adjustedScore}</div>
                        <div className="text-xs text-green-600">↗ {network.growthRate.toFixed(2)}%/day</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ecosystem Maturity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankedNetworks.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="developerActivity" fill="#3B82F6" name="Developer Activity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Agent Cost Calculator</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transactions per period
                  </label>
                  <input
                    type="number"
                    value={costCalculator.transactions}
                    onChange={(e) => setCostCalculator(prev => ({ ...prev, transactions: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={costCalculator.frequency}
                    onChange={(e) => setCostCalculator(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={costCalculator.complexity}
                    onChange={(e) => setCostCalculator(prev => ({ ...prev, complexity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="simple">Simple (transfers)</option>
                    <option value="medium">Medium (smart contracts)</option>
                    <option value="complex">Complex (multi-step)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Savings vs ETH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {costAnalysis.map((network) => {
                      const ethCost = costAnalysis.find(n => n.id === 'ethereum')?.annualCost || 0;
                      const savings = ((ethCost - network.annualCost) / ethCost * 100);
                      
                      return (
                        <tr key={network.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <NetworkLogo network={network} size="text-lg" />
                              <span className="font-medium">{network.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">${network.dailyCost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">${network.monthlyCost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-bold">${network.annualCost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            {network.id !== 'ethereum' && (
                              <span className={savings > 0 ? 'text-green-600' : 'text-red-600'}>
                                {savings > 0 ? '↓' : '↑'} {Math.abs(savings).toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">6-Month SIR Score Predictions</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankedNetworks.sort((a, b) => b.prediction6m - a.prediction6m)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [value.toFixed(1), 'Predicted Score']} />
                    <Bar dataKey="adjustedScore" fill="#94a3b8" name="Current Score" />
                    <Bar dataKey="prediction6m" fill="#3B82F6" name="Predicted Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Biggest Predicted Gainers</h4>
                <div className="space-y-3">
                  {rankedNetworks
                    .map(n => ({ ...n, gain: n.prediction6m - n.adjustedScore }))
                    .sort((a, b) => b.gain - a.gain)
                    .slice(0, 3)
                    .map(network => (
                      <div key={network.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <NetworkLogo network={network} size="text-lg" />
                          <span className="font-medium">{network.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-bold">+{network.gain.toFixed(1)}</div>
                          <div className="text-xs text-gray-600">{network.adjustedScore} → {network.prediction6m}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h4 className="text-lg font-bold text-gray-900 mb-4">AI Readiness Forecast</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900">Market Outlook</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      AI agent adoption expected to drive demand for high-performance chains
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h5 className="font-semibold text-yellow-900">Key Trends</h5>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Parallel processing becoming critical</li>
                      <li>• Sub-second finality expected standard</li>
                      <li>• Agent-to-agent payment infrastructure emerging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Network Alerts & Notifications</h3>
              
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'success' ? 'bg-green-50 border-green-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-red-50 border-red-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Network: {alert.network}</span>
                            <span className="text-xs text-gray-500">• Just now</span>
                          </div>
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            // Remove alert logic would go here
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active alerts. All networks performing normally.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIRDashboard;
