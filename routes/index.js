const express = require('express');
const fetch = require('node-fetch');
const Web3 = require('web3');
const TruffleContract = require("@truffle/contract");
const fs = require('fs');

// Constants
const siteUrl = 'https://cryptosuits.netlify.app/';
const provider = 'wss://rinkeby.infura.io/ws/v3/721b7c03aa4d4431b4d6a5f9876d116a';
//const provider = 'http://127.0.0.1:7545';
const ownerAccount = '0x00796e910Bd0228ddF4cd79e3f353871a61C351C';                  // Address of the current queryer

// Start the router
const router = express.Router();
let contract, deployed;

// Set the reveal
let reveal = false;

/* GET home page. */
router.get('/', function(req, res) {
    res.json({msg:'GTFO'});
});

/* GET all claimable badges. */
router.get('/json/:id', function(req, res) {
    const id = req.params.id;
    initContract().then(() => {
        getToken(id).then((exists) => {
            if(exists) {
                if(reveal) {
                  const data = fs.readFileSync('./tokens/' + id);
                  const json = JSON.parse(data);
                  res.json(json);
                } else {
                  res.json({image: siteUrl + 'suit.png'});
                }
            } else {
                res.json({exists: exists});
            }
        });
    });
    
});

// Initialize the contract to check on our existing badge status
const initContract = async function() {
    const web3 = new Web3(Web3.givenProvider || provider);
    const response = await fetch(siteUrl + 'contracts/CryptoSuits.json');
    const json = await response.json();
    contract = TruffleContract(json);
    contract.setProvider(web3.currentProvider);
    contract.defaults({
        from: ownerAccount,
        gasPrice: 0
    });
    deployed = await contract.deployed();
};

// Returns one rock
const getToken = async function(id) {
    try {
        const tokenExists = await deployed.exists.call(id, {from: ownerAccount, value: 0});
        return tokenExists;
    }
    catch (error) {
        console.log('Web3 Error', error);
        return false;
    }
};

module.exports = router;
