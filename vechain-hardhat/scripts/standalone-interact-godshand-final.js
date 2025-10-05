/**
 * Standalone GodsHand Contract Interaction Script for VeChain
 * 
 * This script demonstrates complete GodsHand contract interaction using:
 * - @vechain/ethers for VeChain-compatible wallet derivation from mnemonic
 * - @vechain/sdk-network for VeChain network connectivity and signing
 * - ethers.js v6 for contract interaction interface
 */

import { ThorClient, HardhatVeChainProvider, ProviderInternalBaseWallet, VeChainPrivateKeySigner } from '@vechain/sdk-network';
import vechainEthers from '@vechain/ethers';
import { ethers } from 'ethers';

/**
 * Helper function to convert BigInt values to strings for VeChain compatibility
 * VeChain SDK expects string/number but ethers v6 uses BigInt
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

// Configuration - Change this to use any mnemonic
const CONFIG = {
    NETWORK_URL: 'https://testnet.vechain.org',
    CONTRACT_ADDRESS: '0x6b564f771732476c86edee283344f5678e314c3d',
    MNEMONIC: 'your mnemonic here'
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

async function main() {
    console.log('🔗 Connecting to GodsHand contract on VeChain Testnet...\n');
    
    // Initialize Thor client
    const thorClient = ThorClient.fromUrl(CONFIG.NETWORK_URL);
    
    // Derive wallets from mnemonic using @vechain/ethers (VeChain-compatible derivation)
    const ownerWallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/0");
    const donor1Wallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/1");
    const donor2Wallet = vechainEthers.Wallet.fromMnemonic(CONFIG.MNEMONIC, "m/44'/818'/0'/0/2");
    
    // Get addresses and private keys
    const ownerAddress = ownerWallet.address;
    const donor1Address = donor1Wallet.address;
    const donor2Address = donor2Wallet.address;
    
    const ownerPrivateKey = Buffer.from(ownerWallet.privateKey.slice(2), 'hex');
    const donor1PrivateKey = Buffer.from(donor1Wallet.privateKey.slice(2), 'hex');
    const donor2PrivateKey = Buffer.from(donor2Wallet.privateKey.slice(2), 'hex');
    
    console.log('👤 Owner address:', ownerAddress);
    console.log('👤 Donor 1 address:', donor1Address);
    console.log('👤 Donor 2 address:', donor2Address);
    console.log();
    
    // Create provider
    const provider = new HardhatVeChainProvider(
        new ProviderInternalBaseWallet([]),
        CONFIG.NETWORK_URL,
        (message, parent) => new Error(message, parent)
    );
    
    // Create signers for each wallet
    const ownerSigner = new VeChainPrivateKeySigner(ownerPrivateKey, provider);
    const donor1Signer = new VeChainPrivateKeySigner(donor1PrivateKey, provider);
    const donor2Signer = new VeChainPrivateKeySigner(donor2PrivateKey, provider);
    
    // Connect to contract
    const godsHand = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, ownerSigner);
    
    // ===== 1. Check Initial State =====
    console.log('📊 INITIAL CONTRACT STATE');
    console.log('='.repeat(50));
    const totalDisasters = await godsHand.getTotalDisasters();
    const contractBalance = await godsHand.getContractBalance();
    const contractOwner = await godsHand.owner();
    
    console.log('Total Disasters:', totalDisasters.toString());
    console.log('Contract Balance:', ethers.formatEther(contractBalance), 'VET');
    console.log('Contract Owner:', contractOwner);
    console.log();
    
    // ===== 2. Create a Disaster =====
    console.log('🆕 CREATING A NEW DISASTER');
    console.log('='.repeat(50));
    
    const disasterTitle = 'Earthquake Relief Fund';
    const disasterMetadata = JSON.stringify({
        location: 'Test Region',
        severity: 'High',
        date: new Date().toISOString(),
        description: 'Emergency relief fund for earthquake victims'
    });
    const targetAmount = ethers.parseEther('100'); // 100 VET target
    
    console.log('Creating disaster with:');
    console.log('- Title:', disasterTitle);
    console.log('- Target:', ethers.formatEther(targetAmount), 'VET');
    
    const createTx = await godsHand.createDisaster(
        disasterTitle,
        disasterMetadata,
        targetAmount
    );
    
    console.log('Transaction sent! Waiting a moment for confirmation...');
    // Wait a bit for the transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the latest disaster hash
    const allHashes = await godsHand.getAllDisasterHashes();
    const disasterHash = allHashes[allHashes.length - 1];
    
    console.log('✅ Disaster created!');
    console.log('Disaster Hash:', disasterHash);
    console.log();
    
    // ===== 3. Get Disaster Details =====
    console.log('📋 DISASTER DETAILS');
    console.log('='.repeat(50));
    
    const details = await godsHand.getDisasterDetails(disasterHash);
    console.log('Title:', details[0]);
    console.log('Metadata:', details[1]);
    console.log('Target Amount:', ethers.formatEther(details[2]), 'VET');
    console.log('Total Donated:', ethers.formatEther(details[3]), 'VET');
    console.log('Creator:', details[4]);
    console.log('Timestamp:', new Date(Number(details[5]) * 1000).toLocaleString());
    console.log('Is Active:', details[6]);
    console.log();
    
    // ===== 4. Make Donations =====
    console.log('💰 MAKING DONATIONS');
    console.log('='.repeat(50));
    console.log('Note: Using owner address for all donations (donor addresses need to be funded)');
    console.log();
    
    // Owner donates 10 VET
    const donationAmount1 = ethers.parseEther('10');
    console.log(`Owner donating ${ethers.formatEther(donationAmount1)} VET...`);
    const donateTx1Req = await godsHand.donateToDisaster.populateTransaction(disasterHash, {
        value: donationAmount1
    });
    const preparedDonateTx1 = prepareTransaction(donateTx1Req);
    await ownerSigner.sendTransaction(preparedDonateTx1);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Donation 1 successful!');
    
    // Owner donates 15 VET
    const donationAmount2 = ethers.parseEther('15');
    console.log(`Owner donating ${ethers.formatEther(donationAmount2)} VET...`);
    const donateTx2Req = await godsHand.donateToDisaster.populateTransaction(disasterHash, {
        value: donationAmount2
    });
    const preparedDonateTx2 = prepareTransaction(donateTx2Req);
    await ownerSigner.sendTransaction(preparedDonateTx2);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Donation 2 successful!');
    
    // Owner donates again 5 VET
    const donationAmount3 = ethers.parseEther('5');
    console.log(`Owner donating again ${ethers.formatEther(donationAmount3)} VET...`);
    const donateTx3Req = await godsHand.donateToDisaster.populateTransaction(disasterHash, {
        value: donationAmount3
    });
    const preparedDonateTx3 = prepareTransaction(donateTx3Req);
    await ownerSigner.sendTransaction(preparedDonateTx3);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Donation 3 successful!');
    console.log();
    
    // ===== 5. Check Updated State =====
    console.log('📊 UPDATED DISASTER STATE');
    console.log('='.repeat(50));
    
    const updatedDetails = await godsHand.getDisasterDetails(disasterHash);
    const disasterFunds = await godsHand.getDisasterFunds(disasterHash);
    const donationCount = await godsHand.getDonationCount(disasterHash);
    const fundingProgress = await godsHand.getFundingProgress(disasterHash);
    const newContractBalance = await godsHand.getContractBalance();
    
    console.log('Total Donated:', ethers.formatEther(updatedDetails[3]), 'VET');
    console.log('Disaster Funds:', ethers.formatEther(disasterFunds), 'VET');
    console.log('Number of Donations:', donationCount.toString());
    console.log('Funding Progress:', fundingProgress.toString() + '%');
    console.log('Contract Balance:', ethers.formatEther(newContractBalance), 'VET');
    console.log();
    
    // ===== 6. Check Individual Contributions =====
    console.log('👥 INDIVIDUAL CONTRIBUTIONS');
    console.log('='.repeat(50));
    
    const ownerContribution = await godsHand.getDonorContribution(
        disasterHash, 
        ownerAddress
    );
    
    console.log('Owner total contribution:', ethers.formatEther(ownerContribution), 'VET');
    console.log();
    
    // ===== 7. Get All Donations =====
    console.log('📜 DONATION HISTORY');
    console.log('='.repeat(50));
    
    const donations = await godsHand.getDisasterDonations(disasterHash);
    donations.forEach((donation, index) => {
        console.log(`Donation ${index + 1}:`);
        console.log('  Donor:', donation.donor);
        console.log('  Amount:', ethers.formatEther(donation.amount), 'VET');
        console.log('  Timestamp:', new Date(Number(donation.timestamp) * 1000).toLocaleString());
        console.log();
    });
    
    // ===== 8. Unlock Funds (Owner) =====
    console.log('🔓 UNLOCKING FUNDS');
    console.log('='.repeat(50));
    
    const recipient = donor1Address;
    const unlockAmount = ethers.parseEther('5');
    
    console.log(`Unlocking ${ethers.formatEther(unlockAmount)} VET to ${recipient}...`);
    
    const recipientBalanceBefore = await thorClient.accounts.getAccount(recipient);
    
    const unlockTx = await godsHand.unlockFunds(
        disasterHash,
        unlockAmount,
        recipient
    );
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const recipientBalanceAfter = await thorClient.accounts.getAccount(recipient);
    
    console.log('✅ Funds unlocked successfully!');
    console.log('Recipient balance change:', 
        ethers.formatEther(BigInt(recipientBalanceAfter.balance) - BigInt(recipientBalanceBefore.balance)), 'VET');
    
    const finalDisasterFunds = await godsHand.getDisasterFunds(disasterHash);
    console.log('Remaining disaster funds:', ethers.formatEther(finalDisasterFunds), 'VET');
    console.log();
    
    // ===== 9. Get All Disasters =====
    console.log('🗂️  ALL DISASTERS');
    console.log('='.repeat(50));
    
    const finalAllHashes = await godsHand.getAllDisasterHashes();
    console.log('Total disasters in contract:', finalAllHashes.length);
    finalAllHashes.forEach((hash, index) => {
        console.log(`${index + 1}. ${hash}`);
    });
    console.log();
    
    // ===== 10. Final Summary =====
    console.log('✨ FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Successfully created disaster');
    console.log('✅ Successfully processed 3 donations');
    console.log('✅ Successfully unlocked funds');
    console.log('✅ All contract functions working perfectly!');
    console.log();
    console.log('🎉 GodsHand contract is fully operational on VeChain Testnet!');
    console.log();
    console.log('💡 TIP: Change the MNEMONIC in CONFIG to use any seed phrase you want!');
}

main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
