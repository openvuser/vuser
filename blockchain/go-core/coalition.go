package main

import (
	"fmt"
	"math/big"
	"time"
)

// CoalitionTreasury manages the coalition's funds for paying publisher fees
type CoalitionTreasury struct {
	Balance        *big.Int
	TotalReceived  *big.Int
	TotalSpent     *big.Int
	TransactionLog []TreasuryTransaction
}

// TreasuryTransaction records treasury activity
type TreasuryTransaction struct {
	Type      string // "deposit" or "withdrawal"
	Amount    *big.Int
	Purpose   string
	Timestamp time.Time
}

// ApprovedPublisher represents a publisher approved for coalition sponsorship
type ApprovedPublisher struct {
	Address        string
	Name           string
	ApprovedAt     time.Time
	TotalSponsored *big.Int // Total fees sponsored for this publisher
}

// Global coalition treasury instance
var Treasury *CoalitionTreasury

// Global registry of approved publishers
var ApprovedPublishers = make(map[string]*ApprovedPublisher)

// InitializeCoalitionTreasury creates and initializes the coalition treasury
func InitializeCoalitionTreasury(initialBalance *big.Int) {
	Treasury = &CoalitionTreasury{
		Balance:        new(big.Int).Set(initialBalance),
		TotalReceived:  new(big.Int).Set(initialBalance),
		TotalSpent:     big.NewInt(0),
		TransactionLog: []TreasuryTransaction{},
	}

	// Log initial deposit
	Treasury.TransactionLog = append(Treasury.TransactionLog, TreasuryTransaction{
		Type:      "deposit",
		Amount:    new(big.Int).Set(initialBalance),
		Purpose:   "Genesis allocation",
		Timestamp: time.Now(),
	})

	fmt.Printf("Coalition Treasury initialized with balance: %s\n", initialBalance.String())
}

// AddApprovedPublisher adds a publisher to the approved list
func AddApprovedPublisher(address, name string) {
	publisher := &ApprovedPublisher{
		Address:        address,
		Name:           name,
		ApprovedAt:     time.Now(),
		TotalSponsored: big.NewInt(0),
	}
	ApprovedPublishers[address] = publisher
	fmt.Printf("Publisher approved: %s (%s)\n", name, address)
}

// RemoveApprovedPublisher removes a publisher from the approved list
func RemoveApprovedPublisher(address string) {
	if publisher, exists := ApprovedPublishers[address]; exists {
		delete(ApprovedPublishers, address)
		fmt.Printf("Publisher removed from approval: %s (%s)\n", publisher.Name, address)
	}
}

// IsPublisherApproved checks if a publisher is approved for coalition sponsorship
func IsPublisherApproved(address string) bool {
	_, exists := ApprovedPublishers[address]
	return exists
}

// GetApprovedPublisher retrieves an approved publisher by address
func GetApprovedPublisher(address string) (*ApprovedPublisher, bool) {
	publisher, exists := ApprovedPublishers[address]
	return publisher, exists
}

// DepositToTreasury adds funds to the coalition treasury (from block rewards)
func DepositToTreasury(amount *big.Int, purpose string) {
	if Treasury == nil {
		fmt.Println("Error: Treasury not initialized")
		return
	}

	Treasury.Balance.Add(Treasury.Balance, amount)
	Treasury.TotalReceived.Add(Treasury.TotalReceived, amount)

	Treasury.TransactionLog = append(Treasury.TransactionLog, TreasuryTransaction{
		Type:      "deposit",
		Amount:    new(big.Int).Set(amount),
		Purpose:   purpose,
		Timestamp: time.Now(),
	})

	fmt.Printf("Treasury deposit: %s (%s). New balance: %s\n",
		amount.String(), purpose, Treasury.Balance.String())
}

// SponsorTransactionFee pays a transaction fee on behalf of an approved publisher
// Returns true if successful, false if insufficient funds or publisher not approved
func SponsorTransactionFee(publisherAddress string, feeAmount *big.Int) bool {
	if Treasury == nil {
		fmt.Println("Error: Treasury not initialized")
		return false
	}

	// Check if publisher is approved
	publisher, approved := GetApprovedPublisher(publisherAddress)
	if !approved {
		fmt.Printf("Publisher not approved for sponsorship: %s\n", publisherAddress)
		return false
	}

	// Check if treasury has sufficient funds
	if Treasury.Balance.Cmp(feeAmount) < 0 {
		fmt.Printf("Insufficient treasury funds. Required: %s, Available: %s\n",
			feeAmount.String(), Treasury.Balance.String())
		return false
	}

	// Deduct from treasury
	Treasury.Balance.Sub(Treasury.Balance, feeAmount)
	Treasury.TotalSpent.Add(Treasury.TotalSpent, feeAmount)

	// Update publisher's sponsored amount
	publisher.TotalSponsored.Add(publisher.TotalSponsored, feeAmount)

	// Log transaction
	Treasury.TransactionLog = append(Treasury.TransactionLog, TreasuryTransaction{
		Type:      "withdrawal",
		Amount:    new(big.Int).Set(feeAmount),
		Purpose:   fmt.Sprintf("Fee sponsorship for %s", publisher.Name),
		Timestamp: time.Now(),
	})

	fmt.Printf("Sponsored fee of %s for publisher %s. New treasury balance: %s\n",
		feeAmount.String(), publisher.Name, Treasury.Balance.String())

	return true
}

// GetTreasuryBalance returns the current treasury balance
func GetTreasuryBalance() *big.Int {
	if Treasury == nil {
		return big.NewInt(0)
	}
	return new(big.Int).Set(Treasury.Balance)
}

// GetTreasuryStats returns statistics about the treasury
func GetTreasuryStats() map[string]interface{} {
	if Treasury == nil {
		return map[string]interface{}{
			"error": "Treasury not initialized",
		}
	}

	return map[string]interface{}{
		"balance":           Treasury.Balance.String(),
		"total_received":    Treasury.TotalReceived.String(),
		"total_spent":       Treasury.TotalSpent.String(),
		"transaction_count": len(Treasury.TransactionLog),
	}
}

// GetPublisherStats returns statistics for all approved publishers
func GetPublisherStats() []map[string]interface{} {
	var stats []map[string]interface{}

	for _, publisher := range ApprovedPublishers {
		stats = append(stats, map[string]interface{}{
			"address":         publisher.Address,
			"name":            publisher.Name,
			"approved_at":     publisher.ApprovedAt,
			"total_sponsored": publisher.TotalSponsored.String(),
		})
	}

	return stats
}

// GetRecentTreasuryActivity returns the last N treasury transactions
func GetRecentTreasuryActivity(limit int) []TreasuryTransaction {
	if Treasury == nil || len(Treasury.TransactionLog) == 0 {
		return []TreasuryTransaction{}
	}

	start := len(Treasury.TransactionLog) - limit
	if start < 0 {
		start = 0
	}

	return Treasury.TransactionLog[start:]
}
