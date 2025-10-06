// Prints the deployed KipuBank address for Sepolia from Ignition artifacts
import fs from 'fs';
import path from 'path';

const CHAIN_ID = '11155111'; // Sepolia
const file = path.resolve(
  process.cwd(),
  `ignition/deployments/chain-${CHAIN_ID}/artifacts/KipuBankModule#KipuBank.json`
);

try {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (content && content.address) {
    process.stdout.write(content.address);
    process.exit(0);
  }
  console.error('Address field not found in artifact JSON.');
  process.exit(1);
} catch (e) {
  console.error('Failed to read address from:', file);
  console.error(e.message);
  process.exit(1);
}
