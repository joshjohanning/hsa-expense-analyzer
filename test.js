#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Expected test results - update these if test data changes
const EXPECTED_INVALID_FILES = 16;
const EXPECTED_TOTAL_EXPENSES = '600.00';
const EXPECTED_TOTAL_REIMBURSEMENTS = '185.00';
const EXPECTED_TOTAL_RECEIPTS = '9';

console.log('Running hsa-expense-analyzer-cli tests...\n');

try {
  // Run the main script on test-data directory and capture output
  const output = execSync('node main.js --dirPath=test-data/ --no-color', { 
    encoding: 'utf8',
    cwd: __dirname 
  });
  
  // Show the full normal output
  console.log(output);
  
  // Count the number of invalid files by looking for lines in the error table
  const lines = output.split('\n');
  let inErrorSection = false;
  let errorCount = 0;
  let foundHeaderLine = false;
  
  // Also extract total amounts for validation - simple string search approach
  const outputText = output.replace(/\x1b\[[0-9;]*m/g, ''); // Strip ANSI codes
  
  // Look for the exact expected totals in the cleaned output
  const totalExpenses = outputText.includes(`expenses:       $${EXPECTED_TOTAL_EXPENSES}`) ? EXPECTED_TOTAL_EXPENSES : null;
  const totalReimbursements = outputText.includes(`reimbursements: $${EXPECTED_TOTAL_REIMBURSEMENTS}`) ? EXPECTED_TOTAL_REIMBURSEMENTS : null;
  const totalReceipts = outputText.includes(`receipts:       ${EXPECTED_TOTAL_RECEIPTS}`) ? EXPECTED_TOTAL_RECEIPTS : null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip ANSI color codes for easier parsing
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
    
    if (cleanLine.includes('⚠️  WARNING: The following files do not match the expected pattern')) {
      inErrorSection = true;
      continue;
    }
    
    if (inErrorSection && cleanLine.includes('Filename') && cleanLine.includes('Error')) {
      foundHeaderLine = true;
      continue;
    }
    
    if (inErrorSection && cleanLine.includes('--------') && cleanLine.includes('-----')) {
      continue; // Skip the separator line
    }
    
    if (inErrorSection && foundHeaderLine && cleanLine.trim() === '') {
      break; // End of error section
    }
    
    if (inErrorSection && foundHeaderLine && cleanLine.trim() !== '' && !cleanLine.includes('Filename') && !cleanLine.includes('--------')) {
      errorCount++;
    }
  }
  
  // Test validation at the end
  console.log('='.repeat(80));
  console.log('TEST VALIDATION:');
  
  let testsPassed = 0;
  let testsTotal = 4;
  
  // Check invalid file count
  if (errorCount === EXPECTED_INVALID_FILES) {
    console.log(`✅ Found exactly ${EXPECTED_INVALID_FILES} invalid files as expected`);
    testsPassed++;
  } else {
    console.log(`❌ Expected ${EXPECTED_INVALID_FILES} invalid files, but found ${errorCount}`);
  }
  
  // Check total expenses
  if (totalExpenses === EXPECTED_TOTAL_EXPENSES) {
    console.log(`✅ Total expenses match expected: $${totalExpenses}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total expenses $${EXPECTED_TOTAL_EXPENSES}, but found $${totalExpenses}`);
  }
  
  // Check total reimbursements
  if (totalReimbursements === EXPECTED_TOTAL_REIMBURSEMENTS) {
    console.log(`✅ Total reimbursements match expected: $${totalReimbursements}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total reimbursements $${EXPECTED_TOTAL_REIMBURSEMENTS}, but found $${totalReimbursements}`);
  }
  
  // Check total receipts
  if (totalReceipts === EXPECTED_TOTAL_RECEIPTS) {
    console.log(`✅ Total receipts match expected: ${totalReceipts}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total receipts ${EXPECTED_TOTAL_RECEIPTS}, but found ${totalReceipts}`);
  }
  
  console.log(`\nTest Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ TEST FAILED: Error running the script');
  console.error(error.message);
  process.exit(1);
}
