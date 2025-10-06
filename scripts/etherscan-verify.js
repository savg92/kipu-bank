#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const API_KEY = process.env.ETHERSCAN_API_KEY;
if (!API_KEY) {
	console.error('ETHERSCAN_API_KEY not set in environment (.env)');
	process.exit(1);
}

const BUILD_INFO_PATH = path.resolve(
	process.cwd(),
	'artifacts/build-info/solc-0_8_24-0226551e69b495246b67c792bf5a45612b5cd2f4.json'
);

if (!fs.existsSync(BUILD_INFO_PATH)) {
	console.error('Build info not found at', BUILD_INFO_PATH);
	process.exit(1);
}

const buildInfo = JSON.parse(fs.readFileSync(BUILD_INFO_PATH, 'utf8'));
if (!buildInfo.input) {
	console.error('Build info missing input object');
	process.exit(1);
}
// We'll send the standard JSON input, but Etherscan also expects some top-level fields
const standardInput = JSON.stringify(buildInfo.input);

// Extract helpful compiler metadata to include as form fields
let compilerLongVersion =
	buildInfo.solcLongVersion || `v${buildInfo.solcVersion}`;
if (!compilerLongVersion.startsWith('v'))
	compilerLongVersion = `v${compilerLongVersion}`;
const optimizerEnabled =
	buildInfo.input.settings.optimizer &&
	buildInfo.input.settings.optimizer.enabled
		? '1'
		: '0';
const optimizerRuns =
	buildInfo.input.settings.optimizer && buildInfo.input.settings.optimizer.runs
		? String(buildInfo.input.settings.optimizer.runs)
		: '200';
const evmVersion = buildInfo.input.settings.evmVersion || '';

// Constructor args: 100 ETH and 1 ETH (wei) concatenated hex
const constructorArgsHex =
	'0000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000de0b6b3a7640000';

async function postVerification() {
	const url = 'https://api-sepolia.etherscan.io/api';
	const form = new FormData();
	form.append('module', 'contract');
	form.append('action', 'verifysourcecode');
	form.append('apikey', API_KEY);
	form.append('contractaddress', '0x0eFbf4be712Ed78f899b306B5d919Bb167676ebe');
	form.append('contractname', 'project/contracts/KipuBank.sol:KipuBank');
	form.append('codeformat', 'solidity-standard-json-input');
	form.append('sourceCode', standardInput);
	// Etherscan API expects this exact misspelled key for constructor args historically, but
	// the API is flexible; include both the correct and the historical forms to be safe.
	form.append('constructorArguements', constructorArgsHex);
	form.append('constructorArgs', constructorArgsHex);

	// Include compiler metadata fields which Etherscan may require separately
	form.append('compilerversion', compilerLongVersion); // e.g. v0.8.24+commit.e11b9ed9
	form.append('optimizationUsed', optimizerEnabled); // 1 = enabled, 0 = not
	form.append('runs', optimizerRuns);
	if (evmVersion) form.append('evmVersion', evmVersion);

	const res = await fetch(url, { method: 'POST', body: form });
	const json = await res.json();
	return json;
}

async function checkStatus(guid) {
	const url = `https://api-sepolia.etherscan.io/api?module=contract&action=checkverifystatus&guid=${guid}&apikey=${API_KEY}`;
	const res = await fetch(url);
	return res.json();
}

(async () => {
	try {
		console.log('Submitting verification to Etherscan Sepolia...');
		const submitResp = await postVerification();
		// console.log('submitResp', submitResp);
		if (submitResp.status !== '1') {
			console.error('Etherscan submission failed:', submitResp);
			process.exit(1);
		}
		const guid = submitResp.result;
		console.log('Submission GUID:', guid);

		for (let i = 0; i < 20; i++) {
			await new Promise((r) => setTimeout(r, 3000));
			const statusResp = await checkStatus(guid);
			// console.log('statusResp', statusResp);
			if (statusResp.status === '1') {
				console.log('Verified:', statusResp.result);
				process.exit(0);
			}
			if (statusResp.status === '0') {
				const msg = statusResp.result || 'Unknown';
				if (/Fail/i.test(msg) || /fail/i.test(msg) || /error/i.test(msg)) {
					console.error('Verification failed:', msg);
					process.exit(1);
				}
				console.log('Pending:', msg);
			}
		}
		console.error('Timed out waiting for verification.');
		process.exit(2);
	} catch (err) {
		console.error('Error during verification:', err.message || err);
		process.exit(1);
	}
})();
