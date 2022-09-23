const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const provider = new HDWalletProvider(
    'subway hood bright live acquire blame grunt anger near review train category',
    'https://rinkeby.infura.io/v3/0d925ba77ebc4647bf6304df79f318a1'
)

const web3 = new Web3(provider);

const { bytecode, interface } = require('./compile');

const deploy = async() => {
    const accounts = await web3.eth.getAccounts();

    console.log('The contract will be deployed from ', accounts[0]);

    const lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data : bytecode})
        .send({ from : accounts[0], gas : '1000000'})

    console.log('The contract will be deployed to ', lottery.options.address);

    provider.engine.stop();
}

deploy();