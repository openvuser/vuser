const ConsensusEngine = require('./pop');

function runTests() {
    console.log("Running Consensus Engine Tests...");
    const engine = new ConsensusEngine();

    // 1. Test PoP Eligibility
    console.log("\n1. Testing PoP Eligibility...");
    const participants = ["Addr1", "Addr2", "Addr3", "Addr4", "Addr5"];
    participants.forEach(p => engine.addTransactionSender(p));
    console.log("Eligible Miners:", engine.getEligibleMiners());
    if (engine.eligibilityPool.size !== 5) console.error("FAIL: Pool size mismatch");
    else console.log("PASS: Pool size correct");

    // 2. Test VEP1 Pre-Submission
    console.log("\n2. Testing VEP1 Pre-Submission...");
    participants.forEach(p => engine.submitProposal(p, `Block Data from ${p}`));
    console.log("Pre-Submission Pool Size:", engine.preSubmissionPool.size);
    
    const primary = engine.selectPrimaryMiner();
    console.log("Primary Miner Selected:", primary.miner);

    const fallback = engine.getNextMiner(primary.miner);
    console.log("Fallback Miner Selected:", fallback.miner);
    if (primary.miner === fallback.miner && participants.length > 1) console.error("FAIL: Fallback should rotate");
    else console.log("PASS: Fallback rotation works");

    // 3. Test VEP2 Treasury
    console.log("\n3. Testing VEP2 Treasury...");
    const user = "Addr1";
    const hash = engine.approveWallet(user);
    console.log(`Approved ${user} with hash ${hash}`);
    
    if (engine.isActionFunded(user, hash)) console.log("PASS: Action Funded");
    else console.error("FAIL: Action not funded");

    engine.revokeWallet(user);
    if (!engine.isActionFunded(user, hash)) console.log("PASS: Revocation works");
    else console.error("FAIL: Revocation failed");
}

runTests();
