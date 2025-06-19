// API Keys Configuration
// Get free API keys from these sources:
// - Etherscan: https://etherscan.io/apis (free tier: 5 calls/sec)
// - Polygonscan: https://polygonscan.com/apis (free tier: 5 calls/sec)
// - BscScan: https://bscscan.com/apis (free tier: 5 calls/sec)

export const API_KEYS = {
  ETHERSCAN: process.env.REACT_APP_ETHERSCAN_API_KEY || 'YourApiKeyToken',
  POLYGONSCAN: process.env.REACT_APP_POLYGONSCAN_API_KEY || 'YourApiKeyToken',
  BSCSCAN: process.env.REACT_APP_BSCSCAN_API_KEY || 'YourApiKeyToken',
};

// Instructions for setting up API keys:
// 1. Create a .env file in your project root
// 2. Add your API keys like this:
//    REACT_APP_ETHERSCAN_API_KEY=your_etherscan_key_here
//    REACT_APP_POLYGONSCAN_API_KEY=your_polygonscan_key_here
//    REACT_APP_BSCSCAN_API_KEY=your_bscscan_key_here
// 3. Restart your development server

// Note: CoinGecko and DefiLlama APIs are free and don't require API keys
// Note: Base, Solana, and other networks use public RPC endpoints 