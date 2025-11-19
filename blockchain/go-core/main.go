package main

import (
	"fmt"
	"math/big"
	"math/rand"
	"time"
)

func main() {
	fmt.Println("Starting Vuser Blockchain Core...")

	// Initialize Blockchain with Genesis Block
	// Initialize Blockchain with Genesis Block
	t := time.Now()
	// Genesis Transaction (Coinbase)
	genesisTx := NewTransaction("0", "Treasury", TotalSupply, 0, "Genesis Coin Supply")
	genesisBlock := Block{0, t.String(), []*Transaction{genesisTx}, "", "", ""}
	genesisBlock.Hash = CalculateHash(genesisBlock)
	Blockchain = append(Blockchain, genesisBlock)

	fmt.Printf("Genesis Block Created. Total Supply: %s base units (10^80 %s - %s)\n", TotalSupply.String(), CoinName, CoinSymbol)

	// Create a list of participants (addresses)
	participants := []string{
		"Address1", "Address2", "Address3", "Address4", "Address5",
	}

	// Simulate adding blocks
	for i := 0; i < 5; i++ {
		fmt.Printf("\n--- Round %d ---\n", i+1)

		// 1. Pre-Submission Phase
		PreSubmissionPool = []Proposal{} // Clear pool for new round
		for _, p := range participants {
			// Create a dummy transaction for the proposal
			tx := NewTransaction(p, "Treasury", big.NewInt(10), i, fmt.Sprintf("Reward Claim %d", i))
			SubmitProposal(p, []*Transaction{tx})
		}
		fmt.Printf("Pre-Submission Pool size: %d\n", len(PreSubmissionPool))

		// 2. Selection Phase
		primaryMiner := SelectPrimaryMiner()
		fmt.Printf("Primary Miner Selected: %s\n", primaryMiner.MinerAddress)

		// 3. Execution Phase (with simulated fallback)
		// Simulate primary miner being offline 20% of the time
		activeMiner := primaryMiner
		rand.Seed(time.Now().UnixNano())
		if rand.Intn(10) < 2 {
			fmt.Printf("Primary Miner %s is OFFLINE! Initiating Fallback...\n", primaryMiner.MinerAddress)
			activeMiner = GetNextMiner(primaryMiner)
			fmt.Printf("Fallback Miner Selected: %s\n", activeMiner.MinerAddress)
		}

		newBlock := GenerateBlock(Blockchain[len(Blockchain)-1], activeMiner.Transactions, activeMiner.MinerAddress)

		if IsBlockValid(newBlock, Blockchain[len(Blockchain)-1]) {
			Blockchain = append(Blockchain, newBlock)
			fmt.Printf("Block %d added by %s. Hash: %s\n", newBlock.Index, newBlock.Validator, newBlock.Hash)
			fmt.Printf("Transactions: %d\n", len(newBlock.Transactions))
		} else {
			fmt.Println("Block invalid!")
		}

		// Simulate time delay
		time.Sleep(100 * time.Millisecond)
	}

	fmt.Println("Blockchain valid!")
	for _, block := range Blockchain {
		fmt.Printf("Index: %d, Hash: %s, Validator: %s, Txs: %d\n", block.Index, block.Hash, block.Validator, len(block.Transactions))
	}

	fmt.Println("\n--- VEP2 Treasury Simulation ---")

	// 1. Treasury approves a wallet
	userWallet := "Address1"
	approvalHash := Registry.ApproveWallet(userWallet)

	// 2. User attempts a funded action
	// Create a transaction with the approval hash in payload
	fmt.Printf("User %s attempting funded action with hash %s...\n", userWallet, approvalHash)

	fundedTx := NewTransaction(userWallet, "Service", big.NewInt(0), 1, "Approval:"+approvalHash)

	if Registry.IsApproved(userWallet, approvalHash) {
		fmt.Println("Action Successful: Funded by Treasury (VOC)")
		fmt.Printf("Transaction ID: %s\n", fundedTx.ID)
	} else {
		fmt.Println("Action Failed: Not Approved")
	}

	// 3. Treasury revokes approval
	Registry.RevokeWallet(userWallet)

	// 4. User attempts action again
	fmt.Printf("User %s attempting funded action again...\n", userWallet)
	if Registry.IsApproved(userWallet, approvalHash) {
		fmt.Println("Action Successful: Funded by Treasury (VOC)")
	} else {
		fmt.Println("Action Failed: Not Approved (Revoked)")
	}
}
