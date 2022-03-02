const setBaseURI = async (contract, baseURI) => {
  let tx = await contract.setBaseURI (baseURI);
  tx.wait (1);
};

const setMintTime = async (contract, claimTime, presaleTime, publicTime) => {
  let tx = await contract.setMintTime (claimTime, presaleTime, publicTime);
  tx.wait (1);
};

const setPromotionMint = async (contract, amount) => {
  let tx = await contract.promotionMint (amount);
  tx.wait (1);
};

exports.setBaseURI = setBaseURI;
exports.setPromotionMint = setPromotionMint;
exports.setMintTime = setMintTime;
