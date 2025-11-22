# Proposal: Enhancing Liveness in Vuser's Proof of Participation Consensus via Pre-Submission Mechanism

**Date:** November 19, 2025  
**Author:** Prabhat Singh  
**Version:** 1.0  
**Status:** Draft for Review  

## Executive Summary

In the Vuser coalition, our frontend(browser-use API) protocol empowers virtual user actions—authorized by websites and executed seamlessly by AI agents—bridging AI and blockchain paradigms to foster decentralized, user-centric web experiences. A key component of this ecosystem is the blockchain layer, which handles permissions, value exchanges, and messaging. However, our current Proof of Participation (PoP) consensus mechanism faces a liveness vulnerability: if the selected miner (chosen from the last 100 transaction addresses) goes offline and fails to propose the next block, it could disrupt chain progression, impacting AI agent operations.

This proposal introduces a **Pre-Submission Pool Mechanism** to mitigate this flaw. By requiring the last 100 addresses to submit proposed blocks in advance, we ensure redundancy and continuity, drawing from established blockchain designs like Proposer-Builder Separation (PBS). This enhancement maintains decentralization, preserves unit veto capabilities, and aligns with Vuser's ethos of robust AI-blockchain integration, allowing virtual actions (e.g., site interactions or token transfers) to proceed without interruption.

## Problem Statement

Under the existing PoP model:
- A miner is randomly selected from the last 100 addresses in the transaction log.
- Each address holds a unit veto to reject invalid proposals, promoting collective security.
- If the selected miner is offline or unresponsive, block production stalls, potentially halting the chain. This could cascade into delays for AI agents executing permitted virtual user actions, such as querying site manifests or processing payments.

This liveness issue undermines the reliability of Vuser's frontend(browser-use API) protocol, where AI agents rely on timely blockchain confirmations for seamless operations.

## Proposed Solution: Pre-Submission Pool Mechanism

To address this, we propose that all 100 addresses in the selection pool submit candidate blocks in advance of the next slot. This creates a pool of ready proposals, enabling automatic fallbacks without compromising security or decentralization.

### Key Components

1. **Pre-Submission Phase**:
   - Immediately after finalizing the current block, notify the 100 addresses (via on-chain events or off-chain AI-assisted relays) to prepare proposals.
   - Each address constructs a candidate block including:
     - Pending transactions (e.g., permission grants or value exchanges).
     - Vuser-specific data (e.g., AI agent action hashes or site tool manifests).
   - Submissions are initially hashed or encrypted for efficiency and to prevent front-running, then stored on-chain or in a decentralized storage layer (e.g., IPFS integrated with our L2/sidechain).
   - AI agents can automate this for users, optimizing based on local processing to minimize overhead.

2. **Selection and Execution**:
   - Select the primary miner randomly (using a verifiable random function, VRF) from the 100.
   - The selected miner reveals their pre-submitted block for network validation.
   - All 100 addresses retain unit veto rights to challenge the proposal (e.g., for invalid actions or protocol breaches).

3. **Timeout and Fallback**:
   - Implement a configurable timeout (e.g., 10-15 seconds) for the primary miner to respond.
   - On timeout, rotate to the next address in a deterministic sequence (e.g., ordered by address hash).
   - The fallback miner reveals their pre-submitted block, subject to veto.
   - Continue rotations until a valid block is produced. In extreme cases (all offline), fall back to an open proposal mode with penalties.

### Incentives and Governance
- **Rewards**: Allocate block rewards (e.g., tokens for value exchanges) to successful proposers, with bonuses for pre-submission compliance. AI agents could stake on behalf of users to amplify participation.
- **Penalties**: Impose light slashes or temporary pool exclusions for non-submission or offline status, discouraging inactivity while avoiding over-penalization.
- **Governance**: Parameter adjustments (e.g., timeout duration, pool size) via on-chain votes, where AI agents assist in proposal analysis for coalition members.

## Benefits
- **Improved Liveness**: Redundant pre-submissions ensure near-continuous block production, supporting uninterrupted AI-executed virtual actions.
- **Enhanced Security**: Unit veto remains intact, with pre-submissions adding layers of preparedness without centralizing control.
- **Scalability Alignment**: Fits Vuser's roadmap, enabling higher throughput for AI-blockchain interactions (e.g., batch processing site permissions).
- **User-Centric**: AI agents handle complexity, making participation accessible for non-technical users in the coalition.

## Potential Risks and Mitigations
- **Increased Overhead**: Multiple submissions may raise bandwidth costs; mitigate with hash-first commits and AI-optimized compression.
- **Attack Vectors**: Potential for spam; counter with rate limits and veto enforcement.
- **Implementation Complexity**: Requires smart contract upgrades; phase in via testnet (as per Phase 2 in our dev roadmap).

## Implementation Timeline
- **Q4 2025**: Design refinement and simulations.
- **Q1 2026**: Testnet deployment and AI agent integration testing.
- **Q2 2026**: Mainnet rollout, post-audit.

## Conclusion
This Pre-Submission Pool Mechanism fortifies Vuser's PoP consensus, ensuring the blockchain layer reliably supports our frontend(browser-use API) protocol's virtual user actions. By preemptively addressing liveness flaws, we reinforce the coalition's mission to interconnect AI and blockchain for a more empowered web. Feedback from coalition members is encouraged to iterate on this proposal.


-----
Would you like me to generate an image illustrating this proposal as a line diagram? In the meantime, here's a text-based line diagram (flowchart) representation of the Pre-Submission Pool Mechanism in Vuser's Proof of Participation consensus:

```
Current Block Finalized
        |
        V
Notify Last 100 Addresses (via on-chain events or AI relays)
        |
        V
Pre-Submission Phase:
- Each address prepares & submits hashed/encrypted candidate block
- Includes pending txns, AI agent actions, permissions
        |
        V
Selection Phase:
- Randomly select Primary Miner (using VRF for fairness)
        |
        V
Execution Phase:
- Primary Miner reveals pre-submitted block
- Network validates; all 100 addresses can veto invalid proposals
        |
     Success?
   /         \
 Yes          No / Timeout
  |             |
  V             V
New Block     Fallback Phase:
Produced     - Rotate to next address in deterministic order
             - Reveal their pre-submitted block
             - Validate & veto as before
             - Repeat until success (or recovery mode if all fail)
        |
        V
Incentives/Penalties Applied:
- Rewards for successful proposers
- Slashing/exclusion for offline/non-submitters
        |
        V
Chain Continues (AI agents execute virtual actions uninterrupted)
```
-----