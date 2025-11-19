# Walkthrough - Vuser Protocol

I have enhanced the Chrome extension to list all open tabs, exposed an API via Native Messaging, and implemented the Blockchain Core in Go.

## 1. Chrome Extension & API

### Features
- **Tab Listing**: Popup displays all open tabs.
- **Tab State API**: `GET http://localhost:8080/tabs` returns tab state via Native Messaging.

### Installation & Setup
1.  **Load Extension**: Load `browser-extension` in Chrome Developer Mode. Copy the ID.
2.  **Install Native Host**:
    -   Edit `native-test-host/org.vuser.protocol.host.json` and replace `<EXTENSION_ID>`.
    -   Run `./install_host.sh`.
3.  **Verify**: Reload extension, then run `curl http://localhost:8080/tabs`.

## 2. Blockchain Core (Go)

I have implemented the core blockchain logic in Go.

### Components
-   **Block**: Structure with Index, Timestamp, Data, Hash, PrevHash, Validator.
-   **Blockchain**: Chain management and validation logic.
-   **Proof of Participation**: Miner selection based on recent activity (last 100 unique addresses).
-   **Pre-Submission Pool**: Liveness enhancement allowing advance block proposals and fallback rotation.
-   **Genesis Supply**: Total supply of $10^{80}$ coins (18 decimals). Coin Name: **Vuser Open Coin (VOC)**.
-   **Treasury Mechanism**: Centralized approval registry for funded operations (VEP2).
-   **Smart Contracts**: `VuserApprovalRegistry.sol` deployed for managing approvals.
-   **Legacy Node**: Updated `node/consensus/pos.js` to `pop.js` with VEP1/VEP2 logic.
-   **Wallet**: Go-based wallet with ECDSA signing and persistence.
-   **Transactions**: Implemented `Transaction` struct with ID, Sender, Recipient, Amount, Nonce, Signature, and Payload.

### Location
The Go implementation is located in `blockchain/go-core`.

### Verification

#### Prerequisites
-   **Go**: Ensure Go is installed (`go version`).

#### Running the Demo
1.  Navigate to the directory:
    ```bash
    cd blockchain/go-core
    ```
2.  Run the main program:
    ```bash
    go run .
    ```
    You should see the blockchain being initialized, blocks being added by validators, and a final validation success message.

#### Running Unit Tests
1.  Run the tests:
    ```bash
    go test ./...
    ```
    This verifies block validation, blockchain integrity, and wallet creation.
