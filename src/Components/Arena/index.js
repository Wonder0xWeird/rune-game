import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformRuneData, transformBossData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';

// Pass in our runeNFT metadata so we can show a cool card in our UI
const Arena = ({ runeNFT, setRuneNFT }) => {
  //State to hold gameContract and Boss metadata
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");

  const ipfsTest = "QmNtUCCSAJUXsAVEs7s2MvmjkZPJpDNyZnKJh5wmFZagxc"

  // Actions
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");
      }
    } catch (err) {
      console.log("Error attacking the boss:", err);
      setAttackState("");
    }
  };

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    // Set up async function that will get the boss from our contract and sets in state
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss:", bossTxn);
      setBoss(transformBossData(bossTxn));
    };

    // Set up attack event Listener
    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(`Attack complete: Boss HP: ${bossHp}, Player HP: ${playerHp}`);

      // Update the boss and player HP wit the event data
      setBoss((prevState) => {
        return {...prevState, hp: bossHp};
      });

      setRuneNFT((prevState) => {
        return {...prevState, hp: playerHp};
      });
    }

    // When gameContract is ready to go, fetch the boss and any attack events!
    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    }
  }, [gameContract]);


  return (
    <div className="arena-container">
      {/*BOSS*/}
      {/*NEW <img src> PREPEND: https://cloudflare-ipfs.com/ipfs/*/}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={`https://gateway.pinata.cloud/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp}`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
        </div>
      )}

      {/*RUNE*/}
      {/*NEW <img src> PREPEND: https://ipfs.io/ipfs/*/}
      {runeNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Rune</h2>
            <div className="player">
              <div className="image-content">
                <h2>{runeNFT.name}</h2>
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${runeNFT.imageURI}`}
                  alt={`Character ${runeNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={runeNFT.hp} max={runeNFT.maxHp} />
                  <p>{`${runeNFT.hp} / ${runeNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${runeNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Arena;
