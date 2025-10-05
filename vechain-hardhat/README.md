# VeHelp Smart Contract - Hardhat Project

This project showcases the deployment and interaction with the **VeHelp** smart contract on VeChain using the VeChain SDK Hardhat plugin. VeHelp is a disaster relief donation platform that enables transparent fund management for humanitarian crises.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Smart Contract Overview](#smart-contract-overview)
- [Deployment](#deployment)
- [Testing and Interaction](#testing-and-interaction)
- [Network Options](#network-options)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

## Introduction

The hardhat-plugin package serves as a crucial link between Hardhat and the VeChain SDK, simplifying the process of creating, testing, and interacting with smart contracts on the VeChainThor blockchain network. This project specifically demonstrates the deployment and testing of the **VeHelp** contract, a donation management system for disaster relief.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

For VeChain testnet deployment, you'll need:
- VET tokens on VeChain testnet (get them from the [VeChain faucet](https://faucet.vecha.in/))
- A mnemonic phrase or private key for deployment

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd vechain-hardhat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Verify installation**:
   ```bash
   npx hardhat --version
   ```

## Project Structure

```
vechain-hardhat/
├── contracts/
│   └── VeHelp.sol              # Main VeHelp smart contract
├── scripts/
│   ├── deploy-vehelp.ts        # Deployment script for VeHelp
│   ├── interact-vehelp.ts      # Interaction script (Hardhat-based)
│   └── standalone-interact-godshand-final.js  # Standalone interaction script
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Configuration

### Hardhat Config (`hardhat.config.ts`)

The configuration file defines multiple network options:

1. **vechain_testnet**: VeChain testnet (recommended for development)
2. **vechain_solo**: Local Thor solo node (for local testing)
3. **vechain_mainnet**: VeChain mainnet (for production)

**Important Configuration Details:**

- **Solidity Version**: 0.8.20 with Shanghai EVM version
- **Optimizer**: Enabled with 200 runs
- **Default Accounts**: Configured with mnemonic-based HD wallet derivation
- **Network Requirements**: Network names must contain "vechain"

### Configuring Your Wallet

To deploy with your own wallet, edit `hardhat.config.ts`:

**Option 1 - Using Mnemonic (Recommended for Testnet):**
```typescript
vechain_testnet: {
    url: 'https://testnet.vechain.org',
    accounts: {
        mnemonic: 'YOUR_MNEMONIC_PHRASE_HERE',
        path: HDKey.VET_DERIVATION_PATH,
        count: 3,
        initialIndex: 0,
        passphrase: 'vechainthor'
    },
    // ... other config
}
```

**Option 2 - Using Private Key:**
```typescript
vechain_testnet: {
    url: 'https://testnet.vechain.org',
    accounts: ['YOUR_PRIVATE_KEY_HERE'],
    // ... other config
}
```

⚠️ **Security Warning**: Never commit private keys or mnemonics to version control. Use environment variables instead:

```typescript
accounts: {
    mnemonic: process.env.MNEMONIC || 'default mnemonic',
    path: HDKey.VET_DERIVATION_PATH,
}
```

## Smart Contract Overview

### VeHelp Contract

The VeHelp contract (`contracts/VeHelp.sol`) manages disaster relief donations with the following features:

**Core Functionality:**
- **Create Disaster**: Register new disaster relief campaigns
- **Donate**: Accept VET donations for specific disasters
- **Track Donations**: Monitor individual and total contributions
- **Unlock Funds**: Controlled fund distribution to recipients
- **Status Management**: Activate/deactivate disaster campaigns

**Key Functions:**
- `createDisaster(title, metadata, targetAmount)` - Create a new disaster relief campaign
- `donateToDisaster(disasterHash)` - Donate VET to a specific disaster
- `getDisasterDetails(disasterHash)` - Retrieve disaster information
- `unlockFunds(disasterHash, amount, recipient)` - Distribute funds (owner only)
- `getAllDisasterHashes()` - Get list of all registered disasters
- `getFundingProgress(disasterHash)` - Check funding percentage

**Events:**
- `DisasterCreated` - Emitted when a new disaster is created
- `DonationMade` - Emitted when a donation is received
- `FundsUnlocked` - Emitted when funds are distributed

## Deployment

### Step 1: Compile the Contract

Before deployment, compile the smart contract:

```bash
npm run compile
# or
npx hardhat compile
```

This will:
- Compile all Solidity contracts in the `contracts/` folder
- Generate artifacts in the `artifacts/` folder
- Create TypeScript type definitions (if TypeChain is configured)

**Expected Output:**
```
Compiled 1 Solidity file successfully
```

### Step 2: Deploy to VeChain Testnet

Deploy the VeHelp contract using the dedicated deployment script:

```bash
npm run deploy-vehelp
# or
npx hardhat run scripts/deploy-vehelp.ts --network vechain_testnet
```

**What Happens During Deployment:**

1. Connects to VeChain testnet using the configured account
2. Deploys the VeHelp contract
3. Waits for deployment confirmation
4. Displays contract address and initial state

**Expected Output:**
```
Starting VeHelp contract deployment...

Deploying with account: 0x1234...5678

Deploying VeHelp contract...

✅ VeHelp contract successfully deployed!
Contract Address: 0xabcd...ef01
Owner: 0x1234...5678

📊 Initial Contract State:
Total Disasters: 0
Contract Balance: 0.0 VET
```

**📝 Important**: Save the contract address! You'll need it for interaction.

### Step 3: Verify Deployment (Optional)

After deployment, verify the contract on VeChain Explorer:

1. Visit [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
2. Search for your contract address
3. Verify the contract code and transactions

### Deploy to Solo Network (Local Testing)

For local development using Thor solo node:

1. **Start Thor Solo**:
   ```bash
   docker run -d -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669
   ```

2. **Deploy**:
   ```bash
   npm run deploy-solo
   # or
   npx hardhat run scripts/deploy-vehelp.ts --network vechain_solo
   ```

## Testing and Interaction

### Method 1: Hardhat-Based Interaction (Recommended)

The `interact-vehelp.ts` script provides comprehensive contract testing:

```bash
npm run interact-vehelp
# or
npx hardhat run scripts/interact-vehelp.ts --network vechain_testnet
```

**What This Script Does:**

1. **Connects to deployed contract** using the hardcoded address
2. **Checks initial state** - displays contract owner, balance, and disaster count
3. **Creates a new disaster** - creates "Earthquake Relief Fund" with 100 VET target
4. **Makes multiple donations** - simulates 3 donations from different accounts
5. **Retrieves disaster details** - displays title, metadata, funding progress
6. **Checks individual contributions** - shows how much each donor contributed
7. **Views donation history** - lists all donations with timestamps
8. **Unlocks funds** - demonstrates fund distribution by owner
9. **Lists all disasters** - shows all registered disaster campaigns

**Important**: Before running, update the contract address in `scripts/interact-vehelp.ts`:

```typescript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

**Expected Output:**
```
🔗 Connecting to VeHelp contract on VeChain Testnet...

👤 Owner address: 0x1234...5678
👤 Donor 1 address: 0x2345...6789
👤 Donor 2 address: 0x3456...7890

📊 INITIAL CONTRACT STATE
==================================================
Total Disasters: 0
Contract Balance: 0.0 VET
Contract Owner: 0x1234...5678

🆕 CREATING A NEW DISASTER
==================================================
Creating disaster with:
- Title: Earthquake Relief Fund
- Target: 100.0 VET
✅ Disaster created!
Disaster Hash: 0xabcd...ef01

📋 DISASTER DETAILS
==================================================
Title: Earthquake Relief Fund
Target Amount: 100.0 VET
Total Donated: 0.0 VET
Funding Progress: 0%

💰 MAKING DONATIONS
==================================================
Donor 1 donating 10.0 VET...
✅ Donation 1 successful!
...

✨ FINAL SUMMARY
==================================================
✅ Successfully created disaster
✅ Successfully processed 3 donations
✅ Successfully unlocked funds
✅ All contract functions working perfectly!

🎉 VeHelp contract is fully operational on VeChain Testnet!
```

### Method 2: Standalone Interaction Script

The standalone script (`standalone-interact-godshand-final.js`) provides lower-level VeChain SDK interaction:

1. **Update the configuration** in the script:
   ```javascript
   const CONFIG = {
       NETWORK_URL: 'https://testnet.vechain.org',
       CONTRACT_ADDRESS: 'YOUR_CONTRACT_ADDRESS',
       MNEMONIC: 'your mnemonic phrase here'
   };
   ```

2. **Run the script**:
   ```bash
   node scripts/standalone-interact-godshand-final.js
   ```

**Use Cases:**
- More granular control over transaction signing
- Custom VeChain SDK integration
- Debugging transaction issues
- Understanding VeChain-specific transaction handling

### Method 3: Manual Testing with Hardhat Console

For interactive testing:

```bash
npx hardhat console --network vechain_testnet
```

Then in the console:
```javascript
// Get contract factory
const VeHelp = await ethers.getContractFactory('VeHelp');

// Connect to deployed contract
const veHelp = VeHelp.attach('YOUR_CONTRACT_ADDRESS');

// Check owner
const owner = await veHelp.owner();
console.log('Owner:', owner);

// Create disaster
const tx = await veHelp.createDisaster(
    'Test Disaster',
    '{"location": "Test"}',
    ethers.parseEther('100')
);
await tx.wait();

// Get all disasters
const disasters = await veHelp.getAllDisasterHashes();
console.log('Disasters:', disasters);
```

## Network Options

### VeChain Testnet (Recommended for Development)

- **URL**: `https://testnet.vechain.org`
- **Explorer**: https://explore-testnet.vechain.org/
- **Faucet**: https://faucet.vecha.in/
- **Gas**: Free (sponsored transactions available)

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-vehelp.ts --network vechain_testnet
```

### Thor Solo (Local Development)

- **URL**: `http://127.0.0.1:8669`
- **Pre-funded accounts**: 10 accounts with VET/VTHO
- **Fast block times**: Immediate transaction confirmation

**Setup:**
```bash
# Using Docker
docker run -d -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669

# Deploy
npx hardhat run scripts/deploy-vehelp.ts --network vechain_solo
```

### VeChain Mainnet (Production)

- **URL**: `https://mainnet.vechain.org`
- **Explorer**: https://explore.vechain.org/

⚠️ **Warning**: Mainnet deployment uses real VET. Thoroughly test on testnet first!

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-vehelp.ts --network vechain_mainnet
```

## Advanced Configuration

### Fee Delegation (Gas Payer)

VeChain supports fee delegation, allowing another account to pay transaction fees:

**Option 1 - Gas Payer Service URL:**
```typescript
vechain_testnet: {
    url: 'https://testnet.vechain.org',
    gasPayer: {
        gasPayerServiceUrl: 'https://sponsor-testnet.vechain.energy/by/883'
    },
    enableDelegation: true,
    // ... other config
}
```

**Option 2 - Gas Payer Private Key:**
```typescript
vechain_testnet: {
    url: 'https://testnet.vechain.org',
    gasPayer: {
        gasPayerPrivateKey: 'GAS_PAYER_PRIVATE_KEY'
    },
    enableDelegation: true,
    // ... other config
}
```

### Debug Mode

Enable detailed logging for development:

```typescript
vechain_testnet: {
    // ...
    debug: true,
    // ...
}
```

### Custom Gas Settings

Adjust gas parameters:

```typescript
vechain_testnet: {
    // ...
    gas: 'auto',           // or specific gas limit
    gasPrice: 'auto',      // or specific gas price
    gasMultiplier: 1,      // multiply estimated gas by this factor
    // ...
}
```

### EVM Version Configuration

The project uses Shanghai EVM version for post-Galactica hard fork compatibility:

```typescript
solidity: {
    compilers: [{
        version: '0.8.20',
        settings: {
            evmVersion: 'shanghai'  // Use 'paris' for pre-Galactica
        }
    }]
}
```

**Recommendations:**
- Use `"shanghai"` for testnet/mainnet (post-Galactica hard fork)
- Use `"paris"` for older nodes (pre-Galactica hard fork)

## Troubleshooting

### Common Issues and Solutions

#### 1. "Insufficient VTHO" Error

**Problem**: Not enough VTHO (gas token) to deploy.

**Solution**:
- Wait for VTHO to regenerate (VET automatically generates VTHO)
- Get more VET from the testnet faucet
- Use fee delegation (gas payer)

#### 2. "Network name should contain 'vechain'" Error

**Problem**: Network configuration is incorrect.

**Solution**: Ensure network name in `hardhat.config.ts` contains "vechain":
```typescript
networks: {
    vechain_testnet: { ... },  // ✅ Correct
    testnet: { ... },          // ❌ Incorrect
}
```

#### 3. Contract Not Deploying

**Problem**: Deployment hangs or fails.

**Solutions**:
- Check network connectivity: `curl https://testnet.vechain.org`
- Verify account has sufficient VET
- Check timeout settings in config (increase if needed)
- Try with debug mode enabled

#### 4. Transaction Not Confirming

**Problem**: Transaction sent but not mined.

**Solutions**:
- Wait longer (testnet can be slow)
- Check transaction on VeChain Explorer
- Increase gas limit if transaction is failing
- Verify network is not experiencing issues

#### 5. Type Errors with ethers.js

**Problem**: BigInt type errors when using ethers v6.

**Solution**: Use the conversion helper from standalone script:
```javascript
function prepareTransaction(tx) {
    const prepared = { ...tx };
    if (typeof prepared.value === 'bigint') {
        prepared.value = '0x' + prepared.value.toString(16);
    }
    return prepared;
}
```

#### 6. "Cannot find module" Errors

**Problem**: Dependencies not installed properly.

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with yarn
rm -rf node_modules yarn.lock
yarn install
```

### Getting Help

If you encounter issues:

1. **Check VeChain Documentation**: https://docs.vechain.org/
2. **VeChain SDK Repository**: https://github.com/vechain/vechain-sdk-js
3. **Hardhat Plugin**: https://github.com/vechain/vechain-sdk-js/tree/main/packages/hardhat-plugin
4. **VeChain Discord**: https://discord.gg/vechain

## Additional Commands

### Compile Contracts
```bash
npm run compile
```

### Clean Build Artifacts
```bash
npx hardhat clean
```

### List Available Networks
```bash
npx hardhat networks
```

### Check Account Balance
```bash
# In Hardhat console
npx hardhat console --network vechain_testnet
> const balance = await ethers.provider.getBalance('YOUR_ADDRESS');
> console.log(ethers.formatEther(balance));
```

## Summary

This project demonstrates a complete workflow for deploying and testing the VeHelp smart contract on VeChain:

1. ✅ Configure Hardhat with VeChain networks
2. ✅ Compile Solidity contracts
3. ✅ Deploy to VeChain testnet
4. ✅ Interact with deployed contract
5. ✅ Test all contract functions
6. ✅ Manage disaster relief donations

The VeHelp contract is production-ready and can be deployed to mainnet after thorough testing on testnet.

## License

MIT
