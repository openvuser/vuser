package main

import (
	"fmt"
	"math/big"
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

// DistributeBlockReward calculates and distributes the block reward
// 1/3 to Miner, 1/3 to Coalition, 1/3 Burnt
func DistributeBlockReward(minerAddress string, transactions []*Transaction) {
	// Calculate W (total fees)
	W := big.NewInt(0)
	for _, tx := range transactions {
		if tx.Fee != nil {
			W.Add(W, tx.Fee)
		}
	}

	// Block generation = 9 coins
	// Note: In a real system, we'd handle decimals (10^18)
	// Here we assume 9 base units for simplicity or 9 * 10^18
	blockGen := big.NewInt(9)

	// Total Reward = 9 + W
	totalReward := new(big.Int).Add(blockGen, W)

	// Split 1/3
	share := new(big.Int).Div(totalReward, big.NewInt(3))

	// 1. Miner Reward
	// In a real system, this would create a coinbase transaction or update state
	fmt.Printf("Miner %s reward: %s\n", minerAddress, share.String())

	// 2. Coalition Reward
	DepositToTreasury(share, "Block Reward Share")

	// 3. Burn
	fmt.Printf("Burnt amount: %s\n", share.String())
}
