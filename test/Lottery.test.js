const assert = require('assert');
const ganache = require('ganache-cli')
const Web3 = require('web3');

const { interface, bytecode } = require('../compile');
const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async() => {
    accounts = await new web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data : bytecode})
        .send({ from : accounts[0], gas : '1000000'})
})

describe('Lottery', () => {
    it('Confirms the contract deployed to an address', () => {
        assert.ok(lottery.options.address);
    })

    it('Ensures a player can successfully enter the lottery', async() => {
        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from : accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    })

    it('Ensures multiple players can successfully enter the lottery', async() => {
        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from : accounts[1],
            value : web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from : accounts[2],
            value : web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from : accounts[3],
            value : web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from : accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(accounts[3], players[3]);
        assert.equal(4, players.length);
    })

    it('Ensures only values above 0.01 eth can be used to enter the lottery', async() => {
        try{
            await lottery.methods.enter().send({
                from : accounts[0],
                value : web3.utils.toWei(200)
            }) 
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('Ensures only the contract creator can call the pick winner function', async() => {
        try{
            await lottery.methods.enter().send({
                from : accounts[0],
                value : web3.utils.toWei('0.02', 'ether')
            })
    
            await lottery.methods.enter().send({
                from : accounts[1],
                value : web3.utils.toWei('0.02', 'ether')
            })
            
            await lottery.methods.pickWinner().send({
                from : accounts[1]
            })
            assert(false)
        } catch (err) {
            assert(err);
        }
    })

    it('Ensures that the winner receives the winnings', async() => {
        await lottery.methods.enter().send({ 
            from : accounts[0],
            value : web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from : accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    })
})