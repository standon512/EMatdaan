const express = require('express');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server.js');
const Miner = require('./miner');
const bodyParser = require('body-parser');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const { map } = require('../userkeys') ; 
const { candidates } = require('../candidates');

const path=require('path');
const ChainUtil = require('../chain-util');
images = ["E:\EMatdaan\public\images\voting.jpg"];

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create a new app
const app  = express();

//using the blody parser middleware
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.set('views','./views');
app.set('view engine', 'ejs');

//app.use(express.static(path.join(__dirname,'public')));

// create a new blockchain instance
const blockchain = new Blockchain();
const key1=ChainUtil.genKeyPair();
const wallet = new Wallet(key1);

//initialize candidate wallets
const stkey=ChainUtil.keyFromPrivate(map['216132017546'].private);
const stwallet=new Wallet(stkey);
const nskey=ChainUtil.keyFromPrivate(map['321456009871'].private);
const nswallet=new Wallet(nskey);
const spkey=ChainUtil.keyFromPrivate(map['123567861401'].private);
const spwallet=new Wallet(spkey);
const srkey=ChainUtil.keyFromPrivate(map['223456798120'].private);
const srwallet=new Wallet(srkey);


// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();

//EXPOSED APIs
const p2pserver = new P2pServer(blockchain, transactionPool);
p2pserver.listen(); // starts the p2pserver

const miner = new Miner(
    blockchain,
    transactionPool,
    wallet,
    p2pserver
);

app.get('/',(req,res) => {
    res.render('index', {images: images})
})

app.post('/',urlencodedParser, (req,res)=>{
    console.log(req.body);
    const { user, key, candidate } = req.body;
    if(map[user]===undefined)
    {
        console.log('Invalid credentials');
    }
    else if(map[user].private!== key)
        console.log('Invalid credentials');
    else if(candidate==='candidate')
    {
        console.log('Select a candidate');
    }
    else{
    const myKey=ChainUtil.keyFromPrivate(key);
    const senderWallet= new Wallet(myKey);
    console.log( map[candidates[candidate].aadhar].public);
    const transaction = senderWallet.createTransaction(
             map[candidates[candidate].aadhar].public, 1, blockchain, transactionPool);
                                      
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transactions');
    console.log(stwallet.calculateBalance(blockchain));
    }
});

app.post('/index',urlencodedParser, (req,res)=>{
    console.log(req.body);
    const { user, key, candidate } = req.body;
    if(map[user]===undefined)
    {
        console.log('Invalid credentials');
    }
    else if(map[user].private!== key)
        console.log('Invalid credentials');
    else if(candidate==='candidate')
    {
        console.log('Select a candidate');
    }
    else{
    const myKey=ChainUtil.keyFromPrivate(key);
    const senderWallet= new Wallet(myKey);
    
    console.log( map[candidates[candidate].aadhar].public);
    const transaction = senderWallet.createTransaction(
             map[candidates[candidate].aadhar].public, 1, blockchain, transactionPool);
                                      
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transactions');
    console.log(stwallet.calculateBalance(blockchain));
    }
});

//api to get the blocks
app.get('/blocks',(req,res)=>{

    res.json(blockchain.chain);

});

app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
    });

//api to add blocks
app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    res.redirect('/blocks');
    p2pserver.syncChain();
});

app.post('/transact',(req,res)=>{
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(
             recipient, amount, blockchain, transactionPool);
                                      
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transactions');
    });

// get public key
app.get('/public-key',(req,res)=>{
    res.json({publicKey: wallet.publicKey});
})

app.get('/mine-transactions',(req,res)=>{
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
    console.log(stwallet.calculateBalance(blockchain));
 })

 app.get('/result',(req,res) => {
    let stvote=stwallet.calculateBalance(blockchain)-500;
    let nsvote=nswallet.calculateBalance(blockchain)-500;
    let spvote=spwallet.calculateBalance(blockchain)-500;
    let srvote=srwallet.calculateBalance(blockchain)-500;
    let votes=[stvote, nsvote, spvote, srvote];
    res.render('result', {votes:votes});
    
})



// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})