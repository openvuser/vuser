package main

import (
	"fmt"
	"math/big"
)

// Blockchain is a series of validated Blocks
var Blockchain []Block

// AddBlock adds a new block to the blockchain
func AddBlock(newBlock Block) {
	if IsBlockValid(newBlock, Blockchain[len(Blockchain)-1]) {
		Blockchain = append(Blockchain, newBlock)
	}
}

// IsBlockValid checks if the block is valid by checking index, hash, and previous hash
func IsBlockValid(newBlock, oldBlock Block) bool {
	if oldBlock.Index+1 != newBlock.Index {
		fmt.Println("Index is invalid")
		return false
	}

	if oldBlock.Hash != newBlock.PrevHash {
		fmt.Println("Previous Hash is invalid")
		return false
	}

	if CalculateHash(newBlock) != newBlock.Hash {
		fmt.Println("Hash is invalid")
		return false
	}

	return true
}

// GetBalance returns the balance of an address by iterating through all transactions
func GetBalance(address string) *big.Int {
	balance := big.NewInt(0)

	for _, block := range Blockchain {
		for _, tx := range block.Transactions {
			if tx.Sender == address {
				balance.Sub(balance, tx.Amount)
			}
			if tx.Recipient == address {
				balance.Add(balance, tx.Amount)
			}
		}
	}

	return balance
}
