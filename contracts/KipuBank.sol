// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title KipuBank
/// @notice A decentralized ETH vault with safety limits
/// @dev Implements CEI pattern and custom errors
contract KipuBank {
    // ========== STATE VARIABLES ==========

    /// @notice Max withdrawal per transaction
    uint256 public immutable MAX_WITHDRAW_PER_TX;

    /// @notice Max total deposits allowed
    uint256 public immutable bankCap;

    /// @notice User vault balances
    mapping(address => uint256) private balances;

    /// @notice User deposit counters
    mapping(address => uint256) private depositCount;

    /// @notice User withdrawal counters
    mapping(address => uint256) private withdrawalCount;

    /// @notice Total deposits in bank
    uint256 public totalDeposits;

    // ========== EVENTS ==========

    /// @notice Emitted on successful deposit
    /// @param user Depositor address
    /// @param amount ETH deposited
    event DepositMade(address indexed user, uint256 amount);

    /// @notice Emitted on successful withdrawal
    /// @param user Withdrawer address
    /// @param amount ETH withdrawn
    event WithdrawalMade(address indexed user, uint256 amount);

    // ========== CUSTOM ERRORS ==========

    /// @notice Deposit exceeds bank cap
    error BankCapExceeded();

    /// @notice Insufficient user balance
    error InsufficientBalance();

    /// @notice Withdrawal exceeds tx limit
    error WithdrawalLimitExceeded();

    /// @notice ETH transfer failed
    error TransferFailed();

    /// @notice Invalid bank cap (zero)
    error InvalidBankCap();

    /// @notice Invalid max withdraw (zero)
    error InvalidMaxWithdraw();

    /// @notice Zero deposit amount
    error ZeroDepositAmount();

    /// @notice Zero withdrawal amount
    error ZeroWithdrawalAmount();

    // ========== MODIFIERS ==========

    /// @notice Validates deposit cap
    /// @param _amount Amount to deposit
    modifier withinBankCap(uint256 _amount) {
        if (totalDeposits + _amount > bankCap) revert BankCapExceeded();
        _;
    }

    /// @notice Validates amount is non-zero
    /// @param _amount Amount to validate
    modifier nonZeroAmount(uint256 _amount) {
        if (_amount == 0) revert ZeroDepositAmount();
        _;
    }

    /// @notice Validates withdrawal
    /// @param _amount Amount to withdraw
    modifier validWithdrawal(uint256 _amount) {
        if (_amount == 0) revert ZeroWithdrawalAmount();
        if (_amount > MAX_WITHDRAW_PER_TX) revert WithdrawalLimitExceeded();
        _;
    }

    // ========== CONSTRUCTOR ==========

    /// @notice Initializes KipuBank limits
    /// @param _bankCap Max total deposits
    /// @param _maxWithdraw Max per-tx withdrawal
    constructor(uint256 _bankCap, uint256 _maxWithdraw) {
        if (_bankCap == 0) revert InvalidBankCap();
        if (_maxWithdraw == 0) revert InvalidMaxWithdraw();

        bankCap = _bankCap;
        MAX_WITHDRAW_PER_TX = _maxWithdraw;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /// @notice Deposit ETH to vault
    /// @dev Emits DepositMade event
    function deposit()
        external
        payable
        withinBankCap(msg.value)
        nonZeroAmount(msg.value)
    {
        // Effects
        balances[msg.sender] += msg.value;
        depositCount[msg.sender] += 1;
        totalDeposits += msg.value;

        emit DepositMade(msg.sender, msg.value);
    }

    /// @notice Withdraw ETH from vault
    /// @dev Uses CEI pattern
    /// @param amount ETH to withdraw
    function withdraw(uint256 amount) external validWithdrawal(amount) {
        // Cache storage read
        uint256 userBalance = balances[msg.sender];

        // Checks
        if (amount > userBalance) revert InsufficientBalance();

        // Effects (use unchecked for safe math)
        unchecked {
            balances[msg.sender] = userBalance - amount;
            totalDeposits -= amount;
        }
        withdrawalCount[msg.sender] += 1;

        emit WithdrawalMade(msg.sender, amount);

        // Interactions
        _safeTransfer(msg.sender, amount);
    }

    /// @notice Get user vault balance
    /// @param user Address to query
    /// @return User balance
    function getVaultBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /// @notice Get user deposit count
    /// @param user Address to query
    /// @return Deposit count
    function getDepositCount(address user) external view returns (uint256) {
        return depositCount[user];
    }

    /// @notice Get user withdrawal count
    /// @param user Address to query
    /// @return Withdrawal count
    function getWithdrawalCount(address user) external view returns (uint256) {
        return withdrawalCount[user];
    }

    // ========== PRIVATE FUNCTIONS ==========

    /// @notice Safe ETH transfer
    /// @param to Recipient address
    /// @param amount ETH to transfer
    function _safeTransfer(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
