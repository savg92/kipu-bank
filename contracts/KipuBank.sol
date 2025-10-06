// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title KipuBank
/// @notice A decentralized ETH vault with safety limits for deposits and withdrawals
/// @dev Implements checks-effects-interactions pattern and uses custom errors for gas efficiency
contract KipuBank {
    // ========== STATE VARIABLES ==========

    /// @notice Maximum withdrawal amount per transaction (immutable for security)
    uint256 public immutable MAX_WITHDRAW_PER_TX;

    /// @notice Maximum total deposits the bank can accept
    uint256 public bankCap;

    /// @notice Mapping of user addresses to their vault balances
    mapping(address => uint256) private balances;

    /// @notice Mapping of user addresses to their total number of deposits
    mapping(address => uint256) private depositCount;

    /// @notice Mapping of user addresses to their total number of withdrawals
    mapping(address => uint256) private withdrawalCount;

    /// @notice Total amount deposited across all users
    uint256 public totalDeposits;

    // ========== EVENTS ==========

    /// @notice Emitted when a user successfully deposits ETH
    /// @param user The address of the user making the deposit
    /// @param amount The amount of ETH deposited
    event DepositMade(address indexed user, uint256 amount);

    /// @notice Emitted when a user successfully withdraws ETH
    /// @param user The address of the user making the withdrawal
    /// @param amount The amount of ETH withdrawn
    event WithdrawalMade(address indexed user, uint256 amount);

    // ========== CUSTOM ERRORS ==========

    /// @notice Error thrown when a deposit would exceed the bank's total deposit cap
    error BankCapExceeded();

    /// @notice Error thrown when a user attempts to withdraw more than their balance
    error InsufficientBalance();

    /// @notice Error thrown when a withdrawal amount exceeds the per-transaction limit
    error WithdrawalLimitExceeded();

    /// @notice Error thrown when an ETH transfer fails
    error TransferFailed();

    // ========== MODIFIERS ==========

    /// @notice Validates that a deposit amount doesn't exceed the bank's capacity
    /// @param _amount The amount to be deposited
    modifier withinBankCap(uint256 _amount) {
        if (totalDeposits + _amount > bankCap) revert BankCapExceeded();
        _;
    }

    // ========== CONSTRUCTOR ==========

    /// @notice Initializes the KipuBank contract with deposit and withdrawal limits
    /// @dev Sets immutable MAX_WITHDRAW_PER_TX and state variable bankCap
    /// @param _bankCap The maximum total deposits the bank can accept
    /// @param _maxWithdraw The maximum amount that can be withdrawn per transaction
    constructor(uint256 _bankCap, uint256 _maxWithdraw) {
        require(_bankCap > 0, "Bank cap must be greater than zero");
        require(_maxWithdraw > 0, "Max withdraw must be greater than zero");

        bankCap = _bankCap;
        MAX_WITHDRAW_PER_TX = _maxWithdraw;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /// @notice Allows users to deposit ETH into their personal vault
    /// @dev Uses withinBankCap modifier to ensure deposit doesn't exceed bank capacity
    /// @dev Emits DepositMade event on success
    function deposit() external payable withinBankCap(msg.value) {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        // Effects: Update state before external interactions
        balances[msg.sender] += msg.value;
        depositCount[msg.sender] += 1;
        totalDeposits += msg.value;

        emit DepositMade(msg.sender, msg.value);
    }

    /// @notice Allows users to withdraw ETH from their vault with safety limits
    /// @dev Follows checks-effects-interactions pattern to prevent reentrancy
    /// @dev Emits WithdrawalMade event on success
    /// @param amount The amount of ETH to withdraw
    function withdraw(uint256 amount) external {
        // Checks: Validate withdrawal constraints
        if (amount > MAX_WITHDRAW_PER_TX) revert WithdrawalLimitExceeded();
        if (amount > balances[msg.sender]) revert InsufficientBalance();
        require(amount > 0, "Withdrawal amount must be greater than zero");

        // Effects: Update state before external call
        balances[msg.sender] -= amount;
        withdrawalCount[msg.sender] += 1;
        totalDeposits -= amount;

        emit WithdrawalMade(msg.sender, amount);

        // Interactions: External call comes last
        _safeTransfer(msg.sender, amount);
    }

    /// @notice Returns the vault balance for a specific user
    /// @param user The address to check the balance for
    /// @return The balance of the specified user
    function getVaultBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /// @notice Returns the number of deposits made by a user
    /// @param user The address to check
    /// @return The number of deposits
    function getDepositCount(address user) external view returns (uint256) {
        return depositCount[user];
    }

    /// @notice Returns the number of withdrawals made by a user
    /// @param user The address to check
    /// @return The number of withdrawals
    function getWithdrawalCount(address user) external view returns (uint256) {
        return withdrawalCount[user];
    }

    // ========== PRIVATE FUNCTIONS ==========

    /// @notice Safely transfers ETH to a recipient
    /// @dev Uses low-level call to transfer ETH and checks for success
    /// @param to The recipient address
    /// @param amount The amount of ETH to transfer
    function _safeTransfer(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
