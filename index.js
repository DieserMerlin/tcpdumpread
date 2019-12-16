const readline = require('readline');

const max = 50;

const clear = () => process.stdout.write("\x1B[2J");
clear();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const cache = new Map();
cache[Symbol.iterator] = function* () {
  yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
}

const check = (line = "") => {
  console.log(line);
  let result;
  if (line.includes(" A? "))
    result = line.split(" A? ")[1].split(" ")[0];
  else if (line.includes(" AAAA? "))
    result = line.split(" AAAA? ")[1].split(" ")[0];
  else if (line.includes(" CNAME "))
    result = line.split(" CNAME ")[1].split(" ")[0];
  if(result) {
    result = result.replace(/\,*$/gi, "").replace(/\.*$/, "");
    if (cache.has(result = result.toLowerCase())) cache.set(result, cache.get(result) + 1);
    else cache.set(result, 1);
  }
  clear();
  let i = 0;
  for(let [domain, amount] of cache) {
    if(i++ === max) break;
    console.log("Platz %s:\t%s Aufruf(e)\t%s", i, amount, domain)
  }
  return;
  for(let j=i;j<10;j++) {
    console.log("0:\tKeine Seite")
  }
};

rl.on('line', check);
check();
