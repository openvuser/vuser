# Vuser Sidechain Architecture

## Overview

The Vuser blockchain implements a **Federated Sidechain** model to solve two critical problems:
1. **Scalability**: Offloading high-frequency micro-transactions (e.g., AI clicks, ad views) from the main chain.
2. **Cost Efficiency**: Allowing transactions to be processed with lower latency and zero/low fees before settlement.

In this model, sidechains operate independently to process transactions, and only a cryptographic proof (Merkle Root) of a batch of transactions is anchored to the main Vuser chain. This ensures the main chain remains lightweight while inheriting the security of the main chain for final settlement.

## Architecture

### 1. The Sidechain Structure
A sidechain is a lightweight blockchain that runs parallel to the main chain.

```go
type Sidechain struct {
    ID          string
    Name        string
    ParentChain string // Reference to main chain (e.g., "vuser-mainchain")
    Blocks      []SidechainBlock
    CreatedAt   time.Time
}
```

### 2. Sidechain Blocks
Sidechain blocks are simplified compared to main chain blocks. They do not require Proof-of-Participation (PoP) for every block, allowing for faster block times.

```go
type SidechainBlock struct {
    Index        int
    Timestamp    string
    Transactions []*Transaction
    Hash         string
    PrevHash     string
    Validator    string // Federated validator
}
```

### 3. Main Chain Anchoring (The Bridge)
The connection between the sidechain and the main chain is the **Sidechain Header**. This header is what gets written to the main chain. It contains the Merkle Root of a range of sidechain blocks.

```go
type SidechainHeader struct {
    SidechainID    string
    BlockRange     string // e.g., "100-200"
    MerkleRoot     string // Cryptographic proof of all txs in range
    TransactionCount int
    Timestamp      string
}
```

## How It Works

### Step 1: Sidechain Processing
1. Users/AI Agents send transactions to the Sidechain Validator.
2. The Validator aggregates these into `SidechainBlock`s.
3. These blocks are added to the local `Sidechain` state immediately.
   - **Benefit**: Instant confirmation for the user.

### Step 2: Header Generation
Periodically (e.g., every 100 blocks or every hour), the Sidechain Validator generates a `SidechainHeader`.
1. It collects all transactions from the unanchored blocks.
2. It calculates the **Merkle Root** of these transactions.
3. It creates a `SidechainHeader` struct.

### Step 3: Anchoring to Main Chain
1. The Sidechain Validator (or a bridge operator) submits a standard transaction to the Main Chain.
2. This transaction includes the `SidechainHeader` as part of the Main Chain block's `SidechainHeaders` field.
3. **Validation**: Main chain validators verify the header's signature and structure (but do not need to download all sidechain txs).

### Step 4: Finality
Once the Main Chain block containing the header is finalized, all transactions in the sidechain batch are considered immutable and settled.

## Usage Example

### Creating a Sidechain
```go
// Initialize a new sidechain
sc := CreateSidechain("sc-micro-1", "Micro-Payment Chain")
```

### Processing Transactions
```go
// Create micro-transactions
tx1 := NewTransaction("UserA", "UserB", big.NewInt(1), 0, "Ad View 1")
tx2 := NewTransaction("UserA", "UserC", big.NewInt(1), 1, "Ad View 2")

// Add to sidechain (instant)
sc.AddSidechainBlock([]*Transaction{tx1, tx2}, "Validator1")
```

### Anchoring to Main Chain
```go
// 1. Generate Header for the batch
header, err := sc.GenerateSidechainHeader(1, 100)

// 2. Submit to Main Chain (conceptually)
mainChainBlock := GenerateBlock(lastBlock, txs, miner, []SidechainHeader{*header})
```

## Security Considerations

1. **Data Availability**: The sidechain operator must ensure the actual transaction data is available for anyone who wants to verify the Merkle Root.
2. **Validator Trust**: In a federated model, users trust the sidechain validator to order transactions correctly. However, the validator cannot forge signatures due to cryptographic checks.
3. **Fraud Proofs (Future Work)**: A more advanced implementation could allow users to submit "fraud proofs" to the main chain if a sidechain validator acts maliciously.

## Economic Model

- **Sidechain Fees**: Can be zero or very low, set by the sidechain operator.
- **Anchoring Fees**: The sidechain operator pays the standard Main Chain transaction fee to anchor the header. This cost is amortized over thousands of sidechain transactions, making the per-transaction cost negligible.
