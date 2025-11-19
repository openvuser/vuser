package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// ApprovalRegistry manages wallet approvals for funded operations
type ApprovalRegistry struct {
	Approvals map[string]string // WalletAddress -> ApprovalHash
}

// Global registry instance
var Registry = ApprovalRegistry{
	Approvals: make(map[string]string),
}

// ApproveWallet grants approval to a wallet and returns the approval hash
// In a real contract, this would be called by the Treasury
func (r *ApprovalRegistry) ApproveWallet(walletAddress string) string {
	timestamp := time.Now().String()
	data := fmt.Sprintf("%s:%s", walletAddress, timestamp)

	h := sha256.New()
	h.Write([]byte(data))
	approvalHash := hex.EncodeToString(h.Sum(nil))

	r.Approvals[walletAddress] = approvalHash
	fmt.Printf("Treasury: Approved wallet %s with hash %s\n", walletAddress, approvalHash)
	return approvalHash
}

// RevokeWallet revokes approval for a wallet
func (r *ApprovalRegistry) RevokeWallet(walletAddress string) {
	delete(r.Approvals, walletAddress)
	fmt.Printf("Treasury: Revoked approval for wallet %s\n", walletAddress)
}

// IsApproved checks if a wallet has a valid approval matching the provided hash
func (r *ApprovalRegistry) IsApproved(walletAddress string, approvalHash string) bool {
	storedHash, exists := r.Approvals[walletAddress]
	return exists && storedHash == approvalHash
}
