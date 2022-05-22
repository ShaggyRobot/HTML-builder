const { readdir, mkdir, rm } = require('fs/promises');
const fs = require('fs');
const path = require('path');

const pathToSource = path.resolve(__dirname, 'files');
const pathToTarget = path.resolve(__dirname, 'files-copy');

async function copyDir(src, trg) {
  let directoryContents;
  try {
    directoryContents = await readdir(src, { withFileTypes: true });
  } catch (error) {
    console.log(error.message);
    return;
  }
  await rm(trg, { recursive: true, force: true });
  await mkdir(trg, { recursive: true });

  directoryContents.forEach((entry) => {
    if (entry.isDirectory()) {
      const recurSrc = path.resolve(src, entry.name);
      const recurTrg = path.resolve(trg, entry.name);
      copyDir(recurSrc, recurTrg);
    } else {
      const rs = fs.createReadStream(path.resolve(src, entry.name));
      const ws = fs.createWriteStream(path.resolve(trg, entry.name));
      rs.pipe(ws);
    }
  });
}


copyDir(pathToSource, pathToTarget);
