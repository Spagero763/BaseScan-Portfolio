# BaseScan Portfolio

A real-time portfolio tracker for the Base network, featuring vault management, transaction history, and AI-powered portfolio optimization.

## Features

### Core Functionality
- **Wallet Connection** - Connect via MetaMask or any injected wallet
- **ETH Vault** - Deposit and withdraw ETH from a secure smart contract
- **Live Balances** - Real-time balance updates with animated counters
- **Transaction History** - View all your deposits and withdrawals with timestamps

### Analytics & Charts
- **Vault Growth Chart** - Visualize total vault balance over time
- **Activity Pie Chart** - See your deposit/withdrawal distribution
- **24h Change Indicator** - Track daily portfolio performance
- **USD Conversion** - All balances displayed in both ETH and USD

### AI Portfolio Optimizer
- **Risk Assessment** - Analyze your holdings against your risk tolerance
- **Investment Goals** - Get recommendations based on growth, income, or preservation
- **Personalized Insights** - AI-generated strategies for your specific situation

### User Experience
- **Dark/Light Mode** - Full theme support with smooth transitions
- **Mobile Responsive** - Optimized for all screen sizes
- **Gas Estimation** - See estimated fees before confirming transactions
- **Error Handling** - Clear, user-friendly error messages

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Web3**: wagmi + viem for blockchain interactions
- **AI**: Google Genkit for portfolio optimization
- **Charts**: Recharts with custom theming

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet with Base mainnet ETH
- Google AI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/basescan-portfolio.git
cd basescan-portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:9002
GOOGLE_GENAI_API_KEY=your_api_key_here
```

### Running Locally

```bash
# Start the development server
npm run dev

# Start the AI service (separate terminal)
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

## Smart Contract

The vault contract is deployed on Base mainnet:
- **Address**: `0x2d71De053e0DEFbCE58D609E36568d874D07e1a5`
- **View on BaseScan**: [Contract](https://basescan.org/address/0x2d71De053e0DEFbCE58D609E36568d874D07e1a5)

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui primitives
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
└── ai/              # Genkit AI flows
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for Base Builder Rewards • Powered by Base Network
