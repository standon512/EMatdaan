const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');


class Wallet{
    /**
     * the wallet will hold the public key
     * and the private key pair
     * and the balance
     */
    constructor(keyPair){
        this.balance = INITIAL_BALANCE;
        this.keyPair = keyPair;
        this.publicKey = keyPair.getPublic().encode('hex');
    }

    toString(){
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`
    }

    createTransaction(recipient, amount, blockchain,  transactionPool){

        this.balance = this.calculateBalance(blockchain);
        
        if(amount > this.balance){
            console.log(`Amount: ${amount} exceeds the current balance: ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if(transaction){
            // creates more outputs
            transaction.update(this,recipient,amount)
        }
        else{
            // creates a new transaction and updates the transaction pool
            transaction = Transaction.newTransaction(this,recipient,amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;

    }

    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }

    static blockchainWallet(){
        const key=ChainUtil.genKeyPair();
        const blockchainWallet = new this(key);
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }

    /**
     * updates the balance of the wallet
     * based on the latest transaction
     */

     calculateBalance(blockchain){
        
        // store the existing balance
        let balance = this.balance;

        // create an array of transactions
        let transactions = [];

        // store all the transactions in the array
        blockchain.chain.forEach(block => block.data.forEach(transaction =>{
            transactions.push(transaction);
        }));

        // get all the transactions generated by the wallet ie money sent by the wallet
        const walletInputTransactions = transactions.filter(transaction => transaction.input.address === this.publicKey);

        // declare a variable to save the timestamp
        let startTime = 0;

        if(walletInputTransactions.length > 0){

            // get the latest transaction
            const recentInputTransaction = walletInputTransactions.reduce((prev,current)=> prev.input.timestamp > current.input.timestamp ? prev : current );
            
            // get the outputs of that transactions, its amount will be the money that we would get back
            balance = recentInputTransaction.outputs.find(output => output.address === this.publicKey).amount

            // save the timestamp of the latest transaction made by the wallet
            startTime = recentInputTransaction.input.timestamp
        }

        // get the transactions that were addressed to this wallet ie somebody sent some moeny
        // and add its ouputs.
        // since we save the timestamp we would only add the outputs of the transactions recieved
        // only after the latest transactions made by us

        transactions.forEach(transaction =>{
            if(transaction.input.timestamp > startTime){
                transaction.outputs.find(output=>{
                    if(output.address === this.publicKey){
                        balance += output.amount;
                    }
                })
            }
        })
        return balance;

    }
}

module.exports = Wallet;