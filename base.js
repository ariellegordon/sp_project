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
    const code = fs.readFileSync(filepath, 'utf8');
    const newCode = code
      .split('\n')
      .map(c =>
        c.replace(
          REGEX,
          `"Users/ariellegordon/Desktop/Authors/style.css" type="text/css"`
        )
      )
      .join('\n');
    fs.writeFile('newCode.html', newCode, err => {
      if (err) {
        console.log(err);
      }
    });
  });
};

(async () => {
  let files = await findFiles(
    REGEX,
    path.join('/Users/ariellegordon/Desktop', '/Authors')
  );
  replaceCSS(files, REGEX);
})();
