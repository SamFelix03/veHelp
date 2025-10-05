import { ethers } from 'hardhat';
import { stringifyData } from '@vechain/sdk-errors';

async function main(): Promise<void> {
    console.log('Starting VeHelp contract deployment...\n');
    
    // Get the signer (deployer account)
    const signer = (await ethers.getSigners())[0];
    console.log('Deploying with account:', await signer.getAddress());
    
    // Get the contract factory
    const veHelpFactory = await ethers.getContractFactory(
        'VeHelp',
        signer
    );
    
    // Deploy the contract
    console.log('\nDeploying VeHelp contract...');
    const veHelp = await veHelpFactory.deploy();
    
    // Wait for deployment to complete
    await veHelp.waitForDeployment();
    
    const contractAddress = await veHelp.getAddress();
    
    console.log('\n✅ VeHelp contract successfully deployed!');
    console.log('Contract Address:', contractAddress);
    console.log('Owner:', await signer.getAddress());
    
    // Get initial contract state
    const totalDisasters = await veHelp.getTotalDisasters();
    const contractBalance = await veHelp.getContractBalance();
    
    console.log('\n📊 Initial Contract State:');
    console.log('Total Disasters:', totalDisasters.toString());
    console.log('Contract Balance:', ethers.formatEther(contractBalance), 'VET');
    
    console.log('\n🔗 Contract Details:');
    console.log(stringifyData(veHelp));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

