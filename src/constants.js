const CONTRACT_ADDRESS = "0xFC46C688964A04b7116151569EA739fec79a1bd9";

// Transform's rune CharacterAttributes data retrieved from Contract into
// easily processible object for our app
const transformRuneData = (runeData) => {
  return {
    name: runeData.name,
    imageURI: runeData.imageURI,
    hp: runeData.hp.toNumber(),
    maxHp: runeData.maxHp.toNumber(),
    attackDamage: runeData.attackDamage.toNumber(),
    fortitude: runeData.fortitude.toNumber(),
    finesse: runeData.finesse.toNumber(),
    fantasia: runeData.fantasia.toNumber(),
  };
};

const transformBossData = (bossData) => {
  return {
    name: bossData.name,
    imageURI: bossData.imageURI,
    hp: bossData.hp.toNumber(),
    maxHp: bossData.maxHp.toNumber(),
    attackDamage: bossData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformRuneData, transformBossData };
