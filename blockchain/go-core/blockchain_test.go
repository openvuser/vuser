package main

import (
	"math/big"
	"testing"
	"time"
)

func TestBlockValidation(t *testing.T) {
	tx := NewTransaction("Sender", "Recipient", big.NewInt(10), 0, "Test Data")
	genesisBlock := Block{0, time.Now().String(), []*Transaction{tx}, "", "", ""}
	genesisBlock.Hash = CalculateHash(genesisBlock)

	newTx := NewTransaction("Sender", "Recipient", big.NewInt(10), 1, "Test Data")
	newBlock := GenerateBlock(genesisBlock, []*Transaction{newTx}, "Validator1")

	if !IsBlockValid(newBlock, genesisBlock) {
		t.Errorf("Block should be valid")
	}

	if newBlock.PrevHash != genesisBlock.Hash {
		t.Errorf("Previous hash should match")
	}

	if len(newBlock.Transactions) != 1 {
		t.Errorf("Block should have 1 transaction")
	}
}

func TestBlockchain(t *testing.T) {
	Blockchain = []Block{}
	tx := NewTransaction("Sender", "Recipient", big.NewInt(10), 0, "Genesis Block")
	genesisBlock := Block{0, time.Now().String(), []*Transaction{tx}, "", "", ""}
	genesisBlock.Hash = CalculateHash(genesisBlock)
	Blockchain = append(Blockchain, genesisBlock)

	newTx := NewTransaction("Sender", "Recipient", big.NewInt(10), 1, "Block 1")
	newBlock := GenerateBlock(Blockchain[len(Blockchain)-1], []*Transaction{newTx}, "Validator1")
	AddBlock(newBlock)

	if len(Blockchain) != 2 {
		t.Errorf("Blockchain should have 2 blocks, got %d", len(Blockchain))
	}
}

func TestWallet(t *testing.T) {
	wallet := CreateWallet()
	if wallet == nil {
		t.Errorf("Wallet creation failed")
	}
	if len(wallet.PublicKey) == 0 {
		t.Errorf("Public key is empty")
	}
	if wallet.GetAddress() == "" {
		t.Errorf("Address is empty")
	}
}
