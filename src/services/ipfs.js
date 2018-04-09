// import IPFS from 'ipfs'
import ipfsAPI from 'ipfs-api'

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
  const ipfs = new ipfsAPI('/ip4/127.0.0.1/tcp/5001')
  ops(ipfs)

  return ipfs
}

const ipfs = init()

export default ipfs
