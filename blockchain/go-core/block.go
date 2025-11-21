package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// Block represents a block in the blockchain
type Block struct {
	Index            int
	Timestamp        string
	Transactions     []*Transaction
	Hash             string
	PrevHash         string
	Validator        string
	SidechainHeaders []SidechainHeader // Anchored sidechain data
}

// CalculateHash calculates the SHA256 hash of a block
func CalculateHash(block Block) string {
	txHashes := ""
	for _, tx := range block.Transactions {
		txHashes += tx.ID
	}

	// Include sidechain headers in hash
	sidechainData := ""
	for _, header := range block.SidechainHeaders {
		sidechainData += header.MerkleRoot
	}

	record := fmt.Sprintf("%d%s%s%s%s%s", block.Index, block.Timestamp, txHashes, block.PrevHash, block.Validator, sidechainData)
	h := sha256.New()
	h.Write([]byte(record))
	hashed := h.Sum(nil)
	return hex.EncodeToString(hashed)
}

// GenerateBlock creates a new block using the previous block's hash
func GenerateBlock(oldBlock Block, transactions []*Transaction, validator string, sidechainHeaders []SidechainHeader) Block {
	var newBlock Block
	t := time.Now()

	newBlock.Index = oldBlock.Index + 1
	newBlock.Timestamp = t.String()
	newBlock.Transactions = transactions
	newBlock.PrevHash = oldBlock.Hash
	newBlock.Validator = validator
	newBlock.SidechainHeaders = sidechainHeaders
	newBlock.Hash = CalculateHash(newBlock)

	return newBlock
}
