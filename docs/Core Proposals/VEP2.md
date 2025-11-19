# VEP-1: Vuser Open Coin (VOC) - Treasury-Funded Transactions via Approved Wallets

**Authors:** Prabhath Singh  
**Status:** Draft  
**Created:** 2025-11-19  
**Updated:** 2025-11-19  
**Version:** 1.1  
**Requires:** VUSER Protocol Core (as defined in DevPlan Phases 0-1)  

## Abstract

VUSER is a coalition uniting publishers, users, and AI agents in a decentralized ecosystem. VUSER is a frontend protocol for virtual user actions, where these actions are permitted by the website and performed by an AI agent for a user. It connects various paradigms together, mostly AI & blockchain.

This VEP proposes the introduction of Vuser Open Coin (VOC), a utility token for the VUSER protocol. VOC enables efficient value exchanges, with a key feature being treasury-managed approvals for subsidized transactions. This mechanism allows the treasury (genesis) wallet to approve transacting wallets for funded operations, verifiable by miners, while defaulting to user-funded transactions for non-approved cases. Integration with the Model Context Protocol (MCP) ensures AI agents can execute actions economically, boosting coalition adoption.

## Motivation

VUSER is a coalition uniting publishers, users, and AI agents in a decentralized ecosystem. VUSER is a frontend protocol for virtual user actions, where these actions are permitted by the website and performed by an AI agent for a user. It connects various paradigms together, mostly AI & blockchain.

The VUSER protocol requires a native token to handle permissions, payments, and incentives in a decentralized manner. Current value-exchange contracts (per DevPlan Phase 0) lack a standardized currency and subsidy mechanism, hindering early adoption by users and publishers. VOC addresses this by:

- Providing a utility token for AI-agent actions, staking, and rewards.
- Enabling treasury subsidies via revocable approvals to onboard coalition partners without upfront costs.
- Ensuring security through on-chain verification, aligning with VUSER's privacy-first ethos.
- Facilitating seamless integration with blockchain layers for virtual user operations, connecting AI-driven commands to real-world value transfers.

This enhances the coalition's scalability, reduces friction for AI-performed actions, and promotes ecosystem growth as outlined in DevPlan Phase 4.

## Specification

### Token Standard
VOC follows the ERC-20 standard for fungibility, with extensions for approval mechanics. Deployed on the Vuser blockchain, a fundamental core blockchain derived from the best practices of Ethereum and blockchain.

- **Name:** Vuser Open Coin
- **Symbol:** VOC
- **Decimals:** 18
- **Total Supply:** Undefined.

### Initial Allocation
- Treasury/Genesis Wallet: 10^80
- Community/Coalition Partners: 0
- Development Fund: 0
- Liquidity Pools: 0

### Utility Functions
- Payments for MCP actions (e.g., publisher fees via value-exchange contracts).
- Staking for coalition governance.
- Rewards for publishers implementing vuser-manifest.json.
- Consensus integration: PoS for validators checking approvals.

### Approval Mechanism
Implemented in `VuserApprovalRegistry.sol` (extending DevPlan permissioning contracts).

1. **Approval Grant**:
   - Treasury calls `approve(address transactingWallet)`, recording a timestamped hash in `mapping(address => bytes32) approvals`.
   - Emits `ApprovalGranted`.

2. **Funded Operations**:
   - Transacting wallet attaches approval hash in calldata (e.g., `fundFromTreasury(bytes32 approvalTxHash)`).
   - Contract validates hash matches latest entry; treasury transfers VOC.
   - Scoped to specific actions/domains.

3. **User-Funded Default**:
   - Non-approved transactions use wallet's VOC via standard `transferFrom`.

4. **Revocation**:
   - Treasury calls `revoke(address transactingWallet)`, updating mapping with revocation hash.
   - Emits `ApprovalRevoked`.

5. **Miner Validation**:
   - During execution, validators query registry for latest timestamp/sequence.
   - Revert if invalid or revoked, enforcing decentralization.

### Smart Contract Interface
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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
        // Trigger MCP action
    }

    function _getLatestTimestamp(address wallet) internal view returns (uint256) {
        // Additional logic for revocation checks
        return approvalTimestamps[wallet];
    }
}
```

### Integration with VUSER Protocol
- **MCP Tie-In:** AI agents (DevPlan Phase 2) check approvals before executing actions.
- **Flow Example:**
  1. User issues NL command.
  2. Agent translates to MCP action.
  3. If approved, attach hash; treasury funds.
  4. Log on-chain for immutability.

## Rationale
VUSER is a coalition uniting publishers, users, and AI agents in a decentralized ecosystem. VUSER is a frontend protocol for virtual user actions, where these actions are permitted by the website and performed by an AI agent for a user. It connects various paradigms together, mostly AI & blockchain.

This design balances subsidies for growth with user autonomy, using revocable approvals to mitigate risks. Miner enforcement decentralizes checks, aligning with VUSER's blockchain paradigm. Tokenomics incentivize coalition participation, connecting AI actions to economic value.

## Backwards Compatibility
Compatible with existing permissioning contracts (DevPlan Phase 0). Upgrades via proxy patterns for future VEPs.

## Security Considerations
- **Risks:** Treasury centralization (mitigate via future DAO); approval abuse (revocable + validation).
- **Audits:** Required per DevPlan Phase 3.
- **Privacy:** Optional ZK-proofs for transactions (future R&D).

## Test Cases
- Approval grant/revoke sequences.
- Funded vs. user-paid actions.
- Miner rejection of invalid hashes.

## Implementation
- **Phase Alignment:** Spec in Phase 0, testnet in Phase 1, full integration in Phase 2.
- **Deployment:** Testnet first, mainnet post-audits on the Vuser blockchain, a fundamental core blockchain derived from the best practices of Ethereum and blockchain.

## References
- VUSER DevPlan (attached document).
- ERC-20 Standard.
- Related VEPs: None (inaugural).