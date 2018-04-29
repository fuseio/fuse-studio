// import IPFS from 'ipfs'
import IpfsAPI from 'ipfs-api'

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
  const ipfs = new IpfsAPI({host: 'qa-ipfs.colu.com', port: 443, protocol: 'https'})
  ops(ipfs)

  return ipfs
}

const ipfs = init()

export default ipfs
