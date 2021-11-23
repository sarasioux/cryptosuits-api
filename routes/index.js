const express = require('express');
const Web3 = require('web3');
const TruffleContract = require("@truffle/contract");
const fs = require('fs');

const { convert } = require('convert-svg-to-png');

// Constants
const siteUrl = 'https://cryptosuits.herokuapp.com/';
//const siteUrl = 'http://localhost:3000/';
const provider = 'wss://rinkeby.infura.io/ws/v3/721b7c03aa4d4431b4d6a5f9876d116a';
//const provider = 'http://127.0.0.1:7545';
const ownerAccount = '0x00796e910Bd0228ddF4cd79e3f353871a61C351C';                  // Address of the current queryer

// Start the router
const router = express.Router();
let contract, deployed;

// Set the reveal
let reveal = true;

/* GET home page. */
router.get('/', function(req, res) {
    res.json({msg:'GTFO'});
});

router.get('/json/:id', function(req, res) {
    const id = req.params.id;
    initContract().then(() => {
        getToken(id).then((exists) => {
            if(exists) {
                if(reveal) {
                  const data = fs.readFileSync('./tokens/output/' + id + '.json');
                  const json = JSON.parse(data);
                  json.ipfs = json.image;
                  json.image = siteUrl + 'image/' + id;
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

router.get('/json2/:id', function(req, res) {
  const id = req.params.id;
  //initContract().then(() => {
    //getToken(id).then((exists) => {
      //if(exists) {
        //if(reveal) {
          const data = fs.readFileSync('./tokens/output/' + id + '.json');
          const json = JSON.parse(data);
          res.json(json);
        //} else {
        //  res.json({image: siteUrl + 'suit.png'});
        //}
      //} else {
      //  res.json({exists: exists});
      //}
    //});
  //});
});

router.get('/image/:id', function(req, res) {
  const id = req.params.id;
  const data = fs.readFileSync('./tokens/output/' + id + '.json');
  const json = JSON.parse(data);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><image href="${json.image}" height="1000" width="1000" style="image-rendering: pixelated" /></svg>`;
  convert(svg, {width: 1000, height: 1000, puppeteer: { timeout: 0, args: ['--no-sandbox', '--disable-setuid-sandbox']}}).then((png) => {
    res.set('Content-Type', 'image/png');
    res.send(png);
  });
});

router.get('/CryptoSuits.json', function(req, res) {
  let rawData = fs.readFileSync(process.cwd() + '/build/contracts/CryptoSuits.json');
  let json = JSON.parse(rawData);
  res.json(json);
});

const initContract = async function() {
    const web3 = new Web3(Web3.givenProvider || provider);
    let rawData = fs.readFileSync(process.cwd() + '/build/contracts/CryptoSuits.json');
    let json = JSON.parse(rawData);
    contract = TruffleContract(json);
    contract.setProvider(web3.currentProvider);
    contract.defaults({
        from: ownerAccount,
        gasPrice: 0
    });
    deployed = await contract.deployed();
};

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
