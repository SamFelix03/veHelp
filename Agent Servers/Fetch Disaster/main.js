/**
 * Express Server for Fetching Disaster Details Using Disaster Hash
 * 
 * This server provides REST API endpoints for fetching disaster information
 * from the GodsHand smart contract deployed on VeChain Testnet using disaster hashes.
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
    PORT: process.env.PORT || 3001
};

// Contract ABI - Focused on disaster fetching functions
const CONTRACT_ABI = [
    "function getTotalDisasters() view returns (uint256)",
    "function getAllDisasterHashes() view returns (bytes32[])",
    "function getDisasterDetails(bytes32 _disasterHash) view returns (string memory title, string memory metadata, uint256 targetAmount, uint256 totalDonated, address creator, uint256 timestamp, bool isActive)",
    "function getDisasterFunds(bytes32 _disasterHash) view returns (uint256)",
    "function getDonationCount(bytes32 _disasterHash) view returns (uint256)",
    "function getFundingProgress(bytes32 _disasterHash) view returns (uint256)",
    "function getDonorContribution(bytes32 _disasterHash, address _donor) view returns (uint256)",
    "function getDisasterDonations(bytes32 _disasterHash) view returns (tuple(address donor, uint256 amount, uint256 timestamp)[])",
    "function owner() view returns (address)",
    "function getContractBalance() view returns (uint256)"
];

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize VeChain components
let thorClient;
let provider;
let signer;
let godsHandContract;

async function initializeVeChain() {
    try {
        console.log('🔗 Initializing VeChain connection...');
        
        // Initialize Thor client
        thorClient = ThorClient.fromUrl(CONFIG.NETWORK_URL);
        
        // Derive wallet from mnemonic
        const wallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/0");
        const privateKey = Buffer.from(wallet.privateKey.slice(2), 'hex');
        
        // Create provider and signer
        provider = new HardhatVeChainProvider(
            new ProviderInternalBaseWallet([]),
            CONFIG.NETWORK_URL,
            (message, parent) => new Error(message, parent)
        );
        
        signer = new VeChainPrivateKeySigner(privateKey, provider);
        
        // Connect to contract
        godsHandContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        console.log('✅ VeChain connection initialized successfully');
        console.log('📍 Contract Address:', CONFIG.CONTRACT_ADDRESS);
        console.log('👤 Wallet Address:', wallet.address);
        
    } catch (error) {
        console.error('❌ Failed to initialize VeChain connection:', error);
        throw error;
    }
}

// Helper function to validate disaster hash
function validateDisasterHash(hash) {
    if (!hash) {
        throw new Error('Disaster hash is required');
    }
    
    // Remove 0x prefix if present
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    
    // Check if it's a valid hex string
    if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
        throw new Error('Invalid disaster hash format. Must be 64 hex characters.');
    }
    
    // Return the hash with 0x prefix for proper bytes32 format
    return '0x' + cleanHash;
}

// Helper function to format disaster details
function formatDisasterDetails(details) {
    return {
        title: details[0],
        metadata: details[1],
        targetAmount: ethers.formatEther(details[2]),
        totalDonated: ethers.formatEther(details[3]),
        creator: details[4],
        timestamp: new Date(Number(details[5]) * 1000).toISOString(),
        isActive: details[6],
        fundingProgress: details[2] > 0 ? (Number(details[3]) / Number(details[2])) * 100 : 0
    };
}

// Helper function to format donation details
function formatDonationDetails(donations) {
    return donations.map((donation, index) => ({
        index: index + 1,
        donor: donation.donor,
        amount: ethers.formatEther(donation.amount),
        timestamp: new Date(Number(donation.timestamp) * 1000).toISOString()
    }));
}

// ===== API ENDPOINTS =====

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'disaster-fetch-server',
        timestamp: new Date().toISOString(),
        network: CONFIG.NETWORK_URL,
        contract: CONFIG.CONTRACT_ADDRESS
    });
});

// Get all disaster hashes
app.get('/api/disasters/hashes', async (req, res) => {
    try {
        const hashes = await godsHandContract.getAllDisasterHashes();
        const formattedHashes = hashes.map(hash => hash.toString());
        
        res.json({
            success: true,
            totalDisasters: hashes.length,
            hashes: formattedHashes,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching disaster hashes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch disaster hashes',
            message: error.message
        });
    }
});

// Get disaster details by hash
app.get('/api/disasters/:hash', async (req, res) => {
    try {
        const disasterHash = validateDisasterHash(req.params.hash);
        
        console.log(`🔍 Fetching details for disaster hash: ${disasterHash}`);
        
        // Get disaster details
        const details = await godsHandContract.getDisasterDetails(disasterHash);
        
        // Check if disaster exists
        if (!details[0]) { // title is empty
            return res.status(404).json({
                success: false,
                error: 'Disaster not found',
                hash: disasterHash.slice(2) // Remove 0x prefix for response
            });
        }
        
        // Get additional information
        const [funds, donationCount, fundingProgress] = await Promise.all([
            godsHandContract.getDisasterFunds(disasterHash),
            godsHandContract.getDonationCount(disasterHash),
            godsHandContract.getFundingProgress(disasterHash)
        ]);
        
        const formattedDetails = formatDisasterDetails(details);
        
        res.json({
            success: true,
            disaster: {
                hash: disasterHash.slice(2), // Remove 0x prefix for response
                ...formattedDetails,
                funds: ethers.formatEther(funds),
                donationCount: donationCount.toString(),
                fundingProgressPercentage: fundingProgress.toString()
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching disaster details:', error);
        
        // Check if it's a contract revert error
        if (error.message && error.message.includes('Disaster does not exist')) {
            return res.status(404).json({
                success: false,
                error: 'Disaster not found',
                message: 'The disaster hash does not exist in the contract',
                hash: req.params.hash
            });
        }
        
        res.status(400).json({
            success: false,
            error: 'Failed to fetch disaster details',
            message: error.message
        });
    }
});

// Get disaster donations by hash
app.get('/api/disasters/:hash/donations', async (req, res) => {
    try {
        const disasterHash = validateDisasterHash(req.params.hash);
        
        console.log(`💰 Fetching donations for disaster hash: ${disasterHash}`);
        
        // Get all donations for this disaster
        const donations = await godsHandContract.getDisasterDonations(disasterHash);
        
        const formattedDonations = formatDonationDetails(donations);
        
        res.json({
            success: true,
            disasterHash: disasterHash.slice(2), // Remove 0x prefix for response
            totalDonations: donations.length,
            donations: formattedDonations,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching disaster donations:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to fetch disaster donations',
            message: error.message
        });
    }
});

// Get donor contribution for specific disaster
app.get('/api/disasters/:hash/donors/:donorAddress', async (req, res) => {
    try {
        const disasterHash = validateDisasterHash(req.params.hash);
        const donorAddress = req.params.donorAddress;
        
        // Validate donor address
        if (!ethers.isAddress(donorAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid donor address format'
            });
        }
        
        console.log(`👤 Fetching contribution for donor ${donorAddress} in disaster ${disasterHash}`);
        
        // Get donor contribution
        const contribution = await godsHandContract.getDonorContribution(disasterHash, donorAddress);
        
        res.json({
            success: true,
            disasterHash: disasterHash.slice(2), // Remove 0x prefix for response
            donorAddress: donorAddress,
            contribution: ethers.formatEther(contribution),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching donor contribution:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to fetch donor contribution',
            message: error.message
        });
    }
});

// Get contract overview
app.get('/api/contract/overview', async (req, res) => {
    try {
        console.log('📊 Fetching contract overview...');
        
        const [totalDisasters, contractBalance, owner, allHashes] = await Promise.all([
            godsHandContract.getTotalDisasters(),
            godsHandContract.getContractBalance(),
            godsHandContract.owner(),
            godsHandContract.getAllDisasterHashes()
        ]);
        
        res.json({
            success: true,
            overview: {
                totalDisasters: totalDisasters.toString(),
                contractBalance: ethers.formatEther(contractBalance),
                owner: owner,
                contractAddress: CONFIG.CONTRACT_ADDRESS,
                network: CONFIG.NETWORK_URL,
                disasterHashes: allHashes.map(hash => hash.toString())
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching contract overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contract overview',
            message: error.message
        });
    }
});

// Get comprehensive disaster information (details + donations + funding)
app.get('/api/disasters/:hash/comprehensive', async (req, res) => {
    try {
        const disasterHash = validateDisasterHash(req.params.hash);
        
        console.log(`🔍 Fetching comprehensive info for disaster hash: ${disasterHash}`);
        
        // Get all information in parallel
        const [details, funds, donationCount, fundingProgress, donations] = await Promise.all([
            godsHandContract.getDisasterDetails(disasterHash),
            godsHandContract.getDisasterFunds(disasterHash),
            godsHandContract.getDonationCount(disasterHash),
            godsHandContract.getFundingProgress(disasterHash),
            godsHandContract.getDisasterDonations(disasterHash)
        ]);
        
        // Check if disaster exists
        if (!details[0]) { // title is empty
            return res.status(404).json({
                success: false,
                error: 'Disaster not found',
                hash: disasterHash.slice(2) // Remove 0x prefix for response
            });
        }
        
        const formattedDetails = formatDisasterDetails(details);
        const formattedDonations = formatDonationDetails(donations);
        
        res.json({
            success: true,
            disaster: {
                hash: disasterHash.slice(2), // Remove 0x prefix for response
                ...formattedDetails,
                funds: ethers.formatEther(funds),
                donationCount: donationCount.toString(),
                fundingProgressPercentage: fundingProgress.toString(),
                donations: formattedDonations
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching comprehensive disaster info:', error);
        
        // Check if it's a contract revert error
        if (error.message && error.message.includes('Disaster does not exist')) {
            return res.status(404).json({
                success: false,
                error: 'Disaster not found',
                message: 'The disaster hash does not exist in the contract',
                hash: req.params.hash
            });
        }
        
        res.status(400).json({
            success: false,
            error: 'Failed to fetch comprehensive disaster information',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Start server
async function startServer() {
    try {
        // Initialize VeChain connection
        await initializeVeChain();
        
        // Start Express server
        app.listen(CONFIG.PORT, () => {
            console.log('🚀 Disaster Fetch Server started successfully!');
            console.log('📍 Server running on port:', CONFIG.PORT);
            console.log('🌐 Network:', CONFIG.NETWORK_URL);
            console.log('📋 Contract:', CONFIG.CONTRACT_ADDRESS);
            console.log('');
            console.log('📚 Available endpoints:');
            console.log('  GET /health - Health check');
            console.log('  GET /api/disasters/hashes - Get all disaster hashes');
            console.log('  GET /api/disasters/:hash - Get disaster details');
            console.log('  GET /api/disasters/:hash/donations - Get disaster donations');
            console.log('  GET /api/disasters/:hash/donors/:donorAddress - Get donor contribution');
            console.log('  GET /api/contract/overview - Get contract overview');
            console.log('  GET /api/disasters/:hash/comprehensive - Get comprehensive disaster info');
            console.log('');
            console.log('💡 Example usage:');
            console.log(`  curl http://localhost:${CONFIG.PORT}/api/disasters/hashes`);
            console.log(`  curl http://localhost:${CONFIG.PORT}/api/disasters/YOUR_DISASTER_HASH`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

// Start the server
startServer();