/**
 * KipuBank Deployment Guide
 *
 * This project uses Hardhat Ignition for deployments (recommended for Hardhat 3).
 *
 * DEPLOYMENT COMMANDS:
 *
 * 1. Test locally (ephemeral, results not saved):
 *    npx hardhat ignition deploy ignition/modules/KipuBank.js
 *
 * 2. Deploy to local Hardhat node (persistent):
 *    Terminal 1: npx hardhat node
 *    Terminal 2: npx hardhat ignition deploy ignition/modules/KipuBank.js --network localhost
 *
 * 3. Deploy to Sepolia testnet:
 *    - Configure .env with PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY
 *    - Get Sepolia ETH from faucets (see copilot-instructions.md)
 *    - Run: npx hardhat ignition deploy ignition/modules/KipuBank.js --network sepolia
 *
 * 4. Verify on Etherscan:
 *    npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "100000000000000000000" "1000000000000000000"
 *
 * DEPLOYMENT PARAMETERS:
 * - Bank Cap: 100 ETH (100000000000000000000 Wei)
 * - Max Withdrawal: 1 ETH (1000000000000000000 Wei)
 *
 * The deployment module is located at: ignition/modules/KipuBank.js
 */

import { parseEther, formatEther } from 'viem';

console.log('� KipuBank Deployment Guide');
console.log('');
console.log('📊 Contract Parameters:');
console.log(`   Bank Cap: ${formatEther(parseEther('100'))} ETH`);
console.log(`   Max Withdrawal: ${formatEther(parseEther('1'))} ETH`);
console.log('');
console.log(
	'� To deploy, use Hardhat Ignition (see comments above for all options):'
);
console.log('');
console.log(
	'   npx hardhat ignition deploy ignition/modules/KipuBank.js --network <NETWORK>'
);
console.log('');
console.log('Available networks: localhost, sepolia');
console.log('');
