const readline = require('readline');
const mysql = require('mysql');
const fs = require("fs");

if(!fs.existsSync("config.js")) {
  fs.writeFileSync("config.js", "module.exports = {\n\tdatabase: {\n\t\thost: '',\n\t\t\tuser: '',\n\t\t\tpassword: '',\n\t\t\tpassword: ''\n\t}\n};\n");
  console.log("Config file created. Please fill with data and restart.");
  process.exit();
}

const max = 50;

const clear = () => process.stdout.write("\x1B[2J");
clear();

const connection = mysql.createConnection(require("./config").database);
 
connection.connect();

const start = (map) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const cache = map;
  cache[Symbol.iterator] = function* () {
    yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
  }

  const check = (line = "") => {
    console.log(line);
    let result, type;
    for(let t of ["CNAME", "A", "AAAA", "CNAME?", "A?", "AAAA?"])
      if (line.includes(` ${t} `)) {
        result = line.split(` ${t} `)[1].split(" ")[0];
        type = t;
      }
    if(result) {
      result = result.replace(/\,*$/gi, "").replace(/\.*$/, "");
      if (cache.has(result = result.toLowerCase())){
        cache.set(result, cache.get(result) + 1);
      } else {
        cache.set(result, 1);
      }
    }
    clear();
    let i = 0;
    for(let [domain, amount] of cache) {
      if(i++ === max) break;
      console.log("Platz %s:\t%s Aufruf(e)\t%s", i, amount, domain)
    }
  };

  rl.on('line', check);
  check();

  const loop = () => {
    console.log("Writing to database...");
    connection.query('SELECT * FROM traffic', null, (error, results) => {
      for(let domain of Array.from(cache.keys())) {
        if(results.filter(r => r.domain === domain).length > 0)
          connection.query(`UPDATE traffic SET amount = ${cache.get(domain)} WHERE domain LIKE '${domain}'`);
        else
          connection.query(`INSERT INTO traffic (domain, amount) VALUES ('${domain}', 1)`);
      }
    })
    setTimeout(loop, 10000);
  }
  setTimeout(loop, 10000);
}

process.on('beforeExit', (code) => {
  connection.end();
});


connection.query('SELECT * FROM traffic', null, (error, results) => {
  const map = new Map();
  if(error) console.log(error);
  else results.forEach(element => {
    map.set(element.domain, element.amount);
  });
  start(map);
});
