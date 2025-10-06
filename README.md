# 🏦 KipuBank

> A production-grade decentralized ETH vault with safety limits

**KipuBank** is a Web3 educational portfolio project demonstrating professional Solidity development practices. It implements a secure ETH vault with withdrawal limits, deposit caps, and comprehensive safety patterns.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.0-yellow?logo=ethereum)](https://hardhat.org/)

**🌐 Live on Sepolia**: [View on Etherscan](https://sepolia.etherscan.io/address/0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe) | [View on Blockscout](https://eth-sepolia.blockscout.com/address/0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe)

---

## Features

- Deposit ETH into a personal vault
- Withdraw with a fixed per-transaction limit (immutable)
- Enforced global deposit cap (constructor-set)
- Per-user tracking of deposits and withdrawals
- Events emitted on deposits and withdrawals
- Security-first: custom errors, CEI pattern, safe ETH transfers
- Full NatSpec documentation

## Contract

- Name: `KipuBank`
- File: `contracts/KipuBank.sol`
- Solidity: `0.8.24`

### Core Elements

- Immutable: `MAX_WITHDRAW_PER_TX`
- State: `bankCap`, `balances`, `depositCount`, `withdrawalCount`, `totalDeposits`
- Events: `DepositMade(address indexed user, uint256 amount)`, `WithdrawalMade(address indexed user, uint256 amount)`
- Errors: `BankCapExceeded()`, `InsufficientBalance()`, `WithdrawalLimitExceeded()`, `TransferFailed()`
- Modifier: `withinBankCap(uint256 _amount)`
- Functions:
  - `deposit()` external payable
  - `withdraw(uint256 amount)` external
  - `getVaultBalance(address)` external view
  - `getDepositCount(address)` external view
  - `getWithdrawalCount(address)` external view
  - `_safeTransfer(address,uint256)` private

## Security Patterns

- Checks-Effects-Interactions in withdrawals
- Custom errors instead of string-based require
- Low-level call for ETH transfers with success check
- Immutable limit for max-per-tx

## Prerequisites

- Node.js >= 22.10 (recommended for Hardhat 3)
- npm >= 10

## Setup

```bash
# Clone
git clone https://github.com/savg92/kipu-bank.git
cd kipu-bank

# Install dependencies
npm install

# Configure environment
cp .env.example .env  # if available, else create .env
```

Add to `.env` (do NOT commit real values):

```
PRIVATE_KEY=your_wallet_private_key         # 0x-prefixed, without quotes
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Build

```bash
npx hardhat compile
```

## Deploy

Hardhat 3 uses Hardhat Ignition for deployments. This repo includes an Ignition module at `ignition/modules/KipuBank.js`.

- Ephemeral local (no node needed):

```bash
npx hardhat ignition deploy ignition/modules/KipuBank.js
```

- Persistent local node:

```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat ignition deploy ignition/modules/KipuBank.js --network localhost
```

- Sepolia testnet:

```bash
# Ensure .env is set and you have Sepolia ETH from a faucet
npx hardhat ignition deploy ignition/modules/KipuBank.js --network sepolia
```

Constructor arguments (Wei):

- Bank Cap: `100000000000000000000` (100 ETH)
- Max Withdrawal: `1000000000000000000` (1 ETH)

## Verify on Etherscan

The deployed contract is already verified. To verify a new deployment:

```bash
# Option 1: Hardhat plugin
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS> \
  "100000000000000000000" "1000000000000000000"

# Option 2: Direct API (more reliable)
npm run verify:sepolia:api
```

**Note**: The direct API script (`scripts/etherscan-verify.js`) has proven more reliable than the Hardhat plugin for this configuration.

## Interact with Contract

### Option 1: Etherscan (Recommended)

Visit the verified contract on Etherscan:

- **Read Contract**: View balances, counts, and contract state
- **Write Contract**: Connect wallet and interact (deposit, withdraw)

Direct link: https://sepolia.etherscan.io/address/0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe#writeContract

### Option 2: Custom Scripts

Write Node.js scripts using Viem or Ethers to interact programmatically. Example structure:

```javascript
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const client = createWalletClient({
	account,
	chain: sepolia,
	transport: http(process.env.SEPOLIA_RPC_URL),
});

// Example: deposit 0.1 ETH
// const hash = await client.writeContract({
//   address: '0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe',
//   abi: KipuBankABI,
//   functionName: 'deposit',
//   value: parseEther('0.1')
// });
```

## Deployed Contract

### Sepolia Testnet

- **Contract Address**: `0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe`
- **Etherscan**: https://sepolia.etherscan.io/address/0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe
- **Blockscout**: https://eth-sepolia.blockscout.com/address/0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe
- **Bank Cap**: 100 ETH
- **Max Withdrawal Per Transaction**: 1 ETH

**Status**: ✅ Verified on Etherscan and Blockscout

## Troubleshooting

- Ensure Node.js >= 22.10 for Hardhat 3
- Ensure `.env` values are set and correct (run `npm run preflight` to validate)
- Get Sepolia ETH from:
  - https://sepoliafaucet.com/
  - https://www.alchemy.com/faucets/ethereum-sepolia
- If Hardhat verify fails, use the direct API script: `npm run verify:sepolia:api`

## Project Structure

```
kipu-bank/
├── contracts/
│   └── KipuBank.sol              # Main contract
├── ignition/
│   └── modules/
│       └── KipuBank.js           # Ignition deployment module
├── scripts/
│   ├── etherscan-verify.js      # Direct Etherscan API verification
│   ├── get-address.js           # Read deployed address from Ignition
│   └── preflight.js             # Validate .env configuration
├── .env.example                 # Environment template
├── hardhat.config.js            # Hardhat 3 configuration (ESM)
├── package.json                 # Project dependencies and scripts
└── README.md
```

## Available Scripts

```bash
npm run compile              # Compile contracts
npm run deploy:local         # Deploy to local Hardhat network
npm run deploy:sepolia       # Deploy to Sepolia testnet
npm run verify:sepolia       # Verify on Etherscan (Hardhat plugin)
npm run verify:sepolia:api   # Verify via direct Etherscan API
npm run preflight           # Validate .env configuration
npm run get:address         # Get deployed address from Ignition artifact
```

## Development Notes

This project uses:

- **Hardhat 3** (ESM configuration)
- **Viem** for web3 interactions
- **Hardhat Ignition** for deployments
- Solidity **0.8.24** with optimizer enabled (200 runs)
- EVM target: **Shanghai**

## Author

**Santiago Valenzuela**

- GitHub: [@savg92](https://github.com/savg92)
- Portfolio: [savgdev.vercel.app](http://savgdev.vercel.app)

---

**📚 Educational Project** | Built as part of a Web3 professional development portfolio | ⭐ Star this repo if you found it helpful!
