const chainName = chainId => {
  switch (chainId) {
    case 1:
      return 'Mainnet';
    case 3:
      return 'Ropsten';
    case 4:
      return 'Rinkeby';
    case 5:
      return 'Goerli';
    case 42:
      return 'Kovan';
    case 31337:
      return 'Localhost';
    default:
      return 'Unknown';
  }
};
exports.chainName = chainName;
