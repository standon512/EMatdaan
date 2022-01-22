const SHA256 = require('crypto-js/sha256');
const { DIFFICULTY,MINE_RATE } = require('./config.js');


class Block{

    constructor(timestamp,lastHash,hash, data, nonce, difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString(){
        return `Block - 
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Data      : ${this.data}
        Difficulty: ${this.difficulty}`;
    }

    static genesis(){
        return new this('Genesis time','----','genesis-hash',[],0, DIFFICULTY);
    }  
    
    static hash(timestamp,lastHash,data,nonce,difficulty){
        return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static adjustDifficulty(lastBlock,currentTime){
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; 
        return difficulty; 
    }

    static mineBlock(lastBlock,data){

        let hash;
        let timestamp;
        const lastHash = lastBlock.hash;

        let { difficulty } = lastBlock;

        let nonce = 0;
        //generate the hash of the block
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = Block.hash(timestamp,lastHash,data,nonce,difficulty);
            // checking if we have the required no of leading number of zeros
        } while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp,lastHash,hash,data,nonce,difficulty);
    }

    static blockHash(block){
        //destructuring
        const { timestamp, lastHash, nonce, data, difficulty } = block;
        return Block.hash(timestamp,lastHash, data, nonce, difficulty);
    }

    static signTransaction(transaction,senderWallet){
        transaction.input = {
           timestamp: Date.now(),
           amount: senderWallet.balance,
           address: senderWallet.publicKey,
           signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
    }
}

}

module.exports = Block;