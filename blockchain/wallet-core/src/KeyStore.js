import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// A basic, un-optimized keystore for demonstration.
// A real implementation should use scrypt and more robust storage.

export class KeyStore {
  constructor(storage) {
    this.storage = storage; // e.g., chrome.storage.local
    this.walletsKey = 'vuser_wallets_encrypted';
    this.watchOnlyKey = 'vuser_wallets_watchonly';
  }

  // --- Watch Only ---
  async getWatchOnly() {
    const data = await this.storage.get(this.watchOnlyKey);
    return data[this.watchOnlyKey] || [];
  }
  
  async addWatchOnly(address, name) {
    const wallets = await this.getWatchOnly();
    wallets.push({ address, name });
    await this.storage.set({ [this.watchOnlyKey]: wallets });
  }

  // --- Encrypted Wallets ---
  async getWallets(password) {
    const data = await this.storage.get(this.walletsKey);
    if (!data[this.walletsKey]) return [];

    try {
      const decrypted = CryptoJS.AES.decrypt(data[this.walletsKey], password).toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error('Invalid password');
      return JSON.parse(decrypted);
    } catch (e) {
      throw new Error('Invalid password or corrupted keystore.');
    }
  }

  async addWallet(privateKey, name, password) {
    let wallets = [];
    try {
      wallets = await this.getWallets(password);
    } catch (e) {
      // Keystore is new or password was wrong, start fresh
      wallets = [];
    }
    
    wallets.push({ privateKey, name });
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(wallets), password).toString();
    await this.storage.set({ [this.walletsKey]: encrypted });
  }
}