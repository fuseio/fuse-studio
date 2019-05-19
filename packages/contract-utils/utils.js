const fs = require('fs')
var path = require('path')

const createPropertyDir = (contractPart, relPath) => {
  const buildPath = path.join(relPath, './build/contracts')
  const destPath = path.join(relPath, `./build/${contractPart}`)

  try {
    fs.mkdirSync(destPath, { recursive: true })
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(err.code)
      throw err
    }
  }

  fs.readdir(buildPath, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err)
      process.exit(1)
    }

    files.forEach((file) => {
      const filePath = path.join(buildPath, file)
      const contract = require(filePath)
      fs.writeFile(path.join(destPath, file), JSON.stringify(contract[contractPart], null, 4), (err) => {
        if (err) {
          console.error(err)
        }
      })
    })
  })
}

const filterEvents = (abi) => abi.filter(({ type }) => type === 'event')

const extendAbiWithEvents = (relPath, contractToExtend, ...contracts) => {
  const abiPath = path.join(relPath, 'build/abi')
  let abiToExtend = require(path.join(abiPath, contractToExtend))
  for (let contract of contracts) {
    const abi = require(path.join(abiPath, contract))
    const events = filterEvents(abi)
    abiToExtend = [...abiToExtend, ...events]
  }
  fs.writeFileSync(path.join(abiPath, contractToExtend + 'WithEvents.json'), JSON.stringify(abiToExtend, null, 4))
}

module.exports = {
  createPropertyDir,
  extendAbiWithEvents
}
