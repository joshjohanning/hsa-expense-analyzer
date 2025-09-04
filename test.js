#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Running hsa-expense-analyzer-cli tests...\n');

try {
  // Run the main script on test-data directory and capture output
  const output = execSync('node main.js --dirPath=test-data/', { 
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
  const totalExpenses = outputText.includes('expenses:       $600.00') ? '600.00' : null;
  const totalReimbursements = outputText.includes('reimbursements: $185.00') ? '185.00' : null;
  const totalReceipts = outputText.includes('receipts:       9') ? '9' : null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip ANSI color codes for easier parsing
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
    
    if (cleanLine.includes('⚠️  WARNING: The following files do not match the expected pattern:')) {
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
  if (errorCount === 15) {
    console.log(`✅ Found exactly 15 invalid files as expected`);
    testsPassed++;
  } else {
    console.log(`❌ Expected 15 invalid files, but found ${errorCount}`);
  }
  
  // Check total expenses
  if (totalExpenses === '600.00') {
    console.log(`✅ Total expenses match expected: $${totalExpenses}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total expenses $600.00, but found $${totalExpenses}`);
  }
  
  // Check total reimbursements
  if (totalReimbursements === '185.00') {
    console.log(`✅ Total reimbursements match expected: $${totalReimbursements}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total reimbursements $185.00, but found $${totalReimbursements}`);
  }
  
  // Check total receipts
  if (totalReceipts === '9') {
    console.log(`✅ Total receipts match expected: ${totalReceipts}`);
    testsPassed++;
  } else {
    console.log(`❌ Expected total receipts 9, but found ${totalReceipts}`);
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
