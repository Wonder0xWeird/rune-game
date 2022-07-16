import React, {useState, useEffect} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import { CONTRACT_ADDRESS, transformRuneData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // State function to hold connected user's wallet address
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [runeNFT, setRuneNFT] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object");
      }
    } catch (err){
      console.log(err);
    }
  }

  // Render Methods
  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          {!isConnected && <button className="cta-button connect-wallet-button" onClick={connectWallet}>Connect your Wallet</button>}
          <img
            src="pixelwizbook.gif"
            alt="Monty Python Gif"
          />
        </div>
      );
    } else if (currentAccount && !runeNFT) {
      return <SelectCharacter setRuneNFT={setRuneNFT} />
    } else if (currentAccount && runeNFT) {
      return <Arena runeNFT={runeNFT} setRuneNFT={setRuneNFT} />
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      // Alert user if they do not have Rinkeby Testnet selected
      console.log(ethereum.networkVersion);
      if (ethereum.networkVersion !== "4") {
        alert("Please connect your wallet to Rinkeby Testnet first!");
        return;
      }

      if (!ethereum) {
        alert("Make sure you have MetaMask!");
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_requestAccounts"});
        setCurrentAccount(accounts[0]);
        alert("Connected to Account: " + accounts[0]);
        setIsConnected(true);
      }
    }catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    // The function we will call that interacts with our smart contract
    const fetchNFTMetadata = async () => {
      console.log("Checking for Rune NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("We have found the user's Rune.");
        console.log(transformRuneData(txn));
        setRuneNFT(transformRuneData(txn));
      } else {
        console.log("No Rune found.");
      }
    }

    if (currentAccount) {
      console.log("Current Account: ", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🌙 Rune Caster ✨</p>
          <p className="sub-text">Only magic can save the day...</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
