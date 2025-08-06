# HiveMinds - Decentralized AI Compute Marketplace

![HiveMinds Banner](public/file.svg)

## 🏆 Hackathon Submission - August 2025

**HiveMinds** is breaking the AI compute monopoly by creating an open marketplace where anyone can purchase or sell compute power through a global network, making AI training cheaper, faster, and more accessible to everyone.

## 💡 The Problem

Training AI models is expensive and compute resources are controlled by a few large corporations. This creates:
- High barriers to entry for researchers and startups
- Centralization of AI power in a few hands
- Limited innovation potential for the wider community

## 🔮 Our Solution

HiveMinds creates a decentralized marketplace that:
- Connects idle compute resources with AI researchers needing processing power
- Uses blockchain technology for secure, transparent transactions
- Reduces costs through competitive market dynamics
- Democratizes access to AI training capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Blockchain**: Hedera Hashgraph for fast, secure transactions
- **Wallet Integration**: HashPack
- **Data Storage**: AWS S3 + Supabase
- **Job Scheduling**: Custom distributed computation framework

## 🚀 Quick Demo

### 1. Install & Run
```bash
npm install
npm run dev
```

### 2. Test the App
1. **Authentication**: Register/login with email
2. **Wallet Connection**: 
   - Install HashPack extension from [hashpack.app](https://www.hashpack.app/)
   - Connect your Hedera wallet through the Chrome extension
3. **Dashboard**: View available compute nodes, marketplace listings, and your account
4. **Dataset Management**: Upload and manage your training datasets
5. **Job Creation**: Submit AI training jobs to the network

## 🧪 Testing Options

### Prerequisite: HashPack Wallet
1. Install HashPack extension from [hashpack.app](https://www.hashpack.app/)
2. Create or import a Hedera account
3. Connect through the "Connect HashPack Wallet" button
4. Test wallet integration and marketplace features

**Note**: A HashPack wallet is required to use the application. There is no demo mode - all interactions require a real Hedera wallet connection through the HashPack extension.

## 📝 Environment Setup

```bash
# Supabase (✅ Configured)
NEXT_PUBLIC_SUPABASE_URL=https://obrbkpuyysevdmzieyix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Optional: WalletConnect (for future features)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## 🌟 Hackathon Features

For this hackathon, we've focused on demonstrating:

1. **Seamless Wallet Integration** - Connect your Hedera wallet in one click
2. **Dataset Management** - Upload, view, and sell training datasets
3. **Job Submission Pipeline** - Create and submit AI training jobs to the network
4. **Interactive Network Visualization** - See compute resources in real-time
5. **Secure Marketplace Transactions** - Purchase compute with transparent pricing

## 🔮 Future Roadmap

- **Provider Onboarding**: Allow users to offer their compute resources
- **Advanced Job Scheduling**: Optimize job distribution across the network
- **Enhanced Security Measures**: Additional verification for sensitive datasets
- **Custom Model Templates**: Pre-configured AI models for common use cases
- **Mobile App**: Access the marketplace on the go

## 👥 Team

Our team combines expertise in blockchain, distributed systems, and AI to create the next generation of compute infrastructure. We believe in a future where AI training is accessible to everyone, not just those with massive resources.

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/HiveMinds)
- [Demo Video](https://youtu.be/demo-link)
- [Presentation Slides](https://slides.com/hiveminds)
- [Contact Us](mailto:team@hiveminds.ai)

---

*Built with ❤️ for the future of decentralized AI*
