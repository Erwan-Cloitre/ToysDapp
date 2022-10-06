import {
  ThirdwebNftMedia,
  useAddress,
  useMetamask,
  useTokenBalance,
  useOwnedNFTs,
  useContract,
  getErc20,
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import Image from 'next/image'

const nftDropContractAddress = "0xEadaF9AAe1A65cbC2a4BFEd986AA153c366A90D7";
const tokenContractAddress = "0x32F71407917f7Ff388294C640e77C2E191340dB8";
const stakingContractAddress = "0xdcB2D8CB85fbffd19C576a307352BFf654A7f40a";

const Home: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();

  // Contract Hooks
  const nftDropContract = useContract(nftDropContractAddress);
  const tokenContract = useContract(tokenContractAddress);
  const erc20 = getErc20(tokenContract.contract)

  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load hold NFTs
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract.contract, address);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(erc20, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

  const [claimableRewardsTokenID, setClaimableRewardsTokenID] = useState<BigNumber>();

  const [arr, setArr] = useState<string[]>([]);
 
  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function availableRewards(id: BigNumber) {
    const cr = await contract?.call("availableRewards", id);
    setClaimableRewards(cr._hex);
    console.log(ownedNfts);
  }

  async function batchClaimRewards(arr: string[]) {
    const batchClaim = await contract?.call("batchClaimRewards", arr);
  }

  async function batchClaimRewardsList(id: string) {
    arr.push(id);
    setArr([...arr]);
    console.log(arr);
  }

  async function claimRewards(id: BigNumber) {
    const claim = await contract?.call("claimRewards", id);
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Claim your $TOYS</h1>
      <div className={styles.blueLeft}>
        <Image
          src="/blue.png"
          alt="blue left"
          layout="responsive"
          width={689}
          height={1007}
          quality={100}
    /></div>
    <div className={styles.yellowRight}>
        <Image
          src="/yellow.png"
          alt="yellow right"
          layout="responsive"
          width={689}
          height={1007}
          quality={100}
    /></div>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <button className={styles.mainButton} onClick={connectWithMetamask}>
          Connect Wallet
        </button>
      ) : (
        <>
          <div className={styles.tokenGrid}>
          <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards of TOYS#{!claimableRewardsTokenID ? "?" : Number(claimableRewardsTokenID)}</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>
                  {!claimableRewards
                  ? "?"
                  : Number(claimableRewards)}
                </b>{" "}
                ${tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>{tokenBalance?.displayValue}</b> ${tokenBalance?.symbol}
              </p>
            </div>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2>Your ToyMories</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3 className={styles.tokenName}>{nft.metadata.name}</h3>
                <p className={styles.tokenValue}>
              </p>
              <div className={styles.divButton}>
              <button
                  className={`${styles.mainButton} ${styles.spacerTop}`}
                  onClick={() => {availableRewards(nft.metadata.id);
                                  setClaimableRewardsTokenID(nft.metadata.id);
                  }}
                >
                  See your available $TOYS
                </button>
                <button
                  className={`${styles.mainButton} ${styles.spacerTop}`}
                  onClick={() => claimRewards(nft.metadata.id)}
                >
                  Claim $TOYS
                </button>
                <div className={styles.checkbox}>
                  <input type="checkbox" id="cgv" name="cgv" onChange={() => batchClaimRewardsList(nft.metadata.id.toString())}/>
                </div>
                </div>
              </div>
            ))}
          </div>
          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <div className={styles.boxSelected}>
            <h2 className={styles.titleSelected}>Your ToyMories selected {arr.toString()}</h2>
            <button
              className={`${styles.mainButton} ${styles.spacerTop}`}
              onClick={() => batchClaimRewards(arr)}
            >
              Claim Selected $TOYS
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
