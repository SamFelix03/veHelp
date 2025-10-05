// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract VeHelp {
    // Struct to store disaster information
    struct Disaster {
        string title;
        string metadata;
        uint256 targetAmount;
        uint256 totalDonated;
        address creator;
        uint256 timestamp;
        bool isActive;
    }
    
    // Struct to store donation information
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }
    
    // State variables
    address public owner;
    uint256 public disasterCounter;
    
    // Mappings
    mapping(bytes32 => Disaster) public disasters;
    mapping(bytes32 => Donation[]) public disasterDonations;
    mapping(bytes32 => mapping(address => uint256)) public donorContributions;
    mapping(bytes32 => uint256) public disasterFunds;
    
    // Arrays to keep track of all disasters
    bytes32[] public allDisasterHashes;
    
    // Events
    event DisasterCreated(
        bytes32 indexed disasterHash,
        string title,
        address indexed creator,
        uint256 targetAmount
    );
    
    event DonationMade(
        bytes32 indexed disasterHash,
        address indexed donor,
        uint256 amount,
        uint256 totalDonated
    );
    
    event FundsUnlocked(
        bytes32 indexed disasterHash,
        address indexed recipient,
        uint256 amount,
        address indexed unlockedBy
    );
    
    event DisasterStatusChanged(
        bytes32 indexed disasterHash,
        bool isActive
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier disasterExists(bytes32 _disasterHash) {
        require(disasters[_disasterHash].creator != address(0), "Disaster does not exist");
        _;
    }
    
    modifier disasterActive(bytes32 _disasterHash) {
        require(disasters[_disasterHash].isActive, "Disaster is not active");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        disasterCounter = 0;
    }
    
    // Function to create a new disaster
    function createDisaster(
        string memory _title,
        string memory _metadata,
        uint256 _targetAmount
    ) public returns (bytes32) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        
        // Increment counter for unique disaster ID
        disasterCounter++;
        
        // Create unique hash for the disaster
        bytes32 disasterHash = keccak256(
            abi.encodePacked(
                _title,
                _metadata,
                msg.sender,
                block.timestamp,
                disasterCounter
            )
        );
        
        // Store disaster information
        disasters[disasterHash] = Disaster({
            title: _title,
            metadata: _metadata,
            targetAmount: _targetAmount,
            totalDonated: 0,
            creator: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // Initialize disaster funds
        disasterFunds[disasterHash] = 0;
        
        // Add to all disasters array
        allDisasterHashes.push(disasterHash);
        
        emit DisasterCreated(disasterHash, _title, msg.sender, _targetAmount);
        
        return disasterHash;
    }
    
    // Function to donate to a specific disaster
    function donateToDisaster(bytes32 _disasterHash) 
        public 
        payable 
        disasterExists(_disasterHash) 
        disasterActive(_disasterHash) 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // Update disaster total donated
        disasters[_disasterHash].totalDonated += msg.value;
        
        // Update disaster funds pool
        disasterFunds[_disasterHash] += msg.value;
        
        // Record individual donor contribution
        donorContributions[_disasterHash][msg.sender] += msg.value;
        
        // Store donation details
        disasterDonations[_disasterHash].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit DonationMade(
            _disasterHash, 
            msg.sender, 
            msg.value, 
            disasters[_disasterHash].totalDonated
        );
    }
    
    // Function to get total funds for a specific disaster
    function getDisasterFunds(bytes32 _disasterHash) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (uint256) 
    {
        return disasterFunds[_disasterHash];
    }
    
    // Function to get disaster details
    function getDisasterDetails(bytes32 _disasterHash) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (
            string memory title,
            string memory metadata,
            uint256 targetAmount,
            uint256 totalDonated,
            address creator,
            uint256 timestamp,
            bool isActive
        ) 
    {
        Disaster memory disaster = disasters[_disasterHash];
        return (
            disaster.title,
            disaster.metadata,
            disaster.targetAmount,
            disaster.totalDonated,
            disaster.creator,
            disaster.timestamp,
            disaster.isActive
        );
    }
    
    // Function to get donor's contribution to a specific disaster
    function getDonorContribution(bytes32 _disasterHash, address _donor) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (uint256) 
    {
        return donorContributions[_disasterHash][_donor];
    }
    
    // Function to get all donations for a specific disaster
    function getDisasterDonations(bytes32 _disasterHash) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (Donation[] memory) 
    {
        return disasterDonations[_disasterHash];
    }
    
    // Function to get donation count for a specific disaster
    function getDonationCount(bytes32 _disasterHash) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (uint256) 
    {
        return disasterDonations[_disasterHash].length;
    }
    
    // Function to unlock funds (only owner can call this)
    function unlockFunds(
        bytes32 _disasterHash,
        uint256 _amount,
        address payable _recipient
    ) 
        public 
        onlyOwner 
        disasterExists(_disasterHash) 
    {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");
        require(disasterFunds[_disasterHash] >= _amount, "Insufficient funds in disaster pool");
        
        // Deduct amount from disaster funds
        disasterFunds[_disasterHash] -= _amount;
        
        // Transfer funds to recipient
        _recipient.transfer(_amount);
        
        emit FundsUnlocked(_disasterHash, _recipient, _amount, msg.sender);
    }
    
    // Function to unlock funds (disaster creator can also unlock)
    function unlockFundsByCreator(
        bytes32 _disasterHash,
        uint256 _amount,
        address payable _recipient
    ) 
        public 
        disasterExists(_disasterHash) 
    {
        require(
            msg.sender == disasters[_disasterHash].creator, 
            "Only disaster creator can unlock funds"
        );
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");
        require(disasterFunds[_disasterHash] >= _amount, "Insufficient funds in disaster pool");
        
        // Deduct amount from disaster funds
        disasterFunds[_disasterHash] -= _amount;
        
        // Transfer funds to recipient
        _recipient.transfer(_amount);
        
        emit FundsUnlocked(_disasterHash, _recipient, _amount, msg.sender);
    }
    
    // Function to toggle disaster active status (only owner)
    function toggleDisasterStatus(bytes32 _disasterHash) 
        public 
        onlyOwner 
        disasterExists(_disasterHash) 
    {
        disasters[_disasterHash].isActive = !disasters[_disasterHash].isActive;
        emit DisasterStatusChanged(_disasterHash, disasters[_disasterHash].isActive);
    }
    
    // Function to get all disaster hashes
    function getAllDisasterHashes() public view returns (bytes32[] memory) {
        return allDisasterHashes;
    }
    
    // Function to get total number of disasters
    function getTotalDisasters() public view returns (uint256) {
        return allDisasterHashes.length;
    }
    
    // Function to get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Function to get disaster funding progress (percentage)
    function getFundingProgress(bytes32 _disasterHash) 
        public 
        view 
        disasterExists(_disasterHash) 
        returns (uint256) 
    {
        uint256 targetAmount = disasters[_disasterHash].targetAmount;
        uint256 totalDonated = disasters[_disasterHash].totalDonated;
        
        if (targetAmount == 0) return 0;
        
        return (totalDonated * 100) / targetAmount;
    }
    
    // Emergency function to withdraw all funds (only owner)
    function emergencyWithdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Function to transfer ownership
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    // Fallback function to receive VET
    receive() external payable {
        // This allows the contract to receive VET directly
    }
}