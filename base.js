const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const path = require('path');
const REGEX = /"h.*?.*\/css.*?"/; // find stylesheet lol

const findFiles = async (regex, dir) => {
  const cmd = `egrep -rn "${regex.source}" ${dir}`;
  const result = await exec(cmd, { maxBuffer: 1024 * 100000000 });
  return result.stdout
    .split('\n')
    .filter(line => line.length < 10000 && regex.test(line))
    .map(line => {
      const [, path] = line.match(/(\/.*)+?(?=:\d)/);
      const [, , content] = line.split(/:(\d*):/);
      return { content, path };
    });
};

const replaceCSS = (files, regex) => {
  files.forEach(file => {
    const filepath = file.path || file;
    // example of projdir + css '/Users/username/Desktop/sp_proj'
    const projdir = process.argv[3];
    if (typeof projdir !== 'string') {
      throw new Error('Project directory must be written as a string');
    }
    const code = fs.readFileSync(filepath, 'utf8');
    fs.copyFileSync(
      projdir + '/style.css',
      path.dirname(filepath) + '/style.css',
      err => {
        console.log(err);
      }
    );
    fs.unlinkSync(path.dirname(filepath) + '/newEntry.html');
    const newCode = code
      .split('\n')
      .map(c => c.replace(REGEX, `"style.css" type="text/css"`))
      .join('\n');
    fs.writeFile(filepath, newCode, err => {
      if (err) {
        console.log(err);
      }
    });
  });
};

(async () => {
  // example of homedir '/Users/username/Desktop/Articles';
  const filesdir = process.argv[2];
  if (typeof filesdir !== 'string') {
    throw new Error('Article files directory must be written as a string');
  }
  let files = await findFiles(REGEX, filesdir);
  replaceCSS(files, REGEX);
})();
