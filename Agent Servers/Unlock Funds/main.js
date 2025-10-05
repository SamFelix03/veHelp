/**
 * Express Server for GodsHand Contract Unlock Funds Functionality
 * Based on standalone-interact-godshand-final.js
 */

import express from 'express';
import cors from 'cors';
import { ThorClient, HardhatVeChainProvider, ProviderInternalBaseWallet, VeChainPrivateKeySigner } from '@vechain/sdk-network';
import vechainEthers from '@vechain/ethers';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const CONFIG = {
    NETWORK_URL: 'https://testnet.vechain.org',
    CONTRACT_ADDRESS: '0x6b564f771732476c86edee283344f5678e314c3d',
    MNEMONIC: 'vivid any call mammal mosquito budget midnight expose spirit approve reject system'
};

// Contract ABI
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function getTotalDisasters() view returns (uint256)",
    "function getContractBalance() view returns (uint256)",
    "function createDisaster(string memory _title, string memory _metadata, uint256 _targetAmount) returns (bytes32)",
    "function getDisasterDetails(bytes32 _disasterHash) view returns (string memory title, string memory metadata, uint256 targetAmount, uint256 totalDonated, address creator, uint256 timestamp, bool isActive)",
    "function donateToDisaster(bytes32 _disasterHash) payable",
    "function getDisasterFunds(bytes32 _disasterHash) view returns (uint256)",
    "function getDonationCount(bytes32 _disasterHash) view returns (uint256)",
    "function getFundingProgress(bytes32 _disasterHash) view returns (uint256)",
    "function getDonorContribution(bytes32 _disasterHash, address _donor) view returns (uint256)",
    "function getDisasterDonations(bytes32 _disasterHash) view returns (tuple(address donor, uint256 amount, uint256 timestamp)[])",
    "function getAllDisasterHashes() view returns (bytes32[])",
    "function unlockFunds(bytes32 _disasterHash, uint256 _amount, address payable _recipient)",
    "event DisasterCreated(bytes32 indexed disasterHash, string title, address indexed creator, uint256 targetAmount)",
    "event DonationMade(bytes32 indexed disasterHash, address indexed donor, uint256 amount, uint256 totalDonated)",
    "event FundsUnlocked(bytes32 indexed disasterHash, address indexed recipient, uint256 amount, address indexed unlockedBy)"
];

/**
 * Helper function to convert BigInt values to strings for VeChain compatibility
 */
function prepareTransaction(tx) {
    const prepared = { ...tx };
    if (prepared.value !== undefined && typeof prepared.value === 'bigint') {
        prepared.value = '0x' + prepared.value.toString(16);
    }
    if (prepared.gasLimit !== undefined && typeof prepared.gasLimit === 'bigint') {
        prepared.gasLimit = '0x' + prepared.gasLimit.toString(16);
    }
    if (prepared.maxFeePerGas !== undefined && typeof prepared.maxFeePerGas === 'bigint') {
        prepared.maxFeePerGas = '0x' + prepared.maxFeePerGas.toString(16);
    }
    if (prepared.maxPriorityFeePerGas !== undefined && typeof prepared.maxPriorityFeePerGas === 'bigint') {
        prepared.maxPriorityFeePerGas = '0x' + prepared.maxPriorityFeePerGas.toString(16);
    }
    return prepared;
}

// Initialize Thor client
const thorClient = ThorClient.fromUrl(CONFIG.NETWORK_URL);

// Derive wallet from mnemonic
const ownerWallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/0");
const ownerAddress = ownerWallet.address;
const ownerPrivateKey = Buffer.from(ownerWallet.privateKey.slice(2), 'hex');

// Create provider and signer
const provider = new HardhatVeChainProvider(
    new ProviderInternalBaseWallet([]),
    CONFIG.NETWORK_URL,
    (message, parent) => new Error(message, parent)
);

const ownerSigner = new VeChainPrivateKeySigner(ownerPrivateKey, provider);

// Connect to contract
const godsHand = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, ownerSigner);

/**
 * POST /unlock-funds
 * Unlock funds from a disaster pool to a recipient address
 */
