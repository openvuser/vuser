export class Account {
  constructor(address, signer, canSign) {
    this.address = address;
    this.signer = signer; // Ethers.js Signer object, or null
    this.canSign = canSign;
  }

  async signTransaction(tx) {
    if (!this.canSign || !this.signer) {
      throw new Error('This is a watch-only account and cannot sign transactions.');
    }
    return await this.signer.signTransaction(tx);
  }

  async getBalance() {
    if (this.signer) {
      return await this.signer.provider.getBalance(this.address);
    }
    throw new Error('Provider not set for watch-only account.');
  }
}