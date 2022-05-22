const { readdir, mkdir, rm, access } = require('fs/promises');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const targetDir = path.resolve(__dirname, 'project-dist');
const assetsDir = path.resolve(__dirname, 'assets');
const componentsDir = path.resolve(__dirname, 'components');
const stylesDir = path.resolve(__dirname, 'styles');
const templateFile = path.resolve(__dirname, 'template.html');

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
      copyDir(path.resolve(src, entry.name), path.resolve(trg, entry.name));
    } else {
      fs.createReadStream(path.resolve(src, entry.name)).pipe(
        fs.createWriteStream(path.resolve(trg, entry.name))
      );
    }
  });
}

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
    if (entry.ext === ext) {
      const rs = fs.createReadStream(path.resolve(srcDir, entry.name));
      rs.pipe(ws, { end: false });
      await new Promise((resolve) => rs.on('end', resolve));
      ws.write('\n');
    }
  }
}

(async () => {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir);
  await copyDir(assetsDir, path.resolve(targetDir, 'assets'));
  await mergeFiles('css', stylesDir, path.resolve(targetDir, 'style.css'));

  const templateRs = fs.createReadStream(templateFile);
  const targetWs = fs.createWriteStream(path.resolve(targetDir, 'index.html'));
  const rl = readline.createInterface(templateRs);

  for await (const line of rl) {
    if (line.trim().startsWith('{{') && line.trim().endsWith('}}')) {
      const filename = `${line.trim().slice(2, -2)}.html`;
      let componentRs;
      try {
        await access(path.resolve(componentsDir, filename), fs.constants.R_OK);
        componentRs = fs.createReadStream(path.resolve(componentsDir, filename));
      } catch (error) {
        console.log(`Skipping nonexistent HTML component ${line.trim()}`);
        console.error(error.message);
        continue;
      }
      componentRs.pipe(targetWs, { end: false });
      await new Promise((resolve) => componentRs.on('end', resolve));
      targetWs.write('\n');
    } else {
      targetWs.write(line + '\n');
    }
  }
})();
