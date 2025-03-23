const fs = require("fs");
const path = require("path");
const prettyjson = require("prettyjson");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chartscii = require("chartscii");

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
    return { year: null, amount: 0, isReimbursement: false };
  }

  const date = parts[0];
  const amountPart = parts[2];
  let amount = 0;
  if (amountPart && !isNaN(parseFloat(amountPart.substring(1)))) {
    amount = parseFloat(amountPart.substring(1));
  }
  const year = date.split("-")[0];
  
  // Check if this is a reimbursement
  const isReimbursement = fileName.includes('.reimbursed.');
  
  return { year, amount, isReimbursement };
}

function getTotalsByYear(dirPath) {
  const expensesByYear = {};
  const reimbursementsByYear = {};
  const receiptCounts = {};
  const fileNames = fs.readdirSync(dirPath);

  fileNames.forEach((fileName) => {
    if (fileName.startsWith(".")) {
      return;
    }

    const { year, amount, isReimbursement } = parseFileName(fileName);
    if (amount > 0) {
      // Initialize year data if not exists
      if (!expensesByYear[year]) {
        expensesByYear[year] = 0;
        reimbursementsByYear[year] = 0;
        receiptCounts[year] = 0;
      }
      
      // Always count as an expense regardless of reimbursement status
      expensesByYear[year] = +(expensesByYear[year] + amount).toFixed(2);
      
      // Additionally track as reimbursement if applicable
      if (isReimbursement) {
        reimbursementsByYear[year] = +(reimbursementsByYear[year] + amount).toFixed(2);
      }
      
      receiptCounts[year]++;
    }
  });

  return { expensesByYear, reimbursementsByYear, receiptCounts };
}

const { expensesByYear, reimbursementsByYear, receiptCounts } = getTotalsByYear(dirPath);

const result = {};
const years = [...new Set([...Object.keys(expensesByYear), ...Object.keys(reimbursementsByYear)])].sort();

for (const year of years) {
  result[year] = {
    expenses: `$${(expensesByYear[year] || 0).toFixed(2)}`,
    reimbursements: `$${(reimbursementsByYear[year] || 0).toFixed(2)}`,
    receipts: receiptCounts[year],
  };
}

console.log(prettyjson.render(result));
console.log();

// Create data arrays for charts
const expenseData = [];
const reimbursementData = [];
const combinedData = [];

for (const year of years) {
  const expenseAmount = expensesByYear[year] || 0;
  const reimbursementAmount = reimbursementsByYear[year] || 0;
  
  expenseData.push({
    label: year,
    value: expenseAmount,
  });
  
  reimbursementData.push({
    label: year,
    value: reimbursementAmount,
  });
  
  // For combined chart
  combinedData.push({
    label: `${year} Exp`,
    value: expenseAmount,
  });
  
  combinedData.push({
    label: `${year} Rei`,
    value: reimbursementAmount,
  });
}

const chart = new chartscii(expenseData, {
  width: 20,
  height: years.length,
  title: "Expenses by year",
  fill: "░",
  valueLabels: true,
  valueLabelsPrefix: "$",
  valueLabelsDecimalPlaces: 2
});

const reimbursementChart = new chartscii(reimbursementData, {
  width: 20,
  height: years.length,
  title: "Reimbursements by year", 
  fill: "░",
  valueLabels: true,
  valueLabelsPrefix: "$",
  valueLabelsDecimalPlaces: 2
});

console.log(chart.create());
console.log();
console.log(reimbursementChart.create());
console.log();

// Create a manual comparison chart
console.log("Comparison by year:");
const maxValue = Math.max(
  ...Object.values(expensesByYear),
  ...Object.values(reimbursementsByYear)
);

for (const year of years) {
  const expenseAmount = expensesByYear[year] || 0;
  const reimbursementAmount = reimbursementsByYear[year] || 0;
  
  const expenseBarLength = Math.floor((expenseAmount / maxValue) * 20);
  const reimbursementBarLength = Math.floor((reimbursementAmount / maxValue) * 20);
  
  const expenseBar = "█".repeat(expenseBarLength) + "░".repeat(20 - expenseBarLength);
  const reimbursementBar = "█".repeat(reimbursementBarLength) + "░".repeat(20 - reimbursementBarLength);
  
  console.log(`${year} Expenses       ╢${expenseBar} $${expenseAmount.toFixed(2)}`);
  console.log(`${year} Reimbursements ╢${reimbursementBar} $${reimbursementAmount.toFixed(2)}`);}

console.log("                    ╚════════════════════");
