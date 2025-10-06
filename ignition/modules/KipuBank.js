import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { parseEther } from 'viem';

// Deployment parameters from PRD
const BANK_CAP = parseEther('100'); // 100 ETH
const MAX_WITHDRAW = parseEther('1'); // 1 ETH per transaction

const KipuBankModule = buildModule('KipuBankModule', (m) => {
	// Deploy KipuBank with constructor parameters
	const kipuBank = m.contract('KipuBank', [BANK_CAP, MAX_WITHDRAW]);

	return { kipuBank };
});

export default KipuBankModule;
