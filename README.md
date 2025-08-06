# HiveMind - AI Compute Marketplace

Breaking the AI compute monopoly by creating an open marketplace where anyone can purchase a global network of compute to train their models, cheaper and faster.

## 🚀 Quick Start
### 1. Install & Run
```bash
npm install
npm run dev
```

### 2. Test the App
1. **Authentication**: Register/login with email
2. **Wallet Connection**: 
   - Install HashPack extension for real wallet
   - Or use the "Demo Wallet" for testing
3. **Dashboard**: View account status and marketplace preview

## Technologies

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Blockchain**: Hedera Hashgraph
- **Wallet**: HashPack integration

### Key Technologies
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Blockchain**: Hedera Hashgraph
- **Wallet**: HashPack integration

## 🧪 Testing

### Without HashPack
1. Use the "Demo Wallet" component on the dashboard
2. Test the UI flow and state management
3. All features work except actual blockchain transactions

### With HashPack
1. Install HashPack extension from [hashpack.app](https://www.hashpack.app/)
2. Create or import a Hedera account
3. Connect through the "Connect HashPack Wallet" button
4. Test real wallet integration

## 📝 Environment Variables

```bash
# Supabase (✅ Configured)
NEXT_PUBLIC_SUPABASE_URL=https://obrbkpuyysevdmzieyix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Optional: WalletConnect (for future features)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```
