# SIR Analytics Platform

Advanced Blockchain AI Readiness Intelligence Dashboard with real-time data integration.

## Features

- **Live Blockchain Data**: Real-time TPS, gas prices, finality, and market data
- **AI Project Analyzer**: Customize rankings based on your specific use case
- **Multi-Network Comparison**: Compare up to 3 networks side-by-side
- **Cost Calculator**: Calculate transaction costs for different networks
- **Predictions & Analytics**: 6-month forecasts and market correlation analysis

## Currently Supported Live Data

### Base (Coinbase L2) ✅
- **TPS**: Real-time transaction per second calculation from recent blocks
- **Gas Price**: Live gas prices from Base RPC
- **Market Data**: Price, market cap, volume from CoinGecko API
- **TVL**: Total Value Locked from DefiLlama API
- **Finality**: Optimistic rollup finality (7 days)
- **Uptime**: Network reliability metrics

### Ethereum ✅
- **TPS**: Real-time calculation from recent blocks via Etherscan
- **Gas Price**: Live gas prices from Etherscan Gas Oracle
- **Market Data**: Price, market cap, volume from CoinGecko API
- **TVL**: Total Value Locked from DefiLlama API
- **Finality**: Proof of Stake finality (12s)
- **Uptime**: Network reliability metrics

### Solana ✅
- **TPS**: Real-time TPS from Solana Beach API and RPC
- **Transaction Fee**: Live transaction fees in USD
- **Market Data**: Price, market cap, volume from CoinGecko API
- **TVL**: Total Value Locked from DefiLlama API
- **Finality**: Proof of History finality (0.8s)
- **Uptime**: Network reliability metrics

### Polygon ✅
- **TPS**: Real-time calculation from recent blocks via Polygonscan
- **Gas Price**: Live gas prices from Polygonscan Gas Oracle
- **Market Data**: Price, market cap, volume from CoinGecko API
- **TVL**: Total Value Locked from DefiLlama API
- **Finality**: Proof of Stake finality (2.3s)
- **Uptime**: Network reliability metrics

### BSC (Binance Smart Chain) ✅
- **TPS**: Real-time calculation from recent blocks via BscScan
- **Gas Price**: Live gas prices from BscScan Gas Oracle
- **Market Data**: Price, market cap, volume from CoinGecko API
- **TVL**: Total Value Locked from DefiLlama API
- **Finality**: Proof of Staked Authority finality (3s)
- **Uptime**: Network reliability metrics

## API Key Setup

To get the most accurate data, you'll need free API keys for some networks:

### Required API Keys
1. **Etherscan** (for Ethereum): https://etherscan.io/apis
2. **Polygonscan** (for Polygon): https://polygonscan.com/apis  
3. **BscScan** (for BSC): https://bscscan.com/apis

### Setup Instructions
1. Create a `.env` file in your project root
2. Add your API keys:
   ```
   REACT_APP_ETHERSCAN_API_KEY=your_etherscan_key_here
   REACT_APP_POLYGONSCAN_API_KEY=your_polygonscan_key_here
   REACT_APP_BSCSCAN_API_KEY=your_bscscan_key_here
   ```
3. Restart your development server

### Free APIs (No Keys Required)
- **CoinGecko**: Market data for all networks
- **DefiLlama**: TVL data for all networks
- **Base RPC**: Public Base network data
- **Solana RPC**: Public Solana network data

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Data Sources

### Free APIs (No Keys Required)
- **Base RPC**: https://mainnet.base.org
- **Base Blockscout**: https://base.blockscout.com/api/v2
- **Solana RPC**: https://api.mainnet-beta.solana.com
- **Solana Beach**: https://api.solanabeach.io/v1
- **CoinGecko API**: https://api.coingecko.com/api/v3
- **DefiLlama API**: https://api.llama.fi

### APIs Requiring Keys
- **Etherscan API**: https://docs.etherscan.io/
- **Polygonscan API**: https://polygonscan.com/apis
- **BscScan API**: https://bscscan.com/apis

## Visual Indicators

The dashboard shows data quality indicators:
- 🟢 **Live**: Real-time data from APIs
- 🟡 **Estimated**: Fallback data when APIs are unavailable
- 🔵 **Loading**: Data is being fetched
- 🔴 **Error**: API request failed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add live data for a new network
4. Submit a pull request

## License

MIT License
