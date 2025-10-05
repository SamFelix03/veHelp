/**
 * Express Server for GodsHand Disaster Creation API
 * 
 * This server provides REST API endpoints for creating and managing disasters
 * on the GodsHand smart contract deployed on VeChain Testnet.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ThorClient, HardhatVeChainProvider, ProviderInternalBaseWallet, VeChainPrivateKeySigner } from '@vechain/sdk-network';
import vechainEthers from '@vechain/ethers';
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
    NETWORK_URL: 'https://testnet.vechain.org',
    CONTRACT_ADDRESS: '0x6b564f771732476c86edee283344f5678e314c3d',
    MNEMONIC: 'firm forum jeans amount bread arrow section shrug fluid unfold blood distance',
    PORT: process.env.PORT || 3000
};

// Contract ABI - Only the functions we need
const CONTRACT_ABI = [
    "function createDisaster(string memory _title, string memory _metadata, uint256 _targetAmount) returns (bytes32)",
    "function getAllDisasterHashes() view returns (bytes32[])",
    "function getDisasterDetails(bytes32 _disasterHash) view returns (string memory title, string memory metadata, uint256 targetAmount, uint256 totalDonated, address creator, uint256 timestamp, bool isActive)",
    "function donateToDisaster(bytes32 _disasterHash) payable",
    "function getDisasterFunds(bytes32 _disasterHash) view returns (uint256)"
];

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper function to convert BigInt values to strings for VeChain compatibility
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

// Helper function to get contract instance
async function getContractInstance() {
    try {
        // Initialize Thor client
        const thorClient = ThorClient.fromUrl(CONFIG.NETWORK_URL);
        
        // Derive wallet from mnemonic
        const wallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/0");
        const address = wallet.address;
        const privateKey = Buffer.from(wallet.privateKey.slice(2), 'hex');
        
        // Create provider and signer
        const provider = new HardhatVeChainProvider(
            new ProviderInternalBaseWallet([]),
            CONFIG.NETWORK_URL,
            (message, parent) => new Error(message, parent)
        );
        
        const signer = new VeChainPrivateKeySigner(privateKey, provider);
        
        // Connect to contract
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        return {
            contract,
            address,
            signer
        };
    } catch (error) {
        throw new Error(`Failed to initialize contract: ${error.message}`);
    }
}

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'GodsHand Disaster Creation API',
        version: '1.0.0'
    });
});

// Get wallet address
app.get('/wallet', async (req, res) => {
    try {
        const { address } = await getContractInstance();
        res.json({
            success: true,
            address: address
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create a new disaster
app.post('/disasters', async (req, res) => {
    try {
        const { title, metadata, targetAmountVET } = req.body;
        
        // Validation
        if (!title || !metadata || !targetAmountVET) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, metadata, targetAmountVET'
            });
        }
        
        if (typeof targetAmountVET !== 'number' || targetAmountVET <= 0) {
            return res.status(400).json({
                success: false,
                error: 'targetAmountVET must be a positive number'
            });
        }
        
        // Get contract instance
        const { contract, address } = await getContractInstance();
        
        // Prepare disaster data
        const disasterMetadata = JSON.stringify(metadata);
        const targetAmount = ethers.parseEther(targetAmountVET.toString());
        
        // Create the disaster
        const createTx = await contract.createDisaster(
            title,
            disasterMetadata,
            targetAmount
        );
        
        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the created disaster hash
        const allHashes = await contract.getAllDisasterHashes();
        const disasterHash = allHashes[allHashes.length - 1];
        
        // Get disaster details
        const details = await contract.getDisasterDetails(disasterHash);
        
        res.json({
            success: true,
            disasterHash: disasterHash,
            details: {
                title: details[0],
                metadata: details[1],
                targetAmount: ethers.formatEther(details[2]),
                totalDonated: ethers.formatEther(details[3]),
                creator: details[4],
                timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                isActive: details[6]
            },
            creator: address
        });
        
    } catch (error) {
        console.error('Error creating disaster:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all disaster hashes
app.get('/disasters', async (req, res) => {
    try {
        const { contract } = await getContractInstance();
        const allHashes = await contract.getAllDisasterHashes();
        
        res.json({
            success: true,
            disasters: allHashes,
            count: allHashes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get disaster details by hash
app.get('/disasters/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { contract } = await getContractInstance();
        
        const details = await contract.getDisasterDetails(hash);
        
        res.json({
            success: true,
            disasterHash: hash,
            details: {
                title: details[0],
                metadata: details[1],
                targetAmount: ethers.formatEther(details[2]),
                totalDonated: ethers.formatEther(details[3]),
                creator: details[4],
                timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                isActive: details[6]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get disaster funds by hash
app.get('/disasters/:hash/funds', async (req, res) => {
    try {
        const { hash } = req.params;
        const { contract } = await getContractInstance();
        
        const funds = await contract.getDisasterFunds(hash);
        
        res.json({
            success: true,
            disasterHash: hash,
            funds: ethers.formatEther(funds)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create a sample disaster (for testing)
app.post('/disasters/sample', async (req, res) => {
    try {
        const sampleDisaster = {
            title: 'Sample Disaster Relief Fund',
            metadata: {
                location: 'Test Region',
                severity: 'High',
                date: new Date().toISOString(),
                description: 'Sample emergency relief fund for testing purposes',
                category: 'Test Disaster',
                affectedPopulation: '1000+'
            },
            targetAmountVET: 100
        };
        
        // Get contract instance
        const { contract, address } = await getContractInstance();
        
        // Prepare disaster data
        const disasterMetadata = JSON.stringify(sampleDisaster.metadata);
        const targetAmount = ethers.parseEther(sampleDisaster.targetAmountVET.toString());
        
        // Create the disaster
        const createTx = await contract.createDisaster(
            sampleDisaster.title,
            disasterMetadata,
            targetAmount
        );
        
        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the created disaster hash
        const allHashes = await contract.getAllDisasterHashes();
        const disasterHash = allHashes[allHashes.length - 1];
        
        // Get disaster details
        const details = await contract.getDisasterDetails(disasterHash);
        
        res.json({
            success: true,
            message: 'Sample disaster created successfully',
            disasterHash: disasterHash,
            details: {
                title: details[0],
                metadata: details[1],
                targetAmount: ethers.formatEther(details[2]),
                totalDonated: ethers.formatEther(details[3]),
                creator: details[4],
                timestamp: new Date(Number(details[5]) * 1000).toISOString(),
                isActive: details[6]
            },
            creator: address
        });
        
    } catch (error) {
        console.error('Error creating sample disaster:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(CONFIG.PORT, () => {
    console.log('🚀 GodsHand Disaster Creation API Server');
    console.log('='.repeat(50));
    console.log(`🌐 Server running on port ${CONFIG.PORT}`);
    console.log(`📡 Network: ${CONFIG.NETWORK_URL}`);
    console.log(`📄 Contract: ${CONFIG.CONTRACT_ADDRESS}`);
    console.log();
    console.log('📋 Available endpoints:');
    console.log('  GET  /health              - Health check');
    console.log('  GET  /wallet              - Get wallet address');
    console.log('  POST /disasters           - Create new disaster');
    console.log('  GET  /disasters           - Get all disaster hashes');
    console.log('  GET  /disasters/:hash      - Get disaster details');
    console.log('  GET  /disasters/:hash/funds - Get disaster funds');
    console.log('  POST /disasters/sample    - Create sample disaster');
    console.log();
    console.log('🔗 API Documentation:');
    console.log(`  http://localhost:${CONFIG.PORT}/health`);
    console.log();
});

export default app;