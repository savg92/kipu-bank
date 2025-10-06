# KipuBank AI Coding Agent Instructions

## Project Context

**KipuBank** is a Web3 educational portfolio project for learning professional Solidity development. This is a decentralized ETH vault with safety limits, designed to showcase production-quality smart contract practices.

**Critical**: This is portfolio-grade code that will be publicly showcased on GitHub. Treat all code as production-ready.

## Development Plan

**⚠️ ALWAYS START HERE**: Consult `plan.md` for the complete 6-phase development roadmap with detailed checklists. Follow phases sequentially.

## Current Project State

The project is in **Phase 1: Initial Setup**. The repository contains:

- `PRD.md` — Complete technical specifications (authoritative source)
- `Guide.md` — Educational context (Spanish, reference only)
- `plan.md` — Step-by-step development roadmap
- `.gitignore` — Configured for Node/Hardhat/Solidity projects

**Next Steps**: Follow Phase 1 in `plan.md` to initialize Hardhat environment.

## Contract Requirements (from PRD.md)

### KipuBank.sol Must Include:

**State Variables:**

- `uint256 immutable MAX_WITHDRAW_PER_TX` — Withdrawal limit per transaction
- `uint256 public bankCap` — Global deposit cap (set in constructor)
- `mapping(address => uint256) private balances` — User vault balances
- `mapping(address => uint256) private depositCount` — Deposit counters
- `mapping(address => uint256) private withdrawalCount` — Withdrawal counters
- `uint256 public totalDeposits` — Track total bank deposits

**Events:**

- `DepositMade(address indexed user, uint256 amount)`
- `WithdrawalMade(address indexed user, uint256 amount)`

**Custom Errors:**

- `BankCapExceeded()` — Deposit would exceed bank cap
- `InsufficientBalance()` — User balance too low
- `WithdrawalLimitExceeded()` — Withdrawal exceeds MAX_WITHDRAW_PER_TX
- `TransferFailed()` — ETH transfer failed

**Functions:**

- `constructor(uint256 _bankCap, uint256 _maxWithdraw)` — Initialize limits
- `deposit() external payable` — Deposit ETH with bank cap check
- `withdraw(uint256 amount) external` — Withdraw with limits
- `getVaultBalance(address user) external view returns (uint256)` — Query balance
- `_safeTransfer(address to, uint256 amount) private` — Safe ETH transfer

**Modifier:**

- `withinBankCap(uint256 _amount)` — Validates deposit against bank cap

## Security Patterns (Non-Negotiable)

### 1. Checks-Effects-Interactions

Always update state BEFORE external calls:

```solidity
// ✅ CORRECT
balances[msg.sender] -= amount;
(bool success, ) = msg.sender.call{value: amount}("");

// ❌ WRONG - reentrancy risk
(bool success, ) = msg.sender.call{value: amount}("");
balances[msg.sender] -= amount;
```

### 2. Custom Errors Over require()

```solidity
// ✅ Use custom errors (gas efficient)
error InsufficientBalance();
if (balance < amount) revert InsufficientBalance();

// ❌ Don't use require strings
require(balance >= amount, "Insufficient balance");
```

### 3. Safe ETH Transfers

```solidity
function _safeTransfer(address to, uint256 amount) private {
    (bool success, ) = to.call{value: amount}("");
    if (!success) revert TransferFailed();
}
```

### 4. NatSpec Documentation Required

Every public/external function, event, and error must have NatSpec:

```solidity
/// @notice Deposits ETH into the caller's vault
/// @dev Emits DepositMade event on success, reverts if bank cap exceeded
function deposit() external payable withinBankCap(msg.value) { ... }
```

## Naming Conventions

