# KipuBank

A decentralized ETH vault with safety limits built to showcase production-quality Solidity practices. This project is part of a Web3 learning portfolio and follows strict security and documentation conventions.

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

```bash
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS> \
  "100000000000000000000" "1000000000000000000"
```

## Interact

- Etherscan (recommended): Use Read/Write Contract tabs after verification.
- Hardhat console (example):

```bash
# Replace with your deployed address
export ADDR=0xYourDeployedAddress

# Open console on Sepolia
npx hardhat console --network sepolia

# In the console (examples with ethers-style if available)
// await ethers.getSigner()
// const bank = await ethers.getContractAt("KipuBank", process.env.ADDR)
// await bank.deposit({ value: ethers.parseEther("0.1") })
// await bank.withdraw(ethers.parseEther("0.05"))
```

Note: For this project we use Ignition + Viem for deployment. Interaction can be done via Etherscan or by writing small scripts. Console examples may vary depending on toolbox configuration.

## Addresses

- Network: Sepolia
- Contract: <to-be-filled-after-deploy>
- Etherscan: <to-be-filled-after-verify>

## Troubleshooting

- Ensure Node.js >= 22.10 for Hardhat 3
- Ensure `.env` values are set and correct
- Get Sepolia ETH from:
  - https://sepoliafaucet.com/
  - https://www.alchemy.com/faucets/ethereum-sepolia

## Project Structure

```
kipu-bank/
├── contracts/
│   └── KipuBank.sol
├── ignition/
│   └── modules/
│       └── KipuBank.js
├── scripts/
│   └── deploy.js   # deployment guide
├── hardhat.config.js
└── README.md
```
