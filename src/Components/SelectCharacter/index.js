import React, {useState, useEffect} from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformRuneData } from '../../constants';
import myEpicGame from "../../utils/MyEpicGame.json";

const SelectCharacter = ({ setRuneNFT }) => {
  const [runes, setRunes] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  // Actions
  const mintRuneNFTAction = async (runeId) => {
    try {
      if (gameContract) {
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(runeId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
      }
    } catch (err) {
      console.warn("mintRuneNFTAction Error:", err);
    }
  }

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
      // Save the game contract into the component's state!
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getRunes = async () => {
      try {
        console.log("Getting rune selection to mint");

        // Call our contract to retrieve all mintable Runes
        const runesTxn = await gameContract.getAllDefaultCharacters();

        // Go through each retrieved rune and transform data
        const runes = runesTxn.map((runeData) =>
          transformRuneData(runeData)
        )
        console.log(runes);

        //Set all mintable runes in state
        setRunes(runes);
      } catch (err) {
        console.log(err);
      }
    };

    // Add a callback method that will fire when the minting event is recieved
    const onRuneMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `RuneNFTMinted - sender: ${sender}, tokenId: ${tokenId}, runeIndex: ${characterIndex.toNumber()}`
      );
      alert(`Your Rune has been summoned -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

      // Once the rune NFT is minted we can fetch the metadata from our contract
      // and set it in state to move onto the Arena
      if (gameContract) {
        const runeNFT = await gameContract.checkIfUserHasNFT();
        console.log("RuneNFT: ", runeNFT);
        setRuneNFT(transformRuneData(runeNFT));
      }
    }

    // If our gameContract is ready, retrieve the runes!
    if (gameContract) {
      getRunes();

      // Setup NFT Minted Event Listener
      gameContract.on("CharacterNFTMinted", onRuneMint);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onRuneMint);
      }
    }
  }, [gameContract]);

  const renderRunes = () =>
    runes.map((rune, index) => (
      <div className="character-item" key={rune.name}>
        <div className="name-container">
          <p>{rune.name}</p>
        </div>
        {/*NEW <img src> PREPEND: https://ipfs.io/ipfs/*/}
        <img src={`https://gateway.pinata.cloud/ipfs/${rune.imageURI}`} alt={rune.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintRuneNFTAction(index)}
        >{`Mint ${rune.name}`}</button>
      </div>
    ));


  return (
    <div className="select-character-container">
      <h2>Summon your Rune. Choose wisely...</h2>
      {runes.length > 0 && (<div className="character-grid">{renderRunes()}</div>)}
    </div>
  )
}

export default SelectCharacter;
