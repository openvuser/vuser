package main

import (
	"math/rand"
	"time"
)

// Proposal represents a pre-submitted block proposal
type Proposal struct {
	MinerAddress string
	Transactions []*Transaction
}

// PreSubmissionPool stores the valid proposals for the next block
var PreSubmissionPool []Proposal

// SubmitProposal adds a proposal to the pool
func SubmitProposal(miner string, txs []*Transaction) {
	PreSubmissionPool = append(PreSubmissionPool, Proposal{MinerAddress: miner, Transactions: txs})
}

// SelectPrimaryMiner selects a primary miner from the pool using randomness
func SelectPrimaryMiner() Proposal {
	if len(PreSubmissionPool) == 0 {
		return Proposal{}
	}
	rand.Seed(time.Now().UnixNano())
	winnerIndex := rand.Intn(len(PreSubmissionPool))
	return PreSubmissionPool[winnerIndex]
}

// GetNextMiner returns the next miner in the pool (deterministic fallback)
// In a real system, this would be based on a deterministic ordering (e.g., hash of address)
// Here we just rotate to the next index for simplicity
func GetNextMiner(currentMiner Proposal) Proposal {
	if len(PreSubmissionPool) == 0 {
		return Proposal{}
	}

	// Find current index
	currentIndex := -1
	for i, p := range PreSubmissionPool {
		if p.MinerAddress == currentMiner.MinerAddress {
			currentIndex = i
			break
		}
	}

	if currentIndex == -1 {
		return PreSubmissionPool[0] // Should not happen if miner is in pool
	}

	// Rotate
	nextIndex := (currentIndex + 1) % len(PreSubmissionPool)
	return PreSubmissionPool[nextIndex]
}
