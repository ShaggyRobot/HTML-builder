const { readdir, stat } = require('fs');
const path = require('path');

const pathToSecret = path.resolve(__dirname, 'secret-folder');

readdir(pathToSecret, { withFileTypes: true }, (err, data) => {
  if (err) {
    console.log(err.message);
    return;
  }

  data.forEach((entry) => {
    if (entry.isFile()) {
      stat(path.resolve(__dirname, 'secret-folder', entry.name), (err, stat) => {
        if (err) {
          console.log(err);
          return;
        }

        const [fileName, fileExt] = entry.name.split('.');
        const fileSize = (stat.size / 1024).toFixed(3) + 'kb';
        console.log(`${fileName} - ${fileExt} - ${fileSize}`);
      });
    }
  });
});
