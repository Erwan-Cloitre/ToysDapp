// SPDX-License-Identifier: MIT LICENSE

/*
ToyMories ERC20 AirDrop Smart Contract.

Follow/Twitter!
@pinpin.eth
 _____ _             _             _   _     
|  __ (_)           (_)           | | | |    
| |__) | _ __  _ __  _ _ __    ___| |_| |__  
|  ___/ | '_ \| '_ \| | '_ \  / _ \ __| '_ \ 
| |   | | | | | |_) | | | | ||  __/ |_| | | |
|_|   |_|_| |_| .__/|_|_| |_(_)___|\__|_| |_|
              | |                            
              |_|                            
*/
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ToyMoriesNew1 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Interfaces for ERC20 and ERC721
    IERC20 public immutable rewardsToken;
    IERC721 public immutable nftCollection;

    // Constructor function to set the rewards token and the NFT collection addresses
    constructor(IERC721 _nftCollection, IERC20 _rewardsToken) {
        nftCollection = _nftCollection;
        rewardsToken = _rewardsToken;
        owner = msg.sender;
    }
    
    // Staker info
    struct TokenNFT {
        // Last time of the rewards were calculated for this user
        uint256 timeOfLastUpdate;

        // Calculated, but unclaimed rewards for the User. The rewards are
        // calculated each time the user writes to the Smart Contract
        uint256 unclaimedRewards;

        bool tokenApprove;
    }

    // Contract address owner.
    address private owner;

    // Default contract state.
    bool started = false;

    // Rewards per hour per token deposited in wei.
    uint256 private rewardsPerDay = 10 ether;

    TokenNFT[] tokenNFTs;

    // Mapping of User Address to Staker info
    mapping(uint256 => TokenNFT) public tokens;

     /**
     * Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Set the contract state.    
    function toggleStart() public onlyOwner() {
        started = !started;
    }

    // Set the airdrop.    
    function startContract(uint256 _tokenId) external onlyOwner() {
        require(nftCollection.ownerOf(_tokenId) == msg.sender,
            "You don't own this token!");
        tokens[_tokenId].timeOfLastUpdate = block.timestamp;
        tokens[_tokenId].unclaimedRewards = 0;
        tokens[_tokenId].tokenApprove = true;
    } 

    // Calculate rewards for the msg.sender, check if there are any rewards
    // claim, set unclaimedRewards to 0 and transfer the ERC20 Reward token
    // to the user.
    function claimRewards(uint256 _tokenId) external {
        require(nftCollection.ownerOf(_tokenId) == msg.sender,
            "You don't own this token!");
        uint256 rewards = calculateRewards(_tokenId);
        tokens[_tokenId].unclaimedRewards += rewards;
        require(rewards > 0, "You have no rewards to claim");
        tokens[_tokenId].timeOfLastUpdate = block.timestamp;
        tokens[_tokenId].unclaimedRewards = 0;
        rewardsToken.safeTransfer(msg.sender, rewards);
    } 

    //////////
    // View //
    //////////

    function availableRewards(uint256 _tokenId) public view returns (uint256) {
        uint256 rewards = calculateRewards(_tokenId) +
            tokens[_tokenId].unclaimedRewards;
        return rewards;
    }

    function timeOfLastUpdateID(uint256 _tokenId) public view returns (uint256) {
        return tokens[_tokenId].timeOfLastUpdate;
    }

    /////////////
    // Internal//
    /////////////

    // Calculate rewards for param _staker by calculating the time passed
    // since last update in days and mulitplying it to ERC721 Tokens Staked
    // and rewardsPerDay.
    function calculateRewards(uint256 _tokenId)
        internal
        view
        returns (uint256 _rewards)
    {
        require(started, 'ToyMories: Holding contract not started yet');
        require(tokens[_tokenId].tokenApprove, 'You dont approve your token');
        return (((block.timestamp - tokens[_tokenId].timeOfLastUpdate) * rewardsPerDay) / 86400);
    }
}