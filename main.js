#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const prettyjson = require("prettyjson");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chartscii = require("chartscii");

const argv = yargs(hideBin(process.argv))
  .scriptName("hsa-expense-analyzer-cli")
  .version(require('./package.json').version)
  .usage("A Node.js CLI tool that analyzes HSA expenses and reimbursements by year from receipt files. 📊\n")
  .usage("Usage: $0 --dirPath <path>")
  .option("dirPath", {
    alias: "d", 
    type: "string",
    demandOption: true,
    describe: "The directory path containing receipt files",
  })
  .epilogue(`Expected file format:
  <yyyy-mm-dd> - <description> - $<amount>.<ext>
  <yyyy-mm-dd> - <description> - $<amount>.reimbursed.<ext>`)
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .wrap(100)
  .argv;

// support ~ for home directory
const dirPath = path.resolve(argv.dirPath.replace(/^~/, require('os').homedir()));

function parseFileName(fileName) {
  const parts = fileName.split(" - ");
  if (parts.length !== 3) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false };
  }

  const date = parts[0];
  const amountPart = parts[2];
  
  // Validate date format (yyyy-mm-dd)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false };
  }
  
  let amount = 0;
  if (amountPart && amountPart.startsWith('$') && !isNaN(parseFloat(amountPart.substring(1)))) {
    amount = parseFloat(amountPart.substring(1));
  } else {
    return { year: null, amount: 0, isReimbursement: false, isValid: false };
  }
  
  const year = date.split("-")[0];
  
  // Check if this is a reimbursement
  const isReimbursement = fileName.includes('.reimbursed.');
  
  return { year, amount, isReimbursement, isValid: true };
}

function getTotalsByYear(dirPath) {
  const expensesByYear = {};
  const reimbursementsByYear = {};
  const receiptCounts = {};
  const invalidFiles = [];
  
  let fileNames;
  try {
    fileNames = fs.readdirSync(dirPath);
  } catch (error) {
    console.error(`❌ Error: Cannot access directory`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  fileNames.forEach((fileName) => {
    if (fileName.startsWith(".")) {
      return;
    }

    const { year, amount, isReimbursement, isValid } = parseFileName(fileName);
    
    if (!isValid) {
      invalidFiles.push(fileName);
      return;
    }
    
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

  return { expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles };
}

const { expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles } = getTotalsByYear(dirPath);

// Display any invalid files
if (invalidFiles.length > 0) {
  console.log("\n⚠️  WARNING: The following files do not match the expected pattern:");
  console.log("Expected pattern: <yyyy-mm-dd> - <description> - $<amount>.<ext>");
  console.log("Files with issues:");
  invalidFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log("\n");
}

const result = {};
const years = [...new Set([...Object.keys(expensesByYear), ...Object.keys(reimbursementsByYear)])].sort();

// Calculate totals
let totalExpenses = 0;
let totalReimbursements = 0;
let totalReceipts = 0;

for (const year of years) {
  const yearExpenses = expensesByYear[year] || 0;
  const yearReimbursements = reimbursementsByYear[year] || 0;
  const yearReceipts = receiptCounts[year] || 0;
  
  totalExpenses += yearExpenses;
  totalReimbursements += yearReimbursements;
  totalReceipts += yearReceipts;
  
  result[year] = {
    expenses: `$${yearExpenses.toFixed(2)}`,
    reimbursements: `$${yearReimbursements.toFixed(2)}`,
    receipts: yearReceipts,
  };
}

// Add totals row
result['Total'] = {
  expenses: `$${totalExpenses.toFixed(2)}`,
  reimbursements: `$${totalReimbursements.toFixed(2)}`,
  receipts: totalReceipts,
};

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
  valueLabelsFloatingPoint: 2
});

const reimbursementChart = new chartscii(reimbursementData, {
  width: 20,
  height: years.length,
  title: "Reimbursements by year", 
  fill: "░",
  valueLabels: true,
  valueLabelsPrefix: "$",
  valueLabelsFloatingPoint: 2
});

console.log(chart.create());
console.log();
console.log(reimbursementChart.create());
console.log();

// Create a manual comparison chart
console.log("Expenses vs Reimbursements by year");
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
