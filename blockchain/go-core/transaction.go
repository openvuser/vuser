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
	ID          string
	Sender      string
	Recipient   string
	Amount      *big.Int
	Nonce       int
	Signature   string
	Payload     string   // For VEP1/VEP2 data
	Publisher   string   // Publisher address (if transaction is from a publisher)
	IsSponsored bool     // Whether coalition pays the fee
	Fee         *big.Int // Transaction fee amount
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

// CalculateFee determines the transaction fee based on size and complexity
// Base fee + data size fee
func (tx *Transaction) CalculateFee() *big.Int {
	baseFee := big.NewInt(1) // 1 coin base fee

	// Add fee based on payload size (1 coin per 100 bytes)
	payloadSize := len(tx.Payload)
	dataSizeFee := big.NewInt(int64(payloadSize / 100))

	totalFee := new(big.Int).Add(baseFee, dataSizeFee)
	return totalFee
}

// ApplyCoalitionSponsorship checks if the publisher is approved and applies sponsorship
// Returns true if sponsorship was applied, false otherwise
func (tx *Transaction) ApplyCoalitionSponsorship() bool {
	// If no publisher specified, cannot be sponsored
	if tx.Publisher == "" {
		tx.IsSponsored = false
		return false
	}

	// Check if publisher is approved
	if IsPublisherApproved(tx.Publisher) {
		tx.IsSponsored = true
		return true
	}

	tx.IsSponsored = false
	return false
}

// SetPublisher sets the publisher for this transaction and checks sponsorship
func (tx *Transaction) SetPublisher(publisherAddress string) {
	tx.Publisher = publisherAddress
	tx.ApplyCoalitionSponsorship()
}

// ProcessTransactionFee handles the transaction fee payment
// For sponsored transactions, coalition pays. Otherwise, sender pays.
// Returns true if fee was successfully processed
func (tx *Transaction) ProcessTransactionFee() bool {
	// Calculate fee if not already set
	if tx.Fee == nil {
		tx.Fee = tx.CalculateFee()
	}

	if tx.IsSponsored {
		// Coalition sponsors the fee
		return SponsorTransactionFee(tx.Publisher, tx.Fee)
	}

	// Non-sponsored: fee will be deducted from sender's balance during block validation
	// Just return true here - actual deduction happens in GetBalance
	return true
}
