const fs = require("fs");
const path = require("path");
const prettyjson = require("prettyjson");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).option("dirPath", {
  type: "string",
  demandOption: true,
  describe: "The directory path",
}).argv;

const dirPath = argv.dirPath;

function parseFileName(fileName) {
  const parts = fileName.split(" - ");
  if (parts.length !== 3) {
    console.error(`File does not match expected format: ${fileName}`);
    return { year: null, amount: 0 };
  }

  const date = parts[0];
  const amountPart = parts[2];
  let amount = 0;
  if (amountPart && !isNaN(parseFloat(amountPart.substring(1)))) {
    amount = parseFloat(amountPart.substring(1));
  }
  const year = date.split("-")[0];

  return { year, amount };
}

function getTotalsByYear(dirPath) {
  const totalsByYear = {};
  const receiptCounts = {};
  const fileNames = fs.readdirSync(dirPath);

  fileNames.forEach((fileName) => {
    if (fileName.startsWith(".")) {
      return;
    }

    const { year, amount } = parseFileName(fileName);
    if (amount > 0) {
      if (totalsByYear[year]) {
        totalsByYear[year] = +(totalsByYear[year] + amount).toFixed(2);
        receiptCounts[year]++;
      } else {
        totalsByYear[year] = amount;
        receiptCounts[year] = 1;
      }
    }
  });

  return { totalsByYear, receiptCounts };
}

const { totalsByYear, receiptCounts } = getTotalsByYear(dirPath);

const result = {};

for (const year in totalsByYear) {
  result[year] = {
    total: `$${totalsByYear[year].toFixed(2)}`,
    receipts: receiptCounts[year],
  };
}

console.log(prettyjson.render(result));