app.post('/unlock-funds', async (req, res) => {
    try {
        const { disasterHash, amount, recipient } = req.body;

        // Validate required fields
        if (!disasterHash || !amount || !recipient) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: disasterHash, amount, recipient'
            });
        }

        console.log('🔓 UNLOCKING FUNDS');
        console.log('='.repeat(50));
        console.log('Disaster Hash:', disasterHash);
        console.log('Disaster Hash Length:', disasterHash.length);
        console.log('Amount:', amount, 'VET');
        console.log('Recipient:', recipient);
        
        // Validate disaster hash format
        if (!disasterHash.startsWith('0x') || disasterHash.length !== 66) {
            return res.status(400).json({
                success: false,
                error: 'Invalid disaster hash format. Must be 0x followed by 64 hex characters'
            });
        }

        // Convert amount to wei (assuming amount is in VET)
        const unlockAmount = ethers.parseEther(amount.toString());

        // Get recipient balance before
        const recipientBalanceBefore = await thorClient.accounts.getAccount(recipient);
        console.log('Recipient balance before:', ethers.formatEther(BigInt(recipientBalanceBefore.balance)), 'VET');

        // Check if disaster exists and get funds before unlock
        let disasterFundsBefore;
        try {
            disasterFundsBefore = await godsHand.getDisasterFunds(disasterHash);
            console.log('Disaster funds before:', ethers.formatEther(disasterFundsBefore), 'VET');
            
            // Check if disaster has sufficient funds
            if (disasterFundsBefore < unlockAmount) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient funds. Disaster has ${ethers.formatEther(disasterFundsBefore)} VET, trying to unlock ${ethers.formatEther(unlockAmount)} VET`
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Disaster not found or invalid disaster hash'
            });
        }
        
        // Check if current wallet is the contract owner
        try {
            const contractOwner = await godsHand.owner();
            const isOwner = contractOwner.toLowerCase() === ownerAddress.toLowerCase();
            
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    error: `Only contract owner can unlock funds. Contract owner: ${contractOwner}, Current wallet: ${ownerAddress}`,
                    data: {
                        contractOwner,
                        currentWallet: ownerAddress,
                        isOwner: false
                    }
                });
            }
            
            console.log('✅ Wallet verification passed - Current wallet is the contract owner');
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to verify contract ownership'
            });
        }

        // Execute unlock transaction using the same pattern as donations
        console.log('Preparing unlock transaction...');
        const unlockTxReq = await godsHand.unlockFunds.populateTransaction(
            disasterHash,
            unlockAmount,
            recipient
        );
        console.log('Transaction prepared:', unlockTxReq);
        
        const preparedUnlockTx = prepareTransaction(unlockTxReq);
        console.log('Transaction prepared for VeChain:', preparedUnlockTx);
        
        const unlockTx = await ownerSigner.sendTransaction(preparedUnlockTx);
        console.log('Transaction sent! Hash:', unlockTx);
        
        // Wait for transaction confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get updated balances
        const recipientBalanceAfter = await thorClient.accounts.getAccount(recipient);
        const disasterFundsAfter = await godsHand.getDisasterFunds(disasterHash);

        const balanceChange = BigInt(recipientBalanceAfter.balance) - BigInt(recipientBalanceBefore.balance);

        console.log('✅ Funds unlocked successfully!');
        console.log('Recipient balance change:', ethers.formatEther(balanceChange), 'VET');
        console.log('Remaining disaster funds:', ethers.formatEther(disasterFundsAfter), 'VET');

        res.json({
            success: true,
            message: 'Funds unlocked successfully!',
            data: {
                disasterHash,
                amountUnlocked: ethers.formatEther(unlockAmount),
                recipient,
                recipientBalanceChange: ethers.formatEther(balanceChange),
                remainingDisasterFunds: ethers.formatEther(disasterFundsAfter),
                transactionHash: unlockTx.hash || unlockTx || 'Transaction pending'
            }
        });

    } catch (error) {
        console.error('❌ Error unlocking funds:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to unlock funds'
        });
    }
});

/**
 * GET /disaster/:hash
 * Get disaster details
 */
app.get('/disaster/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        const details = await godsHand.getDisasterDetails(hash);
        const funds = await godsHand.getDisasterFunds(hash);
        const donationCount = await godsHand.getDonationCount(hash);
        const fundingProgress = await godsHand.getFundingProgress(hash);

        res.json({
            success: true,
            data: {
                disasterHash: hash,
                title: details[0],
                metadata: details[1],
                targetAmount: ethers.formatEther(details[2]),
                totalDonated: ethers.formatEther(details[3]),
                creator: details[4],
                timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                isActive: details[6],
                currentFunds: ethers.formatEther(funds),
                donationCount: donationCount.toString(),
                fundingProgress: fundingProgress.toString() + '%'
            }
        });

    } catch (error) {
        console.error('❌ Error getting disaster details:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get disaster details'
        });
    }
});

/**
 * GET /disasters
 * Get all disasters
 */
app.get('/disasters', async (req, res) => {
    try {
        const allHashes = await godsHand.getAllDisasterHashes();
        
        const disasters = [];
        for (const hash of allHashes) {
            try {
                const details = await godsHand.getDisasterDetails(hash);
                const funds = await godsHand.getDisasterFunds(hash);
                
                disasters.push({
                    disasterHash: hash,
                    title: details[0],
                    targetAmount: ethers.formatEther(details[2]),
                    totalDonated: ethers.formatEther(details[3]),
                    currentFunds: ethers.formatEther(funds),
                    creator: details[4],
                    timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                    isActive: details[6]
                });
            } catch (err) {
                console.warn(`Failed to get details for disaster ${hash}:`, err.message);
            }
        }

        res.json({
            success: true,
            data: {
                totalDisasters: disasters.length,
                disasters
            }
        });

    } catch (error) {
        console.error('❌ Error getting disasters:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get disasters'
        });
    }
});

/**
 * GET /contract-info
 * Get contract information including balances for all disasters
 */
app.get('/contract-info', async (req, res) => {
    try {
        const totalDisasters = await godsHand.getTotalDisasters();
        const contractBalance = await godsHand.getContractBalance();
        const contractOwner = await godsHand.owner();
        
        // Get all disaster hashes
        const allHashes = await godsHand.getAllDisasterHashes();
        
        // Get detailed information for each disaster including balances
        const disasterBalances = [];
        let totalDisasterFunds = BigInt(0);
        
        for (const hash of allHashes) {
            try {
                const details = await godsHand.getDisasterDetails(hash);
                const funds = await godsHand.getDisasterFunds(hash);
                const donationCount = await godsHand.getDonationCount(hash);
                const fundingProgress = await godsHand.getFundingProgress(hash);
                
                const disasterInfo = {
                    disasterHash: hash,
                    title: details[0],
                    metadata: details[1],
                    targetAmount: ethers.formatEther(details[2]),
                    totalDonated: ethers.formatEther(details[3]),
                    currentFunds: ethers.formatEther(funds),
                    creator: details[4],
                    timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                    isActive: details[6],
                    donationCount: donationCount.toString(),
                    fundingProgress: fundingProgress.toString() + '%'
                };
                
                disasterBalances.push(disasterInfo);
                totalDisasterFunds += funds;
                
            } catch (err) {
                console.warn(`Failed to get details for disaster ${hash}:`, err.message);
                disasterBalances.push({
                    disasterHash: hash,
                    error: err.message,
                    currentFunds: "0"
                });
            }
        }

        res.json({
            success: true,
            data: {
                contractAddress: CONFIG.CONTRACT_ADDRESS,
                networkUrl: CONFIG.NETWORK_URL,
                totalDisasters: totalDisasters.toString(),
                contractBalance: ethers.formatEther(contractBalance),
                totalDisasterFunds: ethers.formatEther(totalDisasterFunds),
                contractOwner,
                ownerAddress,
                disasterBalances: disasterBalances,
                summary: {
                    totalDisasters: disasterBalances.length,
                    totalFundsInDisasters: ethers.formatEther(totalDisasterFunds),
                    averageFundsPerDisaster: disasterBalances.length > 0 ? 
                        ethers.formatEther(totalDisasterFunds / BigInt(disasterBalances.length)) : "0",
                    disastersWithFunds: disasterBalances.filter(d => 
                        d.currentFunds && parseFloat(d.currentFunds) > 0
                    ).length
                }
            }
        });

    } catch (error) {
        console.error('❌ Error getting contract info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get contract info'
        });
    }
});

/**
 * GET /debug/owner-check
 * Check if the current wallet is the contract owner
 */
app.get('/debug/owner-check', async (req, res) => {
    try {
        const contractOwner = await godsHand.owner();
        const isOwner = contractOwner.toLowerCase() === ownerAddress.toLowerCase();
        
        res.json({
            success: true,
            data: {
                contractOwner,
                currentWallet: ownerAddress,
                isOwner,
                canUnlockFunds: isOwner,
                message: isOwner ? 
                    "✅ Current wallet is the contract owner and can unlock funds" : 
                    "❌ Current wallet is NOT the contract owner. Cannot unlock funds."
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /debug/disasters
 * Get all disaster hashes for debugging
 */
app.get('/debug/disasters', async (req, res) => {
    try {
        const allHashes = await godsHand.getAllDisasterHashes();
        const disasters = [];
        
        for (const hash of allHashes) {
            try {
                const details = await godsHand.getDisasterDetails(hash);
                const funds = await godsHand.getDisasterFunds(hash);
                
                disasters.push({
                    disasterHash: hash,
                    title: details[0],
                    currentFunds: ethers.formatEther(funds),
                    targetAmount: ethers.formatEther(details[2]),
                    isActive: details[6]
                });
            } catch (err) {
                disasters.push({
                    disasterHash: hash,
                    error: err.message
                });
            }
        }
        
        res.json({
            success: true,
            data: {
                totalDisasters: disasters.length,
                disasters
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'GodsHand Unlock Funds Server is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 GodsHand Unlock Funds Server running on port ${PORT}`);
    console.log(`📡 Connected to VeChain Testnet: ${CONFIG.NETWORK_URL}`);
    console.log(`📄 Contract Address: ${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`👤 Owner Address: ${ownerAddress}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('  POST /unlock-funds - Unlock funds from disaster pool');
    console.log('  GET  /disaster/:hash - Get disaster details');
    console.log('  GET  /disasters - Get all disasters');
    console.log('  GET  /contract-info - Get contract information');
    console.log('  GET  /debug/owner-check - Check if current wallet is contract owner');
    console.log('  GET  /debug/disasters - Get all disasters with funds (for debugging)');
    console.log('  GET  /health - Health check');
    console.log('');
    console.log('🔗 Server ready to accept requests!');
});

export default app;