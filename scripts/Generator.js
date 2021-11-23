/*
    Generator module.
    
*/

// Imports
const { create, globSource } = require('ipfs-http-client');
const fs = require('fs');
const crypto = require('crypto');

// Configs
const imageFolder = '../tokens/png/';
const jsonFolder = '../tokens/json/';
const outputFolder = '../tokens/output/';
const output2Folder = '../tokens/output2/';
const output3Folder = '../tokens/output3/';

// IPFS Settings
const ipfsHost = 'ipfs.infura.io';
const ipfsPort = 5001;
const ipfsProtocol = 'https';
const ipfsProjectId = '21HpyrE0o3bLEOMZyzpsZB8bYMQ';
const ipfsProjectSecret = 'd06768a0b13340c98d052fa6c9e12846';

// Generator
const Generator = function() {
  this.readDirectory = async function(path) {
    return new Promise(function (resolve, reject) {
      try {
        let returnFiles = [];
        console.log('Reading path', path);
        fs.readdir(path, (err, files) => {
          files.forEach(file => {
            if (file.substr(0,1) !== '.') {
              returnFiles.push(file);
            }
          });
          resolve(returnFiles);
        });
      }
      catch (error) {
        reject(error);
      }
    });
  };
  this.suitChoices = async function() {
    let returnFiles = {};
    const files = await this.readDirectory(imageFolder);
    
    let goodfiles = 0;
    let missingfiles = 0;
    let emptyfiles = 0;
    
    let missing = [];
    let empty = [];
    
    console.log('Total files', files.length);
    
    let k=0;
    for(let i in files) {
      let parts = files[i].split('.');
      let code = parts[0];
      
      // Load associated JSON
      let jsonPath = jsonFolder + code + '.json';
      if(fs.existsSync(jsonPath)) {
        let rawData = fs.readFileSync(jsonPath, 'utf8');
        let jsonString = rawData.toString();
        if(jsonString.length > 0) {
          jsonString = jsonString.replace(',"Accessory","value":', ',{"trait_type":"Accessory","value":');
          let fileJson = this.looseJsonParse(jsonString);
          k++;
          
          // Copy the image where it goes
          await this.copy(imageFolder + code + '.png', outputFolder + k + '.png');
          
          // Write new JSON
          await fs.writeFileSync(outputFolder + k + '.json', JSON.stringify(fileJson));
  
          console.log(k, 'Found good file', jsonPath);
          goodfiles++;
        } else {
          console.log('empty json file', jsonPath);
          empty.push(code);
          emptyfiles++;
        }
      } else {
        console.log('could not find file', jsonPath);
        missing.push(code);
        missingfiles++;
      }
    }
    console.log('Found good json files', goodfiles);
    console.log('Missing json files', missingfiles);
    console.log('Empty json files', emptyfiles);
    console.log('MISSING', missing);
    console.log('EMPTY', empty);
    return files;
  };
  
  this.reHash = async function() {
    const files = await this.readDirectory(imageFolder);
    let k=0;
    for(let i in files) {
      let parts = files[i].split('.');
      let code = parts[0];
    
      // Load associated JSON
      let jsonPath = jsonFolder + code + '.json';
      if(fs.existsSync(jsonPath)) {
        let rawData = fs.readFileSync(jsonPath, 'utf8');
        let jsonString = rawData.toString();
        if(jsonString.length > 0) {
          k++;
          
          const path = outputFolder + k + '.json';
          const response = fs.readFileSync(path);
          let json = JSON.parse(response);
          
          let imageData = fs.readFileSync(imageFolder + files[i]);
          let imageHash = crypto.createHash('sha256').update(imageData).digest('hex');
          json.hash = imageHash;
        
          // Write new JSON
          await fs.writeFileSync(output2Folder + imageHash + '.json', JSON.stringify(json));
        
          console.log(k, 'Hashed json', output2Folder + imageHash + '.json');
        }
      }
    }
  };
  
  this.reNumber = async function() {
    const files = await this.readDirectory(output2Folder);
    let k=0;
    for(let i in files) {
      k++;
      await this.copy(output2Folder + files[i], output3Folder + k + '.json');
    }
  };
  
  this.copy = async function(src, dst) {
    fs.copyFile(src, dst, (err) => {
      if (err) {
        console.log("Error Found:", err);
      } else {
        return true;
      }
    });
  };
  
  this.looseJsonParse = function(obj) {
    return Function('"use strict";return (' + obj + ')')();
  };
  
  this.ipfsUploadOne = async function(id) {
    const auth = 'Basic ' + Buffer.from(ipfsProjectId + ':' + ipfsProjectSecret).toString('base64')
    const ipfs = await create({
      host: ipfsHost,
      port: ipfsPort,
      protocol: ipfsProtocol,
      headers: {
        authorization: auth
      },
      timeout: '20m'
    });
  
    const jsonPath = outputFolder + id + '.json';
  
    // Load the existing JSON
    let rawData = fs.readFileSync(jsonPath);
    let fileJson = JSON.parse(rawData);
    
    const imagePath = String(outputFolder + id + '.png');
    const { cid } = await ipfs.add(globSource(imagePath));
    fileJson.image = 'https://ipfs.infura.io/ipfs/' + String(cid);
  
    let data = JSON.stringify(fileJson);
    fs.writeFileSync(jsonPath, data);
  
    console.log('Uploaded file', cid);
  };
  
  this.ipfsUploadMany = async function(low, high) {
    for(let i=low; i<=high; i++) {
      console.log('Uploading image', i);
      await this.ipfsUploadOne(i);
    }
  };
  
  this.ipfsUploadFolder = async function() {
    const auth = 'Basic ' + Buffer.from(ipfsProjectId + ':' + ipfsProjectSecret).toString('base64')
    const ipfs = await create({
      host: ipfsHost,
      port: ipfsPort,
      protocol: ipfsProtocol,
      headers: {
        authorization: auth
      },
      timeout: '20m'
    });
  
    const path = '../assets/animation_url';
    console.log('Uploading path', path);
    let cid;
    for await (const file of ipfs.addAll(globSource(path, { recursive: true }), { shardSplitThreshold: 11000, wrapWithDirectory: true })) {
      console.log(`${file.path}: ${file.cid}`);
      cid = file.cid;
    }
    return cid;
  }
  
};

module.exports = Generator;
