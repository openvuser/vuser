// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Mocking ERC20 for standalone validity in this environment
contract ERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
    }
}

interface IVuserApprovalRegistry {
    function approveWallet(address wallet) external;
    function revokeWallet(address wallet) external;
    function isApproved(address wallet, bytes32 approvalTxHash) external view returns (bool);
}

contract VuserOpenCoin is ERC20, IVuserApprovalRegistry {
    address public treasury;
    mapping(address => bytes32) public approvals;
    mapping(address => uint256) public approvalTimestamps;

    event ApprovalGranted(address indexed wallet, bytes32 txHash);
    event ApprovalRevoked(address indexed wallet, bytes32 txHash);

    constructor() ERC20("Vuser Open Coin", "VOC") {
        treasury = msg.sender;
        _mint(treasury, 1000000000 * 10 ** decimals());
    }

    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury");
        _;
    }

    function approveWallet(address wallet) external override onlyTreasury {
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, wallet));
        approvals[wallet] = txHash;
        approvalTimestamps[wallet] = block.timestamp;
        emit ApprovalGranted(wallet, txHash);
    }

    function revokeWallet(address wallet) external override onlyTreasury {
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, wallet, "revoke"));
        approvals[wallet] = txHash;
        approvalTimestamps[wallet] = block.timestamp;
        emit ApprovalRevoked(wallet, txHash);
    }

    function isApproved(address wallet, bytes32 approvalTxHash) external view override returns (bool) {
        return approvals[wallet] == approvalTxHash && approvalTimestamps[wallet] == _getLatestTimestamp(wallet);
    }

    function executeFundedAction(address recipient, uint256 amount, bytes32 approvalTxHash) external {
        require(isApproved(msg.sender, approvalTxHash), "Invalid or revoked approval");
        _transfer(treasury, recipient, amount);
        // Trigger MCP action logic here
    }

    function _getLatestTimestamp(address wallet) internal view returns (uint256) {
        return approvalTimestamps[wallet];
    }
}
