const { ethers } = require("ethers")
const fs = require('fs')

const privateKey = fs.readFileSync(".secret").toString().trim()

const QUICKNODE_HTTP_ENDPOINT = "YOUR_QUICKNODE_HTTP_ENDPOINT"
const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_HTTP_ENDPOINT)

const contractAddress = "0x66e47a27241f38b8482c0ae95e55a535324f9f54"
const contractAbi = fs.readFileSync("abi.json").toString()
const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider)

const wallet = new ethers.Wallet(privateKey, provider)

async function getGasPrice() {
    let feeData = (await provider.getGasPrice()).toNumber()
    return feeData
}

async function getNonce(signer) {
    let nonce = await provider.getTransactionCount(wallet.address)
    return nonce
}

async function mintNFT(address, URI) {
    try {
        const nonce = await getNonce(wallet)
        const gasFee = await getGasPrice()
        let rawTxn = await contractInstance.populateTransaction.safeMint(address, URI, {
            gasPrice: gasFee, 
            nonce: nonce
        })
        console.log("...Submitting transaction with gas price of:", ethers.utils.formatUnits(gasFee, "gwei"), " - & nonce:", nonce)
        let signedTxn = (await wallet).sendTransaction(rawTxn)
        let reciept = (await signedTxn).wait()
        if (reciept) {
            console.log("Transaction is successful!!!" + '\n' + "Transaction Hash:", (await signedTxn).hash + '\n' + "Block Number: " + (await reciept).blockNumber + '\n' + "Navigate to https://polygonscan.com/tx/" + (await signedTxn).hash, "to see your transaction")
        } else {
            console.log("Error submitting transaction")
        }
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e)
    }
}


mintNFT("0x4611C6aF83a938AeB9E41a1aBFf643A29B623c46", "https://bafkreif4rv2kafqbmrmifwg7davpwmd4vgkehe63ryosdzajn7nnbifnfm.ipfs.nftstorage.link/")