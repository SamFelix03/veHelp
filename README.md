# veHelp
*"Where Heaven Hears, and Humanity Helps — One Gift at a Time."*

Applied track: 
Track 1: Social Impact - Build for People

## 🔗 **Important Links**

- 🌐 **Live Demo**: [https://vehelp.vercel.app](https://vehelp.vercel.app)
- 📊 **Pitch Deck**: [View on Canva](https://www.canva.com/design/DAG07hJ2VCE/Wgg4-P2Gp5opgsIcTJE_mg/view?utm_content=DAG07hJ2VCE&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h88b89bbafe)
- 🎥 **Demo Video**: [Watch on YouTube](https://www.youtube.com/watch?v=-99fqL1EEQE)

## 🧪 **How to Test**

### **As a Donor**

1. Head over to the [live demo](https://vehelp.vercel.app)
2. Click the **"Bengaluru Floods"** event
3. Click **"Donate Now"**
4. Connect your **VeWorld wallet** (ensure it has enough VET and VTHO balance)
5. Enter the amount you wish to donate
6. Click **"Donate"**
7. Your donation is now reflected in the **Recent Donations** list! 🎉

### **As an NGO**

1. Click the **"Request Funds"** button at the bottom of the page
2. Enter an NGO's name
3. Enter your contribution details
4. Click **"Submit"**
5. Wait for the **AI agent** to analyze and allocate funding for you
6. Your claim is now visible in the **Claims List**
7. Vote **"Accept"** 3 times by yourself *(Note: True zkPassport functionality will only allow a unique human to vote once, but for testing purposes, we've disabled this restriction)*
8. Once **3 votes** are reached, the agent will automatically **unlock funds** for the NGO! ✅

## 📋 **Table of Contents**

### **📖 Overview**
- [ Introduction](#-introduction)
- [ The Problems in Current Systems](#-the-problems-in-current-systems)
- [ Why veHelp (AI agents + Blockchain) is the Solution?](#-why-gods-hand-ai-agents--blockchain-is-the-solution)

### **🏗️ Architecture & Pipeline**
- [ How It's Made: The Disaster Creation Pipeline](#️-how-its-made-the-disaster-creation-pipeline)
- [ The Democratic Verification & Distribution Pipeline](#️-the-democratic-verification--distribution-pipeline)

### **🔧 Core Integrations**
- [🤖 Mosaia Integration](#-mosaia-integration)
- [⛓️ VeChain Integration](#️-vechain-integration)
- [🌤️ WeatherXM Integration](#️-weatherxm-integration)


## 🌟 Introduction

**veHelp** is a decentralized disaster relief platform that bridges the gap between urgent humanitarian needs and global generosity through AI Agents and blockchain infra. 

In a world where natural disasters strike without warning, traditional relief systems often fail due to..
- bureaucratic delays
- lack of transparency
- inefficient fund allocation.

veHelp transforms this paradigm by deploying **autonomous AI agents** that continuously monitor global events, instantly assess disaster situations, and facilitate **rapid, transparent, and democratically-governed relief funding**.

Powered by **MOSAIA AI agents** relying on **WeatherXM's Weather Data** and secured by **VeChain's blockchain**, our platform ensures complete transparency, trustless operations, and community-driven decision making. Every donation, every claim, and every allocation is immutably recorded on **VeChain's blockchain**, governed by the collective wisdom of verified global citizens, creating a truly decentralized ecosystem that eliminates the systemic failures plaguing traditional relief systems.

**Donor Incentives**: Leveraging **VeChain's dual-token system (VET/VTHO)**, donors contribute with VET while gas fees are handled by a separate VTHO paymaster through fee delegation, creating a **frictionless donation experience**. The B3TR token rewards also incentivize continued donor participation.


## 🚨 The Problems in Current Systems

Traditional disaster relief platforms fail due to:

**1. Lack of Transparency**
- **Opaque fund allocation** with no visibility into how donations are spent
- **Hidden administrative costs** and unclear overhead expenses

**2. Critical Delays**
- **Bureaucratic bottlenecks** slow fund distribution
- **Funds take weeks/months** to reach disaster-affected areas

**3. Zero Donor Incentives**
- **No rewards** beyond moral satisfaction
- **No engagement mechanisms** for repeat donations


## 🔬 Why veHelp (AI agents + Blockchain) is the Solution?

### 🤖 **Autonomous Disaster Detection & Analysis**
- **Real-time News Monitoring**: MOSAIA AI agents continuously scan global news sources for tragic events and natural disasters
- **Intelligent Location Identification**: The bbox Agent pinpoints affected geographical areas with precision
- **Weather Data Integration**: Leverages WeatherXM API to fetch critical weather conditions for comprehensive situation analysis
- **Smart Fund Allocation**: AI-driven assessment determines appropriate relief fund amounts based on severity, population impact, and weather conditions

### 🐦 **Automated Social Media Outreach**
- **Instant Tweet Generation**: AI crafts compelling, informative tweets about verified disaster events
- **Automatic Twitter Posting**: Seamless integration with Twitter API for immediate public awareness

### 🌐 **Transparent Relief Platform**
- **Verified Disaster Display**: All AI-verified disaster events are showcased in an intuitive frontend interface
- **Seamless Donation Experience**: User-friendly donation system supporting payments with **VET** via VeWorld wallet integration
- **Real-time Fund Tracking**: Complete transparency in fund collection and allocation progress

### 🏛️ **Democratic Claim Verification**
- **NGO & Organization Claims**: Registered relief organizations can file claims for disaster funds
- **AI-Powered Verification**: Dedicated MOSAIA Voting-Verification Pipeline agent validates claim authenticity
- **Community Governance**: Final fund allocation decisions made through democratic voting consensus

### 🔐 **Secure Identity Verification**
- **zkPassport Integration**: Zero-knowledge proof technology ensures voter identity verification
- **Fool-proof Voting System**: Anonymous yet verified voting prevents fraud and manipulation
- **Privacy-First Approach**: Identity verification without compromising personal data privacy

## 🏗️ How It's Made: The Disaster Creation Pipeline

### 🔄 **Complete Workflow: From Detection to Deployment**

<img width="1470" height="657" alt="Workflow Diagram" src="https://github.com/user-attachments/assets/7d56133a-ce31-4818-adcd-252fd74e7bac" />


### 🎯 **Step-by-Step Pipeline Execution**

**Phase 1: Detection & Location Intelligence**
1. **Disaster Search Agent** scans global news sources and identifies disaster events
2. **BBOX Identifier Agent** processes location data and generates precise geographical boundaries
3. **WeatherXM Agent** fetches real-time weather conditions from stations within the affected area

**Phase 2: Analysis & Funding Determination**
4. **Disaster Analysis Agent** combines news intelligence with weather data to assess disaster severity
5. **Smart Contract Integration** converts USD funding requirements to VET tokens using real-time exchange rates
6. **VeChain Blockchain Deployment** writes disaster data (title, metadata, target_amount) to the VeHelp smart contract.

**Phase 3: Public Outreach & Data Storage**
7. **Tweet Agent** generates and publishes disaster awareness content with funding details and source links to our twitter account @godshandsupport.
8. **DynamoDB Storage** maintains comprehensive disaster records with unique hashes and timestamps
9. **Pipeline Completion** triggers next monitoring cycle and maintains continuous operation

### 🔒 **Security & Reliability Features**

- **TEE-Hosted Execution**: All agents run in Trusted Execution Environments for maximum security
- **Blockchain Immutability**: Disaster data is permanently recorded on VeChain blockchain
- **Multi-Source Verification**: News sources and weather stations provide cross-validation
- **Automated Failsafes**: Pipeline includes comprehensive error handling and recovery mechanisms

## 🗳️ The Democratic Verification & Distribution Pipeline

### 🔄 **Complete User Journey: From Donation to Distribution**

<img width="1470" height="657" alt="journey diagram" src="https://github.com/user-attachments/assets/72f19c8f-12ba-40ff-922c-b4ac69a101cb" />


### 🎯 **Step-by-Step Democratic Process**

#### **Step 1: User Donation with VeWorld**
1. **VET Donation**: Users donate any amount of VET tokens through the intuitive DonationModal interface via VeWorld wallet

2. **Fee Delegation**: Gas fees (VTHO) are handled by a separate paymaster, ensuring donors only pay VET without worrying about gas

3. **B3TR Rewards**: Donors receive B3TR token rewards for their contributions, incentivizing continued participation

4. **Transparent Tracking**: All donations are recorded immutably on VeChain blockchain with real-time progress updates


#### **Step 2: NGO Funding Claims & AI Verification**
5. **Claim Submission**: Registered NGOs and relief organizations submit detailed funding requests through RequestFundsModal

6. **Fact-Check Agent Analysis**: AI agent `(ID: 686656aaf14ab5c885e431ce)` analyzes claims using:
   - **Cross-referencing** with original disaster data and news sources
   - **Feasibility assessment** of proposed relief activities
   - **Amount calculation** based on disaster severity, amount present in the disaster pool of that specific disaster and organizational capacity
   - **Evidence validation** for legitimacy verification

7. **Automatic Approval/Rejection**: Claims are instantly approved for voting or rejected based on AI analysis


#### **Step 3: Democratic Community Voting**
8. **zkPassport Verification**: Voters must prove they are 18+ using zero-knowledge passport verification

9. **Anonymous Voting**: Verified voters cast anonymous votes with four options:
   - **Accept**: Approve funding as requested
   - **Reject**: Deny funding entirely  
   - **Raise Amount**: Approve but suggest higher funding
   - **Lower Amount**: Approve but suggest reduced funding

10. **Consensus Mechanism**: Minimum 3 votes required for decision; majority vote determines outcome

#### **Step 4: Automated Fund Distribution**
11. **Voting Agent Processing**: Disaster Voting Agent `(ID: 6866646ff14ab5c885e4386d)` automatically:
    - **Aggregates votes** and determines consensus
    - **Executes VeChain transactions** for fund unlocking
    - **Updates claim status** in real-time
    - **Handles amount modifications** by resetting voting process
12. **Instant Execution**: Approved claims trigger immediate VET transfer to NGO wallets via smart contract


## 🤖 **Mosaia Integration**

veHelp operates through an **Autonomous AI agent Ecosystem** that transforms disaster detection from reactive to proactive. Here's how our **disaster creation pipeline** works:

### 🔍 **Disaster Creation Pipeline Agents**

#### **1. Disaster Search Agent** `(mosaia ID: 68660a4aeef377abf1f7443f)`
- **Purpose**: Continuously monitors global news sources for natural disasters and tragic events using **EXA search**
- **Function**: Identifies breaking disaster events, extracts key details (title, description, location, source links), and triggers the pipeline workflow
- **📁 Line of Code**: [Disaster Search Agent](Mosaia%20Agents/DisasterCreationPipeline/main.py)

#### **2. BBOX Identifier Agent** `(mosaia ID: 6864d6cbca5744854d34c998)`
- **Purpose**: Converts textual disaster locations into precise geographical bounding boxes using the **Bounding Box Tool** `(mosaia ID: 6864d67fca5744854d34c8c6)`
- **Function**: Takes disaster location data and generates accurate latitude/longitude coordinates to define the affected geographical area
- **📁 Line of Code**: [BBOX Identifier Agent](Mosaia%20Agents/DisasterCreationPipeline/main.py)

#### **3. WeatherXM Agent** `(mosaia ID: 6864dd95ade4d61675d45e4d)`
- **Purpose**: Fetches real-time weather data from active weather stations within the disaster zone using **WeatherXM BBox Weather Tool** `(mosaia ID: 6864dcc425ddf4f7d390d91b)`
- **Function**: Provides crucial meteorological context including temperature, humidity, precipitation, wind patterns, and atmospheric conditions. This data provided by WeatherXM is **CRUCIAL** for our agent to make an informed decision on disaster severity
- **📁 Line of Code**: [WeatherXM Agent](Mosaia%20Agents/DisasterCreationPipeline/main.py)

#### **4. Disaster Analysis Agent** `(mosaia ID: 6866162ee2d11c774d448a27)`
- **Purpose**: Performs comprehensive disaster severity analysis by combining news data with weather intelligence to determine appropriate relief funding
- **Function**: Calculates required fund amounts in USD, assesses disaster impact severity, and provides detailed analysis for smart contract deployment
- **📁 Line of Code**: [Disaster Analysis Agent](Mosaia%20Agents/DisasterCreationPipeline/main.py)

#### **5. Tweet Agent** `(mosaia ID: 6864e70f77520411d032518a)`
- **Purpose**: Automatically generates and publishes disaster awareness content to Twitter using **Post to X Tool** `(mosaia ID: 6864e68268d0c18b74da20e7)`
- **Function**: Creates compelling tweets with disaster details, funding requirements, and source links to maximize public engagement and donations
- **📁 Line of Code**: [Tweet Agent](Mosaia%20Agents/DisasterCreationPipeline/main.py)

### 🗳️ **Verification Flow Architecture**

#### **6. Fact-Check Agent** `(mosaia ID: 686656aaf14ab5c885e431ce)`
- **Purpose**: Analyzes NGO funding requests using AI-powered fact-checking to verify legitimacy and determine appropriate funding amounts
- **Function**: Cross-references organization claims with disaster data, evaluates project feasibility, and calculates justified funding amounts based on evidence
- **📁 Line of Code**: [Fact Checking Agent](Mosaia%20Agents/VotingVerificationPipeline/main.py)

#### **7. Disaster Consensus Handling Agent** `(mosaia ID: 6866646ff14ab5c885e4386d)`
- **Purpose**: Processes community voting results and executes final funding decisions on the Flow blockchain
- **Function**: Aggregates verified votes, determines consensus, and automatically unlocks funds or rejects claims based on democratic decision-making
- **📁 Line of Code**: [Votes Handling Agent](Mosaia%20Agents/VotingVerificationPipeline/main.py)

### 🛠️ **Mosaia Tools Integration**

#### **1. BBOX Identifier Tool** `(mosaia ID: 6864d67fca5744854d34c8c6)`
**Purpose**: Translates a human-readable location (e.g., "Mumbai, India") into geographic coordinates and a bounding box, which defines the region's spatial extent.

**How it works**:
1. You send a location in human-readable format
2. The tool makes a request to the Geoapify API
3. The Boundary Box values of that specific location is returned, like this:
   
   ```
   min_latitude: minLat,
   max_latitude: maxLat,
   min_longitude: minLon,
   max_longitude: maxLon
   ```

**Required Environment Variables**:
- `Geoapify API Key`

**📁 Line of Code**: [BBOX Tool](Mosaia%20Tools/bboxtool)

#### **2. WeatherXM Tool** `(mosaia ID: 6864dcc425ddf4f7d390d91b)`
**Purpose**: Integrates WeatherXM to provide real-time, hyperlocal weather data for disaster assessment and relief planning. The data collected from WeatherXM's decentralized network of weather stations is sent to the agent.

**How it works**:
1. Enter the bbox values of a specific location
2. Using the bounding box, the system queries the WeatherXM endpoint which returns a list of all weather stations located within the defined geographical bounds
3. The response is filtered to include only active stations, i.e., those that have reported recent weather data
4. Up to 5 randomly selected active stations are queried for their latest observations
5. Each response includes:
   - **Observation data**: temperature, precipitation, wind speed/gust, humidity, UV index, solar irradiance, etc.
   - **Location metadata**: latitude, longitude, elevation
   - **Health scores**: data quality, location accuracy
6. These details provide granular, real-time insights into the current weather conditions around a specific location

**Required Environment Variables**:
- `WeatherXM API key`

**📁 Line of Code**: [WeatherXM Tool](Mosaia%20Tools/Mosaia-Weather-XM-Tool)

#### **3. Mosaia Twitter Poster Tool** `(mosaia ID: 6864e68268d0c18b74da20e7)`
**Purpose**: A Mosaia Tool that helps your agent post tweets using the Twitter API.

**What It Does**: This tool allows your Mosaia agent to post tweets by sending a message to the Twitter API using your account credentials.

**Required Environment Variables**:
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

**📁 Line of Code**: [Twitter Poster Tool](Mosaia%20Tools/Mosaia-TweetPosting-Tool)


## ⛓️ **VeChain Integration**

### 📋 **Deployed Contract**
**🔗 Contract Address**: [`0x6b564f771732476c86edee283344f5678e314c3d`](https://explore-testnet.vechain.org/accounts/0x6b564f771732476c86edee283344f5678e314c3d)

**📁 Contract Code**: [VeHelp.sol](vechain-hardhat/contracts/VeHelp.sol)

### 🏗️ **Smart Contract Architecture**

#### **Core Functionality**

##### **1. Disaster Management**
- **Disaster Creation**: AI agents create disaster relief campaigns with title, metadata, and target amount in VET
- **Unique Identification**: Each disaster gets a unique `bytes32` hash generated from creator, timestamp, metadata, and counter
- **Status Control**: Disasters can be activated/deactivated by the contract owner (AI agent)
- **Immutable Records**: All disaster data stored on-chain with complete transparency

##### **2. Donation System**
- **Direct VET Donations**: Users donate VET directly to specific disasters via `donateToDisaster()`
- **Contribution Tracking**: Individual donor contributions tracked per disaster in `donorContributions` mapping
- **Donation History**: Complete donation records with donor address, amount, and timestamp
- **Funding Progress**: Real-time calculation of funding progress as percentage of target amount

##### **3. Fund Management**
- **Secure Storage**: All VET donations held securely in the smart contract
- **Controlled Release**: Only the contract owner (AI agent in TEE) can unlock funds via `unlockFunds()`
- **Transparent Unlocking**: Fund releases emit events with recipient, amount, and transaction details
- **Emergency Controls**: Emergency withdrawal and ownership transfer functions for critical situations

### 💡 **VeChain's Unique Advantages**

#### **🔗 Dual-Token System (VET/VTHO)**
- **Frictionless Donations**: Donors pay only VET tokens, no need to hold VTHO for gas
- **Fee Delegation**: VTHO gas costs handled by a separate paymaster through VeChain's fee delegation mechanism
- **Reduced Friction**: Eliminates the complexity of managing two tokens for end users
- **Sustainable Economics**: Predictable and low transaction costs for disaster relief operations

#### **⚡ 10-Second Block Finality**
- **Rapid Confirmation**: Donations confirmed in just 10 seconds with finality
- **Real-Time Updates**: Near-instant UI updates for donation tracking and claim processing
- **Enhanced UX**: Minimal waiting time between transaction submission and confirmation

#### **🌍 Enterprise-Grade Infrastructure**
- **Proven Scalability**: Battle-tested by enterprise partners for supply chain and sustainability applications
- **Low Energy Consumption**: Only **0.04% of energy** consumed by other chains while maintaining security
- **Environmental Alignment**: Eco-friendly blockchain perfect for humanitarian and sustainability-focused applications

#### **🎁 B3TR Token Rewards**
- **Donor Incentivization**: Contributors receive B3TR token rewards for their disaster relief donations
- **Gamification**: Token rewards encourage repeat donations and community engagement
- **Sustainable Growth**: Aligns donor incentives with platform growth and impact

### 🔌 **VeWorld Wallet Integration**

veHelp seamlessly integrates with **VeWorld**, VeChain's premier wallet, using the **VeChain DAppKit** for a smooth user experience.

**📁 Integration Code**: [VeChainWalletContext.tsx](frontend/src/components/VeChainWalletContext.tsx)

#### **Features**
- **One-Click Connection**: Users connect via VeWorld browser extension or mobile wallet with a single click
- **WalletConnect Support**: Mobile wallet users can connect via QR code scanning
- **State Management**: Real-time wallet state synchronization across the entire application
- **Auto-Reconnection**: Persistent connections maintained across sessions using DAppKit's persistence
- **Multi-Wallet Support**: Supports VeWorld, Sync2, and other VeChain-compatible wallets

#### **Implementation Highlights**
```typescript
// DAppKit Configuration
DAppKitUI.configure({
  node: 'https://testnet.vechain.org/',
  walletConnectOptions: { projectId, metadata },
  usePersistence: true,
});

// Real-time wallet state subscription
DAppKitUI.wallet.subscribeToKey('address', (newAddress) => {
  setAddress(newAddress);
  setIsConnected(!!newAddress);
});
```

**📁 Deployment Script**: [deploy-vehelp.ts](vechain-hardhat/scripts/deploy-vehelp.ts)


## 🌤️ WeatherXM Integration

WeatherXM powers the agent with real-time, hyperlocal weather data from WeatherXM's decentralized network of weather stations — serving as the primary and trusted data source for disaster detection, severity analysis, and fund allocation

#### Workflow Overview:
- The agent begins by receiving a bounding box (bbox) defining the geographical area of concern.
- It queries WeatherXM's API to locate all weather stations within this region.
- Only active stations—those providing recent and verifiable data—are considered.
- Up to five active stations are randomly sampled in the specified location.

Each station provides:
**Detailed weather observations**
- Temperature
- Feels Like
- Dew Point
- Humidity
- Wind Speed
- Wind Gust
- Wind Direction
- Pressure
- UV Index

The agent heavily relies on this granular, real-time data to:

- Evaluate the intensity and scope of the disaster, such as identifying flooding risks, wind damage potential, or heatwaves.
- Determine the urgency and severity of the situation in specific micro-locations.
- Autonomously calculate and allocate appropriate relief funding, ensuring aid reaches those most impacted.

**📁 Line of Code**: [WeatherXM Tool](Mosaia%20Tools/Mosaia-Weather-XM-Tool)

---

## 🚀 What's Next? (Roadmap)

### 🎁 **B3TR Rewards for Donors**

**Incentivizing Generosity Through Tokenomics**

Donors will receive **B3TR token rewards** proportional to their donation amount, creating a sustainable incentive system that encourages repeat participation and community growth.

**Key Features:**
- **Proportional Rewards**: Larger donations receive proportionally more B3TR tokens
- **Immediate Distribution**: Rewards distributed automatically upon donation confirmation
- **Long-term Value**: B3TR tokens provide ongoing utility within the VeChain ecosystem
- **Community Building**: Token holders become stakeholders in the platform's success

**Impact:** This gamification layer transforms disaster relief from a one-time act into an engaging, rewarding experience that builds donor loyalty and increases long-term funding sustainability.

### 🎉 **Fundraising Events**

**Building Community Through Engagement**

veHelp aims to grow into a vibrant community that organizes fun, engaging events for raising disaster relief funds, creating a social movement around humanitarian aid.

**Event Structure:**
- **Community-Organized**: Users can propose and organize fundraising events
- **Flexible Participation**: Events range from virtual challenges to local meetups
- **Proxy Donations**: Funds raised at events are donated on behalf of attendees to disasters of their choice
- **Social Impact**: Combines entertainment with meaningful social contribution

**Vision:** Transform disaster relief fundraising from somber obligation into joyful community participation, where people connect, have fun, and make a difference together.

### 🌐 **Mainnet Launch**

**Scaling to Global Impact**

Launching veHelp on the **VeChain mainnet** marks the transition from proof-of-concept to production-ready disaster relief infrastructure.

**Mainnet Benefits:**
- **Production Security**: Full security guarantees for real-world fund management
- **Global Scale**: Ready to handle disasters and donations worldwide
- **Enterprise Integration**: Opens doors for corporate partnerships and matching programs
- **Regulatory Compliance**: Mainnet deployment enables proper legal frameworks
- **Real Impact**: Transition from testnet to actually saving lives with real funds

**Timeline:** Following successful testnet validation and community feedback integration, mainnet deployment will unlock veHelp's full potential as a global disaster relief platform.

---

## 🌟 Our Mission

**Making Relief Accessible to Everyone**

We aim to make relief accessible by anyone, and make the world a better place through **transparent, corruption-free, and instantaneous relief aid** for everyone around the world.

### 🎯 **Core Values**

**Transparency First**
- Every donation tracked on-chain with complete visibility
- Real-time fund allocation updates accessible to all
- No hidden administrative costs or opaque processes

**Zero Corruption**
- AI-powered verification prevents fraudulent claims
- Democratic voting ensures community oversight
- Smart contracts eliminate human manipulation

**Instant Impact**
- AI agents detect disasters in real-time
- Donations flow directly to verified organizations
- 10-second block finality enables rapid response

### 🤝 **Aligned with VeChain's Vision**

We believe this mission aligns perfectly with **social good** and the vision of **VeChain** to drive real-world adoption of blockchain technology for sustainable impact.

**Why VeChain?**
- **Sustainability Focus**: VeChain's eco-friendly infrastructure matches our humanitarian values
- **Enterprise Credibility**: Proven track record enables trust from NGOs and donors
- **Technical Excellence**: 10s finality and fee delegation create optimal user experience
- **Global Reach**: VeChain's international presence supports worldwide disaster response

With the support of the **VeChain ecosystem**, we hope to change the world - one disaster, one donation, one life at a time.

---

**Built with ❤️ by the veHelp team!**
