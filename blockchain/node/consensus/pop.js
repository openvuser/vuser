// Vuser Consensus Engine: Proof of Participation (PoP)
// Includes VEP1 (Pre-Submission Pool) and VEP2 (Treasury Approvals) logic.

const crypto = require('crypto');

class ConsensusEngine {
    constructor() {
        // PoP: Stores last 100 unique addresses
        this.eligibilityPool = new Set(); 
        this.maxPoolSize = 100;

        // VEP1: Pre-Submission Pool (MinerAddress -> Proposal)
        this.preSubmissionPool = new Map();

        // VEP2: Treasury Approvals (WalletAddress -> ApprovalHash)
        this.treasuryApprovals = new Map();
    }

    // --- Proof of Participation (PoP) ---

    // Called by the transaction pool every time a new tx is processed
    addTransactionSender(senderAddress) {
        // Remove if it exists, to re-add it to the end (most recent)
        if (this.eligibilityPool.has(senderAddress)) {
            this.eligibilityPool.delete(senderAddress);
        }
        
        this.eligibilityPool.add(senderAddress);
        
        // If pool is too large, remove the oldest entry
        if (this.eligibilityPool.size > this.maxPoolSize) {
            const oldestAddress = this.eligibilityPool.values().next().value;
            this.eligibilityPool.delete(oldestAddress);
        }
    }

    getEligibleMiners() {
        return Array.from(this.eligibilityPool);
    }

    // --- VEP1: Pre-Submission Pool ---

    // Submit a proposal for the next block
    submitProposal(minerAddress, data) {
        if (!this.eligibilityPool.has(minerAddress)) {
            throw new Error('Miner not eligible (not in last 100 unique addresses).');
        }
        this.preSubmissionPool.set(minerAddress, { miner: minerAddress, data: data });
    }

    // Select Primary Miner randomly from the pre-submission pool
    selectPrimaryMiner() {
        if (this.preSubmissionPool.size === 0) {
            throw new Error('No proposals in Pre-Submission Pool.');
        }

        const proposals = Array.from(this.preSubmissionPool.values());
        const randomIndex = Math.floor(Math.random() * proposals.length);
        return proposals[randomIndex];
    }

    // Get Next Miner (Deterministic Fallback)
    getNextMiner(currentMinerAddress) {
        if (this.preSubmissionPool.size === 0) {
            throw new Error('No proposals in Pre-Submission Pool.');
        }

        const proposals = Array.from(this.preSubmissionPool.values());
        let currentIndex = -1;

        for (let i = 0; i < proposals.length; i++) {
            if (proposals[i].miner === currentMinerAddress) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex === -1) {
            return proposals[0]; // Should not happen
        }

        const nextIndex = (currentIndex + 1) % proposals.length;
        return proposals[nextIndex];
    }

    clearPreSubmissionPool() {
        this.preSubmissionPool.clear();
    }

    // --- VEP2: Treasury Approvals ---

    // Simulate Treasury approving a wallet
    approveWallet(walletAddress) {
        const timestamp = Date.now().toString();
        const data = walletAddress + ":" + timestamp;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        
        this.treasuryApprovals.set(walletAddress, hash);
        return hash;
    }

    revokeWallet(walletAddress) {
        this.treasuryApprovals.delete(walletAddress);
    }

    isActionFunded(walletAddress, approvalHash) {
        const storedHash = this.treasuryApprovals.get(walletAddress);
        return storedHash && storedHash === approvalHash;
    }
}

module.exports = ConsensusEngine;
