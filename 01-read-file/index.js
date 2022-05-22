const fs = require('fs');
const path = require('path');

const pathToFile = path.resolve(__dirname, 'text.txt');

const rs = fs.createReadStream(pathToFile);

rs.on('error', (e) => {
  console.log(e.message);
});

rs.on('open', () => {
  rs.pipe(process.stdout);
});

