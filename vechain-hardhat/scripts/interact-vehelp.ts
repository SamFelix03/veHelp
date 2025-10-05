import { ethers } from 'hardhat';

async function main(): Promise<void> {
    console.log('🔗 Connecting to VeHelp contract on VeChain Testnet...\n');
    
    // Contract address from deployment
    const CONTRACT_ADDRESS = '0x6b564f771732476c86edee283344f5678e314c3d';
    
    // Get signers
    const [owner, donor1, donor2] = await ethers.getSigners();
    console.log('👤 Owner address:', await owner.getAddress());
    console.log('👤 Donor 1 address:', await donor1.getAddress());
    console.log('👤 Donor 2 address:', await donor2.getAddress());
    console.log();
    
    // Connect to the deployed contract
    const VeHelp = await ethers.getContractFactory('VeHelp');
    const veHelp = VeHelp.attach(CONTRACT_ADDRESS);
    
    // ===== 1. Check Initial State =====
    console.log('📊 INITIAL CONTRACT STATE');
    console.log('='.repeat(50));
    const totalDisasters = await veHelp.getTotalDisasters();
    const contractBalance = await veHelp.getContractBalance();
    const contractOwner = await veHelp.owner();
    
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
    
    const createTx = await veHelp.createDisaster(
        disasterTitle,
        disasterMetadata,
        targetAmount
    );
    const receipt = await createTx.wait();
    
    // Get disaster hash from event
    const disasterCreatedEvent = receipt?.logs.find((log: any) => {
        try {
            const parsed = veHelp.interface.parseLog(log);
            return parsed?.name === 'DisasterCreated';
        } catch {
            return false;
        }
    });
    
    const parsedEvent = veHelp.interface.parseLog(disasterCreatedEvent!);
    const disasterHash = parsedEvent?.args[0];
    
    console.log('✅ Disaster created!');
    console.log('Disaster Hash:', disasterHash);
    console.log();
    
    // ===== 3. Get Disaster Details =====
    console.log('📋 DISASTER DETAILS');
    console.log('='.repeat(50));
    
    const details = await veHelp.getDisasterDetails(disasterHash);
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
    
    // Donor 1 donates 10 VET
    const donationAmount1 = ethers.parseEther('10');
    console.log(`Donor 1 donating ${ethers.formatEther(donationAmount1)} VET...`);
    const donateTx1 = await veHelp.connect(donor1).donateToDisaster(disasterHash, {
        value: donationAmount1
    });
    await donateTx1.wait();
    console.log('✅ Donation 1 successful!');
    
    // Donor 2 donates 15 VET
    const donationAmount2 = ethers.parseEther('15');
    console.log(`Donor 2 donating ${ethers.formatEther(donationAmount2)} VET...`);
    const donateTx2 = await veHelp.connect(donor2).donateToDisaster(disasterHash, {
        value: donationAmount2
    });
    await donateTx2.wait();
    console.log('✅ Donation 2 successful!');
    
    // Donor 1 donates again 5 VET
    const donationAmount3 = ethers.parseEther('5');
    console.log(`Donor 1 donating again ${ethers.formatEther(donationAmount3)} VET...`);
    const donateTx3 = await veHelp.connect(donor1).donateToDisaster(disasterHash, {
        value: donationAmount3
    });
    await donateTx3.wait();
    console.log('✅ Donation 3 successful!');
    console.log();
    
    // ===== 5. Check Updated State =====
    console.log('📊 UPDATED DISASTER STATE');
    console.log('='.repeat(50));
    
    const updatedDetails = await veHelp.getDisasterDetails(disasterHash);
    const disasterFunds = await veHelp.getDisasterFunds(disasterHash);
    const donationCount = await veHelp.getDonationCount(disasterHash);
    const fundingProgress = await veHelp.getFundingProgress(disasterHash);
    const newContractBalance = await veHelp.getContractBalance();
    
    console.log('Total Donated:', ethers.formatEther(updatedDetails[3]), 'VET');
    console.log('Disaster Funds:', ethers.formatEther(disasterFunds), 'VET');
    console.log('Number of Donations:', donationCount.toString());
    console.log('Funding Progress:', fundingProgress.toString() + '%');
    console.log('Contract Balance:', ethers.formatEther(newContractBalance), 'VET');
    console.log();
    
    // ===== 6. Check Individual Contributions =====
    console.log('👥 INDIVIDUAL CONTRIBUTIONS');
    console.log('='.repeat(50));
    
    const donor1Contribution = await veHelp.getDonorContribution(
        disasterHash, 
        await donor1.getAddress()
    );
    const donor2Contribution = await veHelp.getDonorContribution(
        disasterHash, 
        await donor2.getAddress()
    );
    
    console.log('Donor 1 total contribution:', ethers.formatEther(donor1Contribution), 'VET');
    console.log('Donor 2 total contribution:', ethers.formatEther(donor2Contribution), 'VET');
    console.log();
    
    // ===== 7. Get All Donations =====
    console.log('📜 DONATION HISTORY');
    console.log('='.repeat(50));
    
    const donations = await veHelp.getDisasterDonations(disasterHash);
    donations.forEach((donation: any, index: number) => {
        console.log(`Donation ${index + 1}:`);
        console.log('  Donor:', donation.donor);
        console.log('  Amount:', ethers.formatEther(donation.amount), 'VET');
        console.log('  Timestamp:', new Date(Number(donation.timestamp) * 1000).toLocaleString());
        console.log();
    });
    
    // ===== 8. Unlock Funds (Owner) =====
    console.log('🔓 UNLOCKING FUNDS');
    console.log('='.repeat(50));
    
    const recipient = await donor1.getAddress(); // Send to donor1 as recipient
    const unlockAmount = ethers.parseEther('5');
    
    console.log(`Unlocking ${ethers.formatEther(unlockAmount)} VET to ${recipient}...`);
    
    const recipientBalanceBefore = await ethers.provider.getBalance(recipient);
    
    const unlockTx = await veHelp.unlockFunds(
        disasterHash,
        unlockAmount,
        recipient
    );
    await unlockTx.wait();
    
    const recipientBalanceAfter = await ethers.provider.getBalance(recipient);
    
    console.log('✅ Funds unlocked successfully!');
    console.log('Recipient balance change:', 
        ethers.formatEther(recipientBalanceAfter - recipientBalanceBefore), 'VET');
    
    const finalDisasterFunds = await veHelp.getDisasterFunds(disasterHash);
    console.log('Remaining disaster funds:', ethers.formatEther(finalDisasterFunds), 'VET');
    console.log();
    
    // ===== 9. Get All Disasters =====
    console.log('🗂️  ALL DISASTERS');
    console.log('='.repeat(50));
    
    const allHashes = await veHelp.getAllDisasterHashes();
    console.log('Total disasters in contract:', allHashes.length);
    allHashes.forEach((hash: string, index: number) => {
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
    console.log('🎉 VeHelp contract is fully operational on VeChain Testnet!');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

