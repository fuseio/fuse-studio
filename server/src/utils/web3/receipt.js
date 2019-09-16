const isEmpty = (receipt) => !receipt || !receipt.blockHash || !receipt.blockNumber

module.exports = {
  isEmpty
}
