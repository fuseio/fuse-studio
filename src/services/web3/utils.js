export const getNetworkName = (netId) => {
  switch (netId) {
    case 1:
      return 'mainnet'
    case 2:
      return 'morden'
    case 3:
      return 'ropsten'
    default:
      return 'unknown'
  }
}
