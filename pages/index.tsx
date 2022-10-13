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
import axios from 'axios';

const nftDropContractAddress = "0xC3C62E97c85EA5D8D2EdC39034e9dfc6452a50D1";
const tokenContractAddress = "0xf70A188D3ADF2d852f35fE139407287966c5c34f";
const stakingContractAddress = "0xE5a1e410BC203391806aAe4443155959F39Bc76C";

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

  const [listNft, setListNft] = useState<any>();
 
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
    
  const options = {
    method: 'GET',
    url: `https://deep-index.moralis.io/api/v2/${address}/nft`,
    params: {
      chain: 'eth',
      format: 'decimal',
      token_addresses: '0xC3C62E97c85EA5D8D2EdC39034e9dfc6452a50D1'
    },
    headers: {accept: 'application/json', 'X-API-Key': 'Q4zKEBeWXo97V8JG45sXlmwoQmSv4nCoKPm9pbAR3qCjGnZK7mqYnb51SyYoqCh4'}
  };
  
  async function show() {
  axios
    .request(options)
    .then(function (response) {
      //console.log(response.data);
      //console.log(response.data.result[0].token_uri);
      //const nfts = [];
      //for (let key in response.data.result) {
       // nfts.push({...response.data.result[key], id: key});
      //}
      //console.log(nfts);
      for (let i = 0; i < 2; i++) {
        const metadata = JSON.parse(response.data.result[i].metadata);
        listNft.push(metadata);
        setListNft([...listNft]);
        console.log(listNft);
        //console.log(metadata.image);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  interface listNft {
    image: number;
    name: string;
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
          {listNft?.map((reptile: any) => (
          <div key={reptile}>
            <p>{reptile.name}</p>
            <img src={reptile.image.replace('ipfs:/', 'https://ipfs.io/ipfs')}/>
          </div>))}
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
            <div>
    </div>
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
            <button
              className={`${styles.mainButton} ${styles.spacerTop}`}
              onClick={() => show()}
            >
              Show
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
