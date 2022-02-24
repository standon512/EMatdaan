const EC = require('elliptic').ec;
const ec= new EC('secp256k1');

const key=ec.genKeyPair();
const public=key.getPublic('hex');
const private=key.getPrivate('hex');
//console.log(key);
console.log('private key: ',private);
console.log('public key: ',public);

