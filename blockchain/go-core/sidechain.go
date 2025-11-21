package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"
)

// Sidechain represents a sidechain that offloads micro-transactions
type Sidechain struct {
	ID          string
	Name        string
	ParentChain string // Reference to main chain
	Blocks      []SidechainBlock
	CreatedAt   time.Time
}

// SidechainBlock represents a lightweight block in a sidechain
// Designed for high-throughput micro-transactions
type SidechainBlock struct {
	Index        int
	Timestamp    string
	Transactions []*Transaction
	Hash         string
	PrevHash     string
	Validator    string // Simplified validation - no PoP for sidechains
}

// SidechainHeader represents the merkle root and metadata
// This is what gets anchored to the main chain
type SidechainHeader struct {
	SidechainID    string
	BlockRange     string // e.g., "1-100" indicating blocks included
	MerkleRoot     string // Merkle root of all transactions in the range
	TransactionCount int
	Timestamp      string
}

// Global registry of sidechains
var SidechainRegistry = make(map[string]*Sidechain)

// CreateSidechain creates and registers a new sidechain
func CreateSidechain(id, name string) *Sidechain {
	sidechain := &Sidechain{
		ID:          id,
		Name:        name,
		ParentChain: "vuser-mainchain",
		Blocks:      []SidechainBlock{},
		CreatedAt:   time.Now(),
	}

	// Create genesis block for sidechain
	genesisBlock := SidechainBlock{
		Index:        0,
		Timestamp:    time.Now().String(),
		Transactions: []*Transaction{},
		PrevHash:     "0",
		Validator:    "genesis",
	}
	genesisBlock.Hash = CalculateSidechainBlockHash(genesisBlock)
	sidechain.Blocks = append(sidechain.Blocks, genesisBlock)

	SidechainRegistry[id] = sidechain
	return sidechain
}

// AddSidechainBlock adds a new block to a sidechain
func (sc *Sidechain) AddSidechainBlock(transactions []*Transaction, validator string) SidechainBlock {
	prevBlock := sc.Blocks[len(sc.Blocks)-1]

	newBlock := SidechainBlock{
		Index:        prevBlock.Index + 1,
		Timestamp:    time.Now().String(),
		Transactions: transactions,
		PrevHash:     prevBlock.Hash,
		Validator:    validator,
	}
	newBlock.Hash = CalculateSidechainBlockHash(newBlock)

	sc.Blocks = append(sc.Blocks, newBlock)
	return newBlock
}

// CalculateSidechainBlockHash calculates the hash of a sidechain block
func CalculateSidechainBlockHash(block SidechainBlock) string {
	txHashes := ""
	for _, tx := range block.Transactions {
		txHashes += tx.ID
	}
	record := fmt.Sprintf("%d%s%s%s%s", block.Index, block.Timestamp, txHashes, block.PrevHash, block.Validator)
	h := sha256.New()
	h.Write([]byte(record))
	return hex.EncodeToString(h.Sum(nil))
}

// GenerateSidechainHeader creates a header for a range of sidechain blocks
// This is the grouped transaction approach - only the header goes to main chain
func (sc *Sidechain) GenerateSidechainHeader(startBlock, endBlock int) (*SidechainHeader, error) {
	if startBlock < 0 || endBlock >= len(sc.Blocks) || startBlock > endBlock {
		return nil, fmt.Errorf("invalid block range: %d-%d", startBlock, endBlock)
	}

	// Collect all transactions in the range
	var allTransactions []*Transaction
	for i := startBlock; i <= endBlock; i++ {
		allTransactions = append(allTransactions, sc.Blocks[i].Transactions...)
	}

	// Calculate merkle root
	merkleRoot := CalculateMerkleRoot(allTransactions)

	header := &SidechainHeader{
		SidechainID:      sc.ID,
		BlockRange:       fmt.Sprintf("%d-%d", startBlock, endBlock),
		MerkleRoot:       merkleRoot,
		TransactionCount: len(allTransactions),
		Timestamp:        time.Now().String(),
	}

	return header, nil
}

// CalculateMerkleRoot calculates the merkle root of a list of transactions
// Simplified implementation - in production, use proper merkle tree
func CalculateMerkleRoot(transactions []*Transaction) string {
	if len(transactions) == 0 {
		return "0"
	}

	// Collect all transaction hashes
	hashes := make([]string, len(transactions))
	for i, tx := range transactions {
		hashes[i] = tx.ID
	}

	// Build merkle tree bottom-up
	for len(hashes) > 1 {
		var newLevel []string
		for i := 0; i < len(hashes); i += 2 {
			var combined string
			if i+1 < len(hashes) {
				combined = hashes[i] + hashes[i+1]
			} else {
				// Odd number - duplicate last hash
				combined = hashes[i] + hashes[i]
			}
			h := sha256.New()
			h.Write([]byte(combined))
			newLevel = append(newLevel, hex.EncodeToString(h.Sum(nil)))
		}
		hashes = newLevel
	}

	return hashes[0]
}

// VerifySidechainHeader verifies that a sidechain header is valid
func VerifySidechainHeader(header *SidechainHeader) bool {
	sc, exists := SidechainRegistry[header.SidechainID]
	if !exists {
		fmt.Println("Sidechain not found:", header.SidechainID)
		return false
	}

	// Parse block range
	var startBlock, endBlock int
	_, err := fmt.Sscanf(header.BlockRange, "%d-%d", &startBlock, &endBlock)
	if err != nil {
		fmt.Println("Invalid block range format:", header.BlockRange)
		return false
	}

	// Regenerate header and compare merkle roots
	regeneratedHeader, err := sc.GenerateSidechainHeader(startBlock, endBlock)
	if err != nil {
		fmt.Println("Error regenerating header:", err)
		return false
	}

	if regeneratedHeader.MerkleRoot != header.MerkleRoot {
		fmt.Println("Merkle root mismatch")
		return false
	}

	if regeneratedHeader.TransactionCount != header.TransactionCount {
		fmt.Println("Transaction count mismatch")
		return false
	}

	return true
}

// GetSidechainStats returns statistics about a sidechain
func (sc *Sidechain) GetSidechainStats() map[string]interface{} {
	totalTxs := 0
	for _, block := range sc.Blocks {
		totalTxs += len(block.Transactions)
	}

	return map[string]interface{}{
		"id":                 sc.ID,
		"name":               sc.Name,
		"total_blocks":       len(sc.Blocks),
		"total_transactions": totalTxs,
		"created_at":         sc.CreatedAt,
	}
}

// CalculateSidechainValue calculates total value transferred in a sidechain
func (sc *Sidechain) CalculateSidechainValue() *big.Int {
	total := big.NewInt(0)
	for _, block := range sc.Blocks {
		for _, tx := range block.Transactions {
			total.Add(total, tx.Amount)
		}
	}
	return total
}
