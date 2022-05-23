const { readdir } = require('fs/promises');
const fs = require('fs');
const path = require('path');

const sourceDirectory = path.resolve(__dirname, 'styles');
const targetFile = path.resolve(__dirname, 'project-dist', 'bundle.css');

async function mergeFiles(ext, srcDir, trgFile) {
  let directoryContents;
  try {
    directoryContents = await readdir(srcDir, { withFileTypes: true });
  } catch (error) {
    console.log(error.message);
    return;
  }
  const ws = fs.createWriteStream(trgFile);
  for (let entry of directoryContents) {
    [entry.fileName, entry.ext] = entry.name.split('.');
    if (entry.isFile() && entry.ext === ext) {
      const rs = fs.createReadStream(path.resolve(srcDir, entry.name));
      rs.pipe(ws, { end: false });
      await new Promise((resolve) => rs.on('end', resolve));
      ws.write('\n');
    }
  }
}

mergeFiles('css', sourceDirectory, targetFile);
