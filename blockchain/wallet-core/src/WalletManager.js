import { ethers } from 'ethers';
import { KeyStore } from './KeyStore';
import { Account } from './Account';

export class WalletManager {
  constructor(storage, rpcProvider) {
    this.storage = storage; // e.g., chrome.storage.local
    this.keystore = new KeyStore(storage);
    this.provider = new ethers.JsonRpcProvider(rpcProvider);
    this.accounts = new Map(); // Map<address, Account>
  }

  async loadAccounts(password) {
    const wallets = await this.keystore.getWallets(password);
    for (const wallet of wallets) {
      const signer = new ethers.Wallet(wallet.privateKey, this.provider);
      const account = new Account(signer.address, signer, true);
      this.accounts.set(account.address, account);
    }
    // Load watch-only wallets
    const watchOnly = await this.keystore.getWatchOnly();
    for (const address of watchOnly) {
      if (!this.accounts.has(address)) {
        const account = new Account(address, null, false);
        this.accounts.set(address, account);
      }
    }
  }

  async addWatchOnly(address, name) {
    await this.keystore.addWatchOnly(address, name);
    const account = new Account(address, null, false);
    this.accounts.set(address, account);
    return account;
  }

  async addWallet(privateKey, name, password) {
    const signer = new ethers.Wallet(privateKey, this.provider);
    await this.keystore.addWallet(privateKey, name, password);
    const account = new Account(signer.address, signer, true);
    this.accounts.set(signer.address, account);
    return account;
  }

  getAccount(address) {
    const account = this.accounts.get(address);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  listAccounts() {
    return Array.from(this.accounts.values());
  }
}