Here is the `blockchain.md` file,  to reflect the key features planned for perpetual virtual operation.

-----

### 📄 `blockchain.md`


# Vuser Blockchain Layer

## 1. Overview

The Vuser blockchain is a purpose-built network designed to be the "truth layer" for the Vuser protocol. Its primary function is to secure the virtual-user's interaction with web publishers on the behalf of a user. It is architected to manage on-chain permissions, limit AI over-usage, and provide a secure, auditable log of AI-driven actions and value exchanges.

The architecture is built for high throughput and low costs, natively supporting:
* **Sidechains:** To offload micro-transactions and high-frequency events.
* **Grouped Transactions:** The chain can process bundled sidechain transactions, where only a header is passed to the main chain. This significantly increases capacity and unloads the proof burden from the mainnet.

This document details the blockchain's core components, its unique economic model, and its consensus mechanism.

## 2. Core Components

The blockchain layer is comprised of three main components: the on-chain contracts, the node software (validator), and the client-side wallet library.

```mermaid
graph TD
    subgraph Client-Side [Browser Extension]
        A[WalletManager.js] --> B(Account.js);
        A --> C(KeyStore.js);
        B --> D[Sign Transaction];
    end
    
    subgraph Vuser-Node [Validator Node]
        E[RPC API] --> F[Consensus: Proof-of-Participation];
        F --> G[Transaction Pool];
        G --> H{Block Creation};
        H --> I[Blockchain State];
    end

    subgraph SmartContracts [On-Chain Contracts]
        J[PermissionRegistry.sol];
        K[ValueExchange.sol];
    end

    D -- "Send tx" --> E;
    E -- "Read state" --> J;
    H -- "Update state" --> J;
    H -- "Update state" --> K;
    
    style Client-Side fill:#121225,stroke:#00ffff
    style Vuser-Node fill:#121225,stroke:#ff00ff
    style SmartContracts fill:#121225,stroke:#00ff9d
````

### 2.1. Wallet Core (`@vuser/wallet-core`)

This is a JavaScript library used by the browser extension to manage user keys and addresses. It provides the interface for creating and managing "Operator" (signing) and "Tracker" (watch-only) wallets. It allows the user to connect to either a self-hosted mining node or trusted external mining nodes.

### 2.2. Smart Contracts (`/contracts`)

These are the core logic of the protocol, deployed on the Vuser chain.

  * **`PermissionRegistry.sol`**: This contract acts as the permission layer. It stores a record of which users have authorized the AI agent to act on which publisher domains.
  * **`ValueExchange.sol`**: This contract facilitates payments. Each publisher decides the cost of AI engagement for themselves, and this contract handles the settlement of those publisher-defined costs.

-----

## 3\. Tokenomics & Fee Model

The Vuser chain's economy is designed for long-term sustainability and to incentivize participation from all members of the coalition.

### 3.1. Genesis & Supply

The genesis of the coalition chain has **10^80 coins**. This hyper-inflationary supply is not for speculation but is designed to provide a near-infinite pool to fund transactions for perpetuity.

### 3.2. Sponsored Transaction Fee Model

The chain employs a sponsored fee model to reduce friction for approved partners and end-users.

  * **For Approved Publishers:** The **Coalition** pays the mining fees for all on-chain transactions initiated by approved publishers. This is funded by the Coalition's share of block rewards.
  * **For Others:** Anyone else (e.g., non-approved publishers, individual users) can pay for their own transactions.

-----

## 4\. Consensus & Block Rewards

### 4.1. Consensus: Proof-of-Participation (PoP)

The network is secured by a unique, egalitarian consensus mechanism that rewards active participation, not just wealth.

  * **Winner Selection:** The winner for a block (the "miner" or "validator") is decided by a hash function.
  * **Eligibility Pool:** This hash function's input is the **last 100 unique wallet addresses** to have sent a transaction.
  * **Unit Stake:** Each address in this pool has **unit stake**. This means an address with 1 coin has the exact same chance of winning as an address with 1 million, provided they are both in the pool.

### 4.2. Block Reward & Distribution

The block reward is dynamic, based on network activity, and is split among the miner, the Coalition, and a burning mechanism.

1.  **Winner's Pot (W):** First, all of the combined mining fees from the block are collected into the "Winner's Pot" (W).
2.  **Block Generation:** The block itself generates **9 new coins**, which are added to this pot.
3.  **Total Reward:** The total reward for the block is therefore `9 + W` coins.
4.  **Distribution:** This total reward is split in three ways:
      * **1/3** goes to the **miner** (the winning address).
      * **1/3** goes to the **Coalition** (to fund operations and pay publisher fees).
      * **1/3** is **burnt** (acting as a deflationary pressure).

<!-- end list -->

```
