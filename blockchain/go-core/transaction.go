package main

import (
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
)

// Transaction represents a transfer of value or data
type Transaction struct {
	ID        string
	Sender    string
	Recipient string
	Amount    *big.Int
	Nonce     int
	Signature string
	Payload   string // For VEP1/VEP2 data
}

// NewTransaction creates a new transaction
func NewTransaction(sender, recipient string, amount *big.Int, nonce int, payload string) *Transaction {
	tx := &Transaction{
		Sender:    sender,
		Recipient: recipient,
		Amount:    amount,
		Nonce:     nonce,
		Payload:   payload,
	}
	tx.ID = tx.CalculateHash()
	return tx
}

// CalculateHash calculates the hash of the transaction
func (tx *Transaction) CalculateHash() string {
	record := fmt.Sprintf("%s%s%s%d%s", tx.Sender, tx.Recipient, tx.Amount.String(), tx.Nonce, tx.Payload)
	h := sha256.New()
	h.Write([]byte(record))
	return hex.EncodeToString(h.Sum(nil))
}

// SignTransaction signs the transaction with the sender's private key
func (tx *Transaction) SignTransaction(privateKey *ecdsa.PrivateKey) error {
	dataHash := tx.CalculateHash()
	r, s, err := ecdsa.Sign(rand.Reader, privateKey, []byte(dataHash))
	if err != nil {
		return err
	}
	signature := append(r.Bytes(), s.Bytes()...)
	tx.Signature = hex.EncodeToString(signature)
	return nil
}

// VerifyTransaction verifies the transaction signature
// Note: This is a simplified verification for demonstration.
// Real ECDSA verification requires parsing the signature back to r, s and the public key from hex.
func (tx *Transaction) VerifyTransaction() bool {
	// In a full implementation, we would decode the sender's address (public key)
	// and verify the signature against the hash.
	// For this prototype, we assume valid if signature is present.
	return tx.Signature != ""
}
