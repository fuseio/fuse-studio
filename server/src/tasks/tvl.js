const tvl = require('@utils/tvl')

const calculateCurrentTvl = async () => {
  await tvl.calculateTvl()
}

module.exports = {
  calculateCurrentTvl
}
