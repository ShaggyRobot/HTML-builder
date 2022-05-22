const path = require('path');
const fs = require('fs');
const readline = require('readline');

process.on('SIGINT', () => {
  console.log('\nExiting process.');
  process.exit(0);
});

const rl = readline.createInterface(process.stdin);
const ws = fs.createWriteStream(path.resolve(__dirname, 'output.txt'), { flags: 'a' });

ws.on('open', () => {
  console.log(`Awaiting for input.\nWriting to ${ws.path}`);
});

rl.on('line', (l) => {
  if (l === 'exit') process.emit('SIGINT');
  ws.write(`${l}\n`);
});