- **Constants/Immutable**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_WITHDRAW_PER_TX`)
- **Functions**: `camelCase` (e.g., `getVaultBalance`)
- **Private functions**: `_leadingUnderscore` (e.g., `_safeTransfer`)
- **Errors**: `PascalCase` (e.g., `BankCapExceeded`)
- **Events**: `PascalCase` (e.g., `DepositMade`)
- **State variables**: `camelCase` (e.g., `totalDeposits`)

## Target Configuration

- **Solidity Version**: `0.8.24` (specified in PRD)
- **Network**: Sepolia testnet
- **License**: MIT (or as specified)
- **Deployment Parameters**:
  - Bank Cap: 100 ETH
  - Max Withdrawal: 1 ETH

## Development Workflow

### Phase 1: Setup (Current Phase)

```bash
# Install Hardhat
npm install --save-dev hardhat

# Initialize Hardhat (use JavaScript project)
npx hardhat init

# Install additional dependencies
npm install --save-dev @nomicfoundation/hardhat-toolbox dotenv
```

### Phase 2: Smart Contract Development

1. Create `contracts/KipuBank.sol`
2. Implement all required components (see Contract Requirements above)
3. Follow security patterns strictly
4. Add comprehensive NatSpec documentation

### Phase 3: Deployment

**Hardhat 3 uses Hardhat Ignition for deployments.** The Ignition module is at `ignition/modules/KipuBank.js`.

```bash
# Test locally (ephemeral, no node needed)
npx hardhat ignition deploy ignition/modules/KipuBank.js

# Deploy to persistent local node
# Terminal 1:
npx hardhat node
# Terminal 2:
npx hardhat ignition deploy ignition/modules/KipuBank.js --network localhost

# Deploy to Sepolia testnet
# First, configure .env with:
# PRIVATE_KEY=your_sepolia_wallet_private_key
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# ETHERSCAN_API_KEY=your_etherscan_api_key
npx hardhat ignition deploy ignition/modules/KipuBank.js --network sepolia

# Verify on Etherscan (use deployed address from Ignition output)
npx hardhat verify --network sepolia <ADDRESS> "100000000000000000000" "1000000000000000000"
```

## Common Pitfalls to Avoid

- ❌ Using `require("error string")` instead of custom errors
- ❌ Updating state after external calls (reentrancy)
- ❌ Forgetting to check `.call` return value
- ❌ Missing NatSpec on public/external functions
- ❌ Using `msg.value` in non-payable functions
- ❌ Hardcoding Wei values (use ethers utilities)
- ❌ Not validating constructor inputs

## Expected Directory Structure (After Setup)

```
kipu-bank/
├── .github/
│   └── copilot-instructions.md (this file)
├── contracts/
│   └── KipuBank.sol
├── scripts/
│   └── deploy.js
├── test/                        (optional but recommended)
│   └── KipuBank.test.js
├── .env                         (gitignored, contains secrets)
├── .gitignore
├── hardhat.config.js
├── package.json
├── plan.md                      (development roadmap)
├── PRD.md                       (technical specs)
└── README.md                    (user documentation)
```

## Validation Checklist

Before considering any phase complete, verify:

- [ ] Contract compiles: `npx hardhat compile`
- [ ] All PRD requirements implemented (see PRD.md Section 4)
- [ ] Security patterns followed (Checks-Effects-Interactions)
- [ ] NatSpec complete on all public interfaces
- [ ] Tests pass (if tests exist): `npx hardhat test`
- [ ] Deployment successful on Sepolia
- [ ] Contract verified on Etherscan

## Reference Documents Priority

1. **plan.md** — Always check current phase and follow task sequence
2. **PRD.md** — Authoritative technical specifications
3. **This file** — Development patterns and conventions
4. **Guide.md** — Educational context (reference only)

## When in Doubt

1. Check `plan.md` for current phase checklist
2. Refer to `PRD.md` Section 4 for technical requirements
3. Follow security patterns exactly as documented
4. Ask for clarification on ambiguous requirements

## Notes

- This project will evolve across multiple learning modules
- Maintain backward compatibility when adding features
- Always update documentation when code changes
- Commit frequently with clear messages
- Test thoroughly before deployment
