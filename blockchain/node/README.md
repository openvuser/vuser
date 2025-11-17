# Vuser Node (Validator)

This is the Vuser blockchain node software. It implements a unique Proof-of-Stake consensus.

## Consensus: Proof-of-Participation

Our consensus model is designed to reward active participants.

1.  **Eligibility Pool:** The validator pool consists *only* of the last 100 unique addresses to send a transaction.
2.  **Selection:** For each new block, one address is randomly selected from this pool.
3.  **Weight:** All 100 addresses have **unit weight** (equal weight). It does not matter how many tokens an address holds; everyone in the pool has a 1% chance of being selected.

This model incentivizes using the protocol, not just holding tokens.