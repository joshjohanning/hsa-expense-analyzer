import { calculateSummaryStats } from '../src/main.js';

describe('calculateSummaryStats', () => {
  test('should calculate summary statistics correctly', () => {
    const years = ['2021', '2022'];
    const expensesByYear = { 2021: 100.0, 2022: 200.0 };
    const reimbursementsByYear = { 2021: 50.0, 2022: 100.0 };
    const receiptCounts = { 2021: 2, 2022: 3 };
    const invalidFiles = [{ fileName: 'bad.txt', error: 'Invalid' }];

    const stats = calculateSummaryStats(years, expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles);

    expect(stats.totalFiles).toBe(6); // 5 valid + 1 invalid
    expect(stats.totalValidFiles).toBe(5);
    expect(stats.totalInvalidFiles).toBe(1);
    expect(stats.invalidFilePercentage).toBe('16.7');
    expect(stats.totalExpenses).toBe(300.0);
    expect(stats.totalReimbursements).toBe(150.0);
    expect(stats.totalReimburseable).toBe(150.0);
    expect(stats.reimbursementRate).toBe('50.0');
    expect(stats.reimburseableRate).toBe('50.0');
    expect(stats.avgExpensePerYear).toBe('150.00');
    expect(stats.avgReceiptsPerYear).toBe(3); // Round 2.5 to 3
    expect(stats.mostExpensiveYear).toBe('2022');
    expect(stats.mostExpensiveYearAmount).toBe(200.0);
    expect(stats.mostExpensiveYearReceipts).toBe(3);
    expect(stats.expensePercentage).toBe('66.7');
    expect(stats.receiptPercentage).toBe('60.0');
  });

  test('should handle empty years array', () => {
    const years = [];
    const expensesByYear = {};
    const reimbursementsByYear = {};
    const receiptCounts = {};
    const invalidFiles = [];

    const stats = calculateSummaryStats(years, expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles);

    expect(stats.totalFiles).toBe(0);
    expect(stats.totalExpenses).toBe(0);
    expect(stats.avgExpensePerYear).toBe(0); // Returns number 0, not string "0.00"
    expect(stats.avgReceiptsPerYear).toBe(0);
    expect(stats.mostExpensiveYear).toBeNull();
  });

  test('should handle single year', () => {
    const years = ['2023'];
    const expensesByYear = { 2023: 500.0 };
    const reimbursementsByYear = { 2023: 0 };
    const receiptCounts = { 2023: 10 };
    const invalidFiles = [];

    const stats = calculateSummaryStats(years, expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles);

    expect(stats.totalExpenses).toBe(500.0);
    expect(stats.totalReimbursements).toBe(0);
    expect(stats.reimbursementRate).toBe('0.0');
    expect(stats.avgExpensePerYear).toBe('500.00');
    expect(stats.mostExpensiveYear).toBe('2023');
    expect(stats.expensePercentage).toBe('100.0');
  });

  test('should calculate percentages correctly when totals are zero', () => {
    const years = ['2024'];
    const expensesByYear = { 2024: 0 };
    const reimbursementsByYear = { 2024: 0 };
    const receiptCounts = { 2024: 0 };
    const invalidFiles = [];

    const stats = calculateSummaryStats(years, expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles);

    expect(stats.reimbursementRate).toBe(0); // Returns number 0
    expect(stats.reimburseableRate).toBe(0); // Returns number 0
    expect(stats.expensePercentage).toBe(0); // Returns number 0
  });

  test('should round average receipts per year correctly', () => {
    const years = ['2020', '2021', '2022'];
    const expensesByYear = { 2020: 100, 2021: 100, 2022: 100 };
    const reimbursementsByYear = { 2020: 0, 2021: 0, 2022: 0 };
    const receiptCounts = { 2020: 1, 2021: 1, 2022: 1 };
    const invalidFiles = [];

    const stats = calculateSummaryStats(years, expensesByYear, reimbursementsByYear, receiptCounts, invalidFiles);

    expect(stats.avgReceiptsPerYear).toBe(1); // 3 receipts / 3 years = 1
  });
});
