Vuser Protocol

1. Why Vuser? The "Time-Scarcity Deficit"

The internet's economy is capped by a single, finite resource: user attention. A user has, at most, a few hours per day for active consumption ($T_{human}$). This "Time-Scarcity Deficit" creates a zero-sum game where every service and publisher must fight for the same limited pool of time.

Vuser introduces a new economic primitive: the Virtual User (VU). This is a user-directed, AI-powered agent that unlocks a new, programmatic consumption layer ($T_{virtual}$).

$$T_{total} = T_{human} + T_{virtual}$$

This new, parallel "Consumption Surplus" allows users to be "infinitely available," performing valuable tasks (booking, managing, paying) that they want done but do not have the time to do themselves.

We represent this core concept as the transformation of a finite, ticking clock (O) into a symbol of infinite, unlocked availability (∞).

► View the Vuser Tokenomics Stability (https://vuser.org/sim.html)

2. What is Vuser?

Vuser is a complete, three-layer protocol designed to securely manage this new "Consumption Surplus." It is a coalition of users, publishers, and AI, creating a trust layer for the virtualized web.

```mermaid

graph LR
    u1[User (Wallet & Intent)] --> AIO[AI Orchestrator (Browser Extension)];
    AIO --> BL[Blockchain Trust Layer];
    BL --> AIO;
    AIO --> MCP[Publisher's MCP Node (vuser-manifest.json)];
    MCP --> Site[Publisher's Website];


```


The AI Orchestrator (Agent Layer): The user-facing browser extension. It's an AI-native platform that translates a user's "fuzzy" natural language intent into a specific, deterministic function call.

The MCP (Manifest Layer): The publisher-facing vuser-manifest.json file. This is a public "API" where publishers explicitly define the functions (and their costs) that the AI is permitted to run.

The Blockchain (Trust Layer): The decentralized "ring-fence" that acts as the single source of truth for permissions and value.

3. How It Works: The Vuser Stack

3.1. The AI Orchestrator (AIO)

This is not another AI interpreter. Current agents are brittle "interpreters" that use AI to guess where to click, breaking on any site redesign.

The Vuser AIO is an orchestrator. It performs stochastic-to-deterministic translation:

* Stochastic (Fuzzy) Input: User: "I need to fly to Boston tomorrow."

* Deterministic (Exact) Output: AIO: "Calling publisher's bookFlight() function with params {dest: 'BOS', date: '...'}."

The AIO's only job is to be a lightweight "router," delegating the task to the publisher's own pre-defined function. This is called Functional Delegation. It's secure, resilient to redesigns, and turns AI traffic from an adversary into a cooperative partner.

3.2. The Blockchain (Trust & Consensus Layer)

The blockchain is the "ring-fence" that provides the safety net for all participants.

Consensus: Proof-of-Participation (PoP)

Vuser does not use PoW or standard PoS. It uses Proof-of-Participation (PoP) to ensure the network is secured by its active participants, not its wealthiest ones.

* Eligibility Pool: The right to create a new block is limited to the last 100 unique wallet addresses to send a transaction.

* Unit Stake: Every address in this pool has unit stake. Each has an equal 1% chance of being selected.

This model directly rewards users and publishers for using the protocol.

Tokenomics: The Self-Funding Economy

The Vuser chain is designed as a perpetually-funded, stable utility.

* Genesis: 10^80 coins are created to fund transactions in perpetuity.

* Block Reward: A block generates 9 new coins.

* Winner's Pot (W): All transaction fees (W) in a block are collected.

* Total Reward: 9 + W

* Distribution: This total reward is split in three:

    * 1/3 to the Miner (the PoP winner).

    * 1/3 to the Coalition (a treasury to fund publisher fees).

    * 1/3 is Burnt.

This creates the Master Equation of the Vuser Economy:

```
Net Supply Change = (Coins Created) - (Coins Burnt)
Net Supply Change = 9 - ( (9 + W) / 3 )
Net Supply Change = 9 - 3 - (W / 3)

```



S_net = 6 - (W / 3)

This simple equation proves the system's stability:

* Equilibrium (S_net = 0): The chain is perfectly stable when W = 18.

* Bootstrap Phase (W < 18): The chain is inflationary, guaranteeing a reward for miners to secure the network when usage is low.

* Growth Phase (W > 18): The chain becomes deflationary. As utility ($W$) increases, the supply shrinks, increasing the value for all holders.

This model is self-funding: The Coalition's 1/3 share is used to pay the transaction fees for "Approved Publishers," creating a powerful incentive for publishers to join the ecosystem.

3.3. The Publisher SDK (Integration Layer)

How does a publisher join? They simply host a vuser-manifest.json file in their site's root.

This file (defined by our schema.json) is their "API" for the AIO. It's where they list:

* Permitted Functions: {"name": "bookFlight", ...}

* Parameters: {"name": "destination", "type": "string"}

* Cost: {"cost": "0.1 VUSER"}

The integration/publisher-sdk in this repo provides the tools for publishers to validate their manifest and test it against a mock AIO.

4. Where to Find Things (Repository Structure)

This is a monorepo containing all Vuser Protocol components.
```monorepo
vuser/
│
├── browser-extension/
│   ├── src/
│   │   ├── agent/         # The AI Orchestrator (AIO) logic
│   │   ├── mcp/           # MCP node parser and executor
│   │   ├── ui/            # Browser popup (React, etc.)
│   │   └── wallet/        # UI components for wallet-core
│   └── build/
│       ├── manifest.chrome.json
│       └── manifest.firefox.json
│
├── blockchain/
│   ├── contracts/         # Solidity contracts (PermissionRegistry.sol)
│   ├── node/              # The full blockchain node (with PoP consensus)
│   └── wallet-core/       # The core JS wallet logic (key management)
│
├── integration/
│   ├── publisher-sdk/     # CLI tools for publishers (validator, tester)
│   └── example-site/      # A sample site with a vuser-manifest.json
│
├── docs/
│   ├── README.md          # (You are here)
│   ├── ai-orchestrator.md # AI Orchestrator Whitepaper
│   ├── blockchain.md      # Blockchain Layer Whitepaper
│   └── roadmap.md         # Project Roadmap
│
└── demo/
    └── infinity-loop.html # The animation of O -> ∞



```


5. Getting Started

This project has three apps; Browser Platform, Blockchain & Integration SDK. 

* `/browser-extension`: The unified (Chrome + Firefox) browser extension.
* `/blockchain`: The Vuser blockchain node (`/node`), core wallet logic (`/wallet-core`), and smart contracts (`/contracts`).
* `/integration`: The SDK for publishers (`/publisher-sdk`) and an example site (`/example-site`).
* `/docs`: All technical specifications for the protocol.


(See individual package README.md files for specific instructions on running the node, building the extension, etc.)

6. Learn More

[Blockchain Layer Whitepaper:](/docs/Blockchain-Whitepaper.md)  A deep dive into the PoP consensus and tokenomic model.

[AI Orchestrator Whitepaper](/docs/AI-Whitepaper.md): A detailed explanation of the AIO and Functional Delegation.

[Project Roadmap]((/docs/roadmap.md)): The phased plan for development and launch.