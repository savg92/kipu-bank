// Preflight checks for Sepolia deployment
// Ensures PRIVATE_KEY, SEPOLIA_RPC_URL, and ETHERSCAN_API_KEY are valid
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const errors = [];

const { PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY } = process.env;

const isHexPrivateKey = (s) =>
	typeof s === 'string' && /^0x[0-9a-fA-F]{64}$/.test(s);

if (!isHexPrivateKey(PRIVATE_KEY)) {
	errors.push(
		'PRIVATE_KEY must be a 0x-prefixed, 64-hex-character key (total length 66). Example: 0xabc...'
	);
}

if (!SEPOLIA_RPC_URL) {
	errors.push(
		'SEPOLIA_RPC_URL is required (Infura or Alchemy Sepolia endpoint).'
	);
} else if (!/sepolia/i.test(SEPOLIA_RPC_URL)) {
	errors.push(
		'SEPOLIA_RPC_URL does not look like a Sepolia endpoint. It should include "sepolia".'
	);
}

if (!ETHERSCAN_API_KEY || ETHERSCAN_API_KEY === 'your_etherscan_api_key_here') {
	console.warn(
		'[warn] ETHERSCAN_API_KEY is missing or placeholder. Verification will fail.'
	);
}

if (errors.length) {
	console.error(
		'\nPreflight failed for Sepolia deployment:\n- ' + errors.join('\n- ')
	);
	console.error(
		'\nQuick fix:\n' +
			'1) Set PRIVATE_KEY to your wallet private key (0x + 64 hex).\n' +
			'2) Set SEPOLIA_RPC_URL to a Sepolia endpoint (Infura/Alchemy).\n' +
			'3) Fund the wallet with Sepolia ETH.\n'
	);
	process.exit(1);
} else {
	console.log(
		'[ok] Preflight passed: environment looks good for Sepolia deployment.'
	);
}
