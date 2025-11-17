// This is pseudo-code to illustrate the consensus logic.
// A real implementation would be in Go, Rust, or a full-stack JS node.

class ConsensusEngine {
    constructor() {
      // This list is persistently updated by the transaction pool
      this.eligibilityPool = new Set(); // Stores last 100 unique addresses
      this.maxPoolSize = 100;
    }
  
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
  
    // Called by the block creation module
    selectNextValidator(seed) {
      if (this.eligibilityPool.size === 0) {
        throw new Error('No eligible validators in the pool.');
      }
  
      const poolArray = Array.from(this.eligibilityPool);
      
      // Simple, non-secure random selection for demo.
      // A real implementation would use a verifiable random function (VRF)
      // or a algorithm based on the 'seed' (e.g., hash of last block).
      const randomIndex = Math.floor(Math.random() * poolArray.length);
      
      return poolArray[randomIndex];
    }
  }