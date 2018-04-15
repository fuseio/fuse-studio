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
  // const ipfs = new IpfsAPI('/ip4/ec2-34-211-228-220.us-west-2.compute.amazonaws.com/tcp/80')
  const ipfs = new IpfsAPI({host: 'ec2-34-211-228-220.us-west-2.compute.amazonaws.com', port: 80, protocol: 'http'})
  ops(ipfs)

  return ipfs
}

const ipfs = init()

export default ipfs
