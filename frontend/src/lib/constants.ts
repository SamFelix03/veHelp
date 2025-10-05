export const CONTRACT_ADDRESS = "0x6b564f771732476c86edee283344f5678e314c3d";

export const CONTRACT_ABI = [
    // Constructor and basic info
    "function owner() view returns (address)",
    "function disasterCounter() view returns (uint256)",
    
    // Disaster creation
    "function createDisaster(string memory _title, string memory _metadata, uint256 _targetAmount) returns (bytes32)",
    
    // Donation functions
    "function donateToDisaster(bytes32 _disasterHash) payable",
    
    // Read functions
    "function getDisasterFunds(bytes32 _disasterHash) view returns (uint256)",
    "function getDisasterDetails(bytes32 _disasterHash) view returns (string, string, uint256, uint256, address, uint256, bool)",
    "function getDonorContribution(bytes32 _disasterHash, address _donor) view returns (uint256)",
    "function getDisasterDonations(bytes32 _disasterHash) view returns (tuple(address donor, uint256 amount, uint256 timestamp)[])",
    "function getDonationCount(bytes32 _disasterHash) view returns (uint256)",
    "function getAllDisasterHashes() view returns (bytes32[])",
    "function getTotalDisasters() view returns (uint256)",
    "function getContractBalance() view returns (uint256)",
    "function getFundingProgress(bytes32 _disasterHash) view returns (uint256)",
    
    // Admin functions
    "function unlockFunds(bytes32 _disasterHash, uint256 _amount, address payable _recipient)",
    
    // Mappings access
    "function disasters(bytes32) view returns (string, string, uint256, uint256, address, uint256, bool)",
    "function disasterFunds(bytes32) view returns (uint256)",
    "function donorContributions(bytes32, address) view returns (uint256)",
    
    // Events
    "event DisasterCreated(bytes32 indexed disasterHash, string title, address indexed creator, uint256 targetAmount)",
    "event DonationMade(bytes32 indexed disasterHash, address indexed donor, uint256 amount, uint256 totalDonated)",
    "event FundsUnlocked(bytes32 indexed disasterHash, address indexed recipient, uint256 amount, address indexed unlockedBy)"
];

export const VECHAIN_TESTNET_CONFIG = {
    chainId: "0x186aa", // 100010 in hex
    chainName: "VeChain Testnet",
    rpcUrl: "https://testnet.vechain.org",
    blockExplorer: "https://explore-testnet.vechain.org",
    nativeCurrency: {
      name: "VeChain",
      symbol: "VET",
      decimals: 18,
    },
  };