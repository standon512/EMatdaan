const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
// secp256k1 is the algorithm to generate key pair

const { v1: uuidV1 } = require('uuid');
// version 1 use timestamp to generate unique ids

const SHA256 = require('crypto-js/sha256');

class ChainUtil{
    static genKeyPair(){
            return ec.genKeyPair();
        }

    static id(){
        return uuidV1();
    }

    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey,signature,dataHash){
        return ec.keyFromPublic(publicKey,'hex').verify(dataHash,signature);
        }

    static keyFromPrivate(privateKey){
        return ec.keyFromPrivate(privateKey);
    }


}

module.exports = ChainUtil;