import hardhatToolboxViem from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatIgnitionViem from '@nomicfoundation/hardhat-ignition-viem';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const { PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY } = process.env;

// Gentle warnings to help avoid common mistakes
if (SEPOLIA_RPC_URL && !/sepolia/i.test(SEPOLIA_RPC_URL)) {
	console.warn(
		'[warn] SEPOLIA_RPC_URL does not include "sepolia". Did you set a mainnet URL by mistake?'
	);
}
if (
	PRIVATE_KEY &&
	!(PRIVATE_KEY.startsWith('0x') && PRIVATE_KEY.length === 66)
) {
	console.warn(
		'[warn] PRIVATE_KEY format looks unusual. Expected 0x + 64 hex characters (length 66).'
	);
}

/** @type import('hardhat/config').HardhatUserConfig */
export default {
	plugins: [hardhatToolboxViem, hardhatIgnitionViem],
	solidity: '0.8.24',
	networks: {
		localhost: {
			type: 'http',
			url: 'http://127.0.0.1:8545',
		},
		sepolia: {
			type: 'http',
			url: SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
			accounts:
				PRIVATE_KEY && PRIVATE_KEY.startsWith('0x') && PRIVATE_KEY.length === 66
					? [PRIVATE_KEY]
					: [],
		},
	},
	// Hardhat v3 uses a new verify config structure
	verify: {
		etherscan: {
			apiKey: ETHERSCAN_API_KEY || '',
			enabled: true,
		},
	},
};
