import {
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

const tokenContractAddress = "0xf70A188D3ADF2d852f35fE139407287966c5c34f";
const stakingContractAddress = "0xE5a1e410BC203391806aAe4443155959F39Bc76C";

const Home: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();

  // Contract Hooks
  const tokenContract = useContract(tokenContractAddress);
  const erc20 = getErc20(tokenContract.contract)

  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(erc20, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [claimableRewards, setClaimableRewards] = useState<any>();

  const [claimableRewardsTokenID, setClaimableRewardsTokenID] = useState<any>();

  const [arr, setArr] = useState<string[]>([]);

  const [listNft, setListNft] = useState<string[]>([]);

  const [isShown, setIsShown] = useState(true);

 
  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function availableRewards(id: any) {
    const cr = await contract?.call("availableRewards", id);
    setClaimableRewards(cr._hex);
  }

  async function batchClaimRewards(arr: any[]) {
    const batchClaim = await contract?.call("batchClaimRewards", arr);
  }

  async function batchClaimRewardsList(id: string) {
    arr.push(id);
    setArr([...arr]);
    console.log(arr);
  }

  async function claimRewards(id: any) {
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
      //console.log(response.data.total);
      //console.log(response.data.result[0].token_uri);
      //const nfts = [];
      //for (let key in response.data.result) {
       // nfts.push({...response.data.result[key], id: key});
      //}
      //console.log(nfts);
      //const longueur = response.data.length();
      for (let i = 0; i < response.data.total; i++) {
        const metadata = JSON.parse(response.data.result[i].metadata);
        listNft.push(metadata);
        setListNft([...listNft]);
        //console.log(listNft);
        //console.log(metadata.image);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
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
              <h3 className={styles.tokenLabel}>Claimable Rewards of TOY MORIES#{!claimableRewardsTokenID ? "?" : Number(claimableRewardsTokenID)}</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>
                  {!claimableRewards
                  ? "?"
                  : Number(claimableRewards)}
                </b>{" "}
                ${tokenBalance?.name}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>{tokenBalance?.displayValue}</b> ${tokenBalance?.name}
              </p>
            </div>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2 className={styles.titleSelected}>Your ToyMories</h2>
          <button
              style={{display: isShown ? 'block' : 'none'}}
              className={`${styles.mainButton} ${styles.spacerTop}`}
              onClick={() => {
                show();
                setIsShown(false);
              }}
            >
              Show my toy mories
            </button>
          <div className={styles.nftBoxGrid}>
          {listNft?.map((toy: any) => (
          <div className={styles.nftBox}  key={toy.name}>
            <img className={styles.nftMedia} src={toy.image.replace('ipfs:/', 'https://ipfs.io/ipfs')}/>
            <h3 className={styles.tokenName}>{toy.name}</h3>
            <p className={styles.tokenValue}>
              </p>
              <div className={styles.divButton}>
            <button
                  className={`${styles.mainButton} ${styles.spacerTop}`}
                  onClick={() => {availableRewards(toy.name.replace('ToyMories #', ''));
                   setClaimableRewardsTokenID(toy.name.replace('ToyMories #', ''));
                  }}
                >
                  See your available $TOYS
                </button>
                <button
                  className={`${styles.mainButton} ${styles.spacerTop}`}
                  onClick={() => claimRewards(toy.name.replace('ToyMories #', ''))}
                >
                  Claim $TOYS
                </button>
                <div className={styles.checkbox}>
                  <input type="checkbox" id="cgv" name="cgv" onChange={() => batchClaimRewardsList(toy.name.replace('ToyMories #', ''))}/>
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
