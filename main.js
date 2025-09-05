#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
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
  .option("no-color", {
    type: "boolean",
    default: false,
    describe: "Disable colored output"
  })
  .option("summary-only", {
    type: "boolean",
    default: false,
    describe: "Show only summary statistics"
  })
  .epilogue(`Expected file format:
  <yyyy-mm-dd> - <description> - $<amount>.<ext>
  <yyyy-mm-dd> - <description> - $<amount>.reimbursed.<ext>`)
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .wrap(100)
  .argv;

const dirPath = argv.dirPath;

// Configuration constants
const COLUMN_PADDING = 4; // Extra padding for table columns in file parsing display

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// Helper function for colored output  
function colorize(text, color) {
  if (process.argv.includes('--no-color')) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

function parseFileName(fileName) {
  const parts = fileName.split(" - ");
  if (parts.length !== 3) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `File name should have format "yyyy-mm-dd - description - $amount.ext"` };
  }

  const date = parts[0];
  const amountPart = parts[2];

  // Validate date format (yyyy-mm-dd)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `Date "${date}" should be yyyy-mm-dd format` };
  }

  // Validate that it's actually a valid date
  const dateObj = new Date(date + 'T00:00:00'); // Add time to avoid timezone issues
  const [yearNum, monthNum, dayNum] = date.split('-').map(Number);
  if (dateObj.getFullYear() !== yearNum || dateObj.getMonth() !== monthNum - 1 || dateObj.getDate() !== dayNum) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `Date "${date}" should be yyyy-mm-dd format` };
  }

  // Check if amount starts with $
  if (!amountPart || !amountPart.startsWith('$')) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `Amount "${amountPart}" should start with $` };
  }

  // Check if the filename has a proper file extension (ends with .ext pattern)
  if (!/\.[a-zA-Z7]{2,5}$/.test(amountPart)) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `File is missing extension (should end with .pdf, .jpg, etc.)` };
  }

  // Parse the amount - be more strict about format
  let amountStr = amountPart.substring(1); // Remove the $

  // Handle .reimbursed. files - remove .reimbursed.ext pattern
  if (amountStr.includes('.reimbursed.')) {
    amountStr = amountStr.replace(/\.reimbursed\..+$/, '');
  } else {
    // Remove regular file extension (.pdf, .jpg, etc.)
    amountStr = amountStr.replace(/\.[^.]+$/, '');
  }

  // Check for valid decimal number format (digits with optional .digits, no commas)
  if (!/^\d+\.\d{2}$/.test(amountStr)) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `Amount "${amountPart}" should be a valid format like $50.00` };
  }

  let amount = parseFloat(amountStr);

  if (isNaN(amount)) {
    return { year: null, amount: 0, isReimbursement: false, isValid: false, error: `Amount "${amountPart}" should be a valid number` };
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
    console.error(colorize(`❌ Error: Cannot access directory`, 'red'));
    console.error(colorize(`   ${error.message}`, 'dim'));
    process.exit(1);
  }

  fileNames.forEach((fileName) => {
    if (fileName.startsWith(".")) {
      return;
    }

    const { year, amount, isReimbursement, isValid, error } = parseFileName(fileName);

    if (!isValid) {
      invalidFiles.push({ fileName, error });
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

// Check if no valid files were found
const years = [...new Set([...Object.keys(expensesByYear), ...Object.keys(reimbursementsByYear)])].sort();
if (years.length === 0) {
  console.log(colorize("❌ Error: No valid receipt files found in the specified directory", 'red'));
  console.log(colorize("Expected pattern: <yyyy-mm-dd> - <description> - $<amount>.<ext>", 'dim'));
  process.exit(1);
}

// Display any invalid files
if (invalidFiles.length > 0) {
  // Calculate dynamic padding based on longest filename + buffer
  const maxFileNameLength = Math.max(...invalidFiles.map(f => f.fileName.length));
  // Subtract padding for no-color (compact), add padding for color (spacing)
  const extraPadding = process.argv.includes('--no-color') ? -COLUMN_PADDING - 1 : COLUMN_PADDING;
  const padding = Math.max(maxFileNameLength + extraPadding, 'Filename'.length + extraPadding);

  console.log(colorize("⚠️  WARNING: The following files do not match the expected pattern", 'yellow'));
  console.log(colorize("Expected pattern: <yyyy-mm-dd> - <description> - $<amount>.<ext>", 'dim'));
  console.log(`\n${colorize('Filename', 'cyan').padEnd(padding + colors.cyan.length + colors.reset.length)}${colorize('Error', 'cyan')}`);
  console.log(`${colorize('--------', 'cyan').padEnd(padding + colors.cyan.length + colors.reset.length)}${colorize('-----', 'cyan')}`);
  invalidFiles.forEach(({ fileName, error }) => {
    console.log(`${colorize(fileName, 'yellow').padEnd(padding + colors.yellow.length + colors.reset.length)}${colorize(error, 'red')}`);
  });
  console.log();
}

const result = {};

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

// Show data table and charts unless summary-only mode
if (!argv['summary-only']) {
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
    console.log(`${year} Reimbursements ╢${reimbursementBar} $${reimbursementAmount.toFixed(2)}`);
  }

  console.log("                    ╚════════════════════");
  console.log();
}

// Summary statistics
console.log("📊 Summary Statistics");
console.log("━".repeat(50));

const totalValidFiles = Object.values(receiptCounts).reduce((sum, count) => sum + count, 0);
const totalInvalidFiles = invalidFiles.length;
const totalFiles = totalValidFiles + totalInvalidFiles;
const invalidFilePercentage = totalFiles > 0 ? ((totalInvalidFiles / totalFiles) * 100).toFixed(1) : 0;
const avgExpensePerYear = years.length > 0 ? (totalExpenses / years.length).toFixed(2) : 0;
const avgReceiptsPerYear = years.length > 0 ? Math.round(totalValidFiles / years.length) : 0;
const reimbursementRate = totalExpenses > 0 ? ((totalReimbursements / totalExpenses) * 100).toFixed(1) : 0;
const totalReimburseable = totalExpenses - totalReimbursements; // Money you could still get reimbursed
const reimburseableRate = totalExpenses > 0 ? ((totalReimburseable / totalExpenses) * 100).toFixed(1) : 0;

console.log(`${colorize('Total Receipts Processed:', 'cyan')} ${totalFiles}`);
if (totalInvalidFiles > 0) {
  console.log(`${colorize('Invalid Receipts:', 'yellow')} ${totalInvalidFiles} (${invalidFilePercentage}%)`);
}
console.log(`${colorize('Years Covered:', 'cyan')} ${years.length} (${years[0]} - ${years[years.length - 1]})`);
console.log(`${colorize('Total Expenses:', 'cyan')} $${totalExpenses.toFixed(2)}`);
console.log(`${colorize('Total Reimbursements:', 'cyan')} $${totalReimbursements.toFixed(2)} (${reimbursementRate}%)`);
console.log(`${colorize('Total Reimburseable:', 'green')} $${totalReimburseable.toFixed(2)} (${reimburseableRate}%)`);
console.log(`${colorize('Average Expenses/Year:', 'cyan')} $${avgExpensePerYear}`);
console.log(`${colorize('Average Receipts/Year:', 'cyan')} ${avgReceiptsPerYear}`);

// Find the most expensive year
if (years.length > 0) {
  const mostExpensiveYear = years.reduce((maxYear, year) =>
    (expensesByYear[year] || 0) > (expensesByYear[maxYear] || 0) ? year : maxYear
  );
  const mostExpensiveYearReceipts = receiptCounts[mostExpensiveYear] || 0;
  const mostExpensiveYearAmount = expensesByYear[mostExpensiveYear] || 0;
  const expensePercentage = totalExpenses > 0 ? ((mostExpensiveYearAmount / totalExpenses) * 100).toFixed(1) : 0;
  const receiptPercentage = totalValidFiles > 0 ? ((mostExpensiveYearReceipts / totalValidFiles) * 100).toFixed(1) : 0;
  console.log(`${colorize('Most Expensive Year:', 'cyan')} ${mostExpensiveYear} ($${mostExpensiveYearAmount.toFixed(2)} [${expensePercentage}%], ${mostExpensiveYearReceipts} receipts [${receiptPercentage}%])`);
}
