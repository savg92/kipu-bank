import hardhatToolboxViem from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatIgnitionViem from '@nomicfoundation/hardhat-ignition-viem';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const { PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY } = process.env;

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
	etherscan: {
		apiKey: ETHERSCAN_API_KEY || '',
	},
};
