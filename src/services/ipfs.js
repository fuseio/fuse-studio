import IPFS from 'ipfs'

function ops (node) {
  node.id((err, res) => {
    if (err) {
      throw err
    }

    console.log('IPFS connected')
    console.log(`id: ${res.id}`)
    console.log(`version: ${res.agentVersion}`)
    console.log(`protocol_version: ${res.protocolVersion}`)
  })
}

const init = () => {
  const node = new IPFS({ repo: String(Math.random() + Date.now()) })

  node.once('ready', () => {
    console.log('IPFS node is ready')
    ops(node)
  })

  return node
}

const ipfs = init()

export default ipfs
