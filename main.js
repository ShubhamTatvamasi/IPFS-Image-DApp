// set the provider you want from Web3.providers
web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"))

// IPFS Contract Interface
const IPFSContract = web3.eth.contract(IPFSABI).at(IPFSAddress)

const PublicKey = '0xbe862AD9AbFe6f22BCb087716c7D89a26051f74C'
const PrivateKey = 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
var Nonce = 0

IPFSContract.ipfsHash((error, result) => {
    document.body.background = `https://ipfs.infura.io/ipfs/${result}`
})

// for getting the nonce from blockchain
web3.eth.getTransactionCount(PublicKey, (error, result) => {
  Nonce = result
})

function newBackground(hash) {

  const data = IPFSContract.sendHash.getData(hash)

  const tx = new ethereumjs.Tx({
    nonce: Nonce,
    gasPrice: 1e9,
    gasLimit: 1e6,
    to: IPFSAddress,
    data: data
  })

  tx.sign(ethereumjs.Buffer.Buffer.from(PrivateKey, "hex"))

  const raw = "0x" + tx.serialize().toString("hex")

  web3.eth.sendRawTransaction(raw, (err, transactionHash) => {})

  Nonce++

}

function upload() {
  const reader = new FileReader();
  reader.onloadend = () => {
    const ipfs = window.IpfsApi({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // Connect to IPFS
    const buf = ethereumjs.Buffer.Buffer(reader.result) // Convert data into buffer
    ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
      if(err) {
        console.error(err)
        return
      }
      let url = `https://ipfs.infura.io/ipfs/${result[0].hash}`
      console.log(`Url --> ${url}`)
      document.body.background = url
      newBackground(result[0].hash)
    })
  }
  const photo = document.getElementById("photo")
  reader.readAsArrayBuffer(photo.files[0]) // Read Provided File
}
document.getElementById("photo").addEventListener('input', upload)
