console.log("\n");

const commands = [
  'choices',
  'ipfs 1',
  'ipfs 1-20',
  'rehash',
  'renumber'
  
];

const command = process.argv[2];

if(!command) {
  console.log('Commands:');
  for(let i=0; i<commands.length; i++) {
    console.log('   ' + commands[i]);
  }
  console.log("\n");
  return;
}

const Generator = require('./Generator.js');
const generator = new Generator();

const runCommand = async function(cmd) {
  switch(cmd) {
    case 'choices':
      let choices = await generator.suitChoices();
      //console.log(choices);
      break;
    case 'rehash':
      await generator.reHash();
      break;
    case 'renumber':
      await generator.reNumber();
      break;
    case 'ipfs':
      const id = process.argv[3];
      if(!id) {
        console.log('Please specify an id to upload.');
        break;
      } else if(id.includes('-')) {
        let parts = id.split('-');
        await generator.ipfsUploadMany(parts[0], parts[1]);
      } else {
        await generator.ipfsUploadOne(parseInt(id));
      }
      break;
  
    default:
      console.log(`Unknown command: ${cmd}`);
      break;
  }
  
  console.log("\n");
};

runCommand(command);

