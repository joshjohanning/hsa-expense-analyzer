# hsa-expense-analyzer

🩺 🧾 📊 Analyzes HSA expense totals by year from a folder of receipts.

<img src="https://github.com/user-attachments/assets/9fff5263-ddc7-4bc3-a1ca-e7e2c8d04f9f" alt="hsa-expense-analyzer example results" width="75%">

## File Structure

Expects files to be in single folder with the following naming convention:

For expenses:
`<yyyy-mm-dd> - <description> - $<total>.pdf|png|jpg|whatever`

For reimbursements:
`<yyyy-mm-dd> - <description> - $<total>.reimbursement.pdf|png|jpg|whatever`

Example:

```text
<dirPath>/
├── 2021-01-01 - doctor - $45.00.pdf                              # Expense
├── 2021-02-15 - doctor reimbursement - $45.00.reimbursement.pdf  # Reimbursement
├── 2022-02-01 - doctor - $75.00.png                              # Expense
├── 2022-02-02 - pharmacy - $75.00.pdf                            # Expense
└── 2022-03-15 - hsa withdrawal - $150.00.reimbursement.pdf       # Reimbursement
```

> [!NOTE]  
> Any file extension for receipts is fine; only the date and $ amount are used
> The script detects reimbursements by looking for `.reimbursement.` anywhere in the filename.

## Running

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

## Example Output

```text
2021:
  expenses:      $45.00
  reimbursement: $30.00
  receipts:      2
2022:
  expenses:      $150.00
  reimbursement: $100.00
  receipts:      3
2023:
  expenses:      $90.00
  reimbursement: $0.00
  receipts:      2
2024:
  expenses:      $50.00
  reimbursement: $0.00
  receipts:      1

Expenses by year
2021 ╢██████░░░░░░░░░░░░░░ 45.00
2022 ╢████████████████████ 150.00

Reimbursements by year
2021 ╢██████░░░░░░░░░░░░░░ 30.00
2022 ╢████████████████████ 100.00

Comparison by year:
2021 Expenses       ╢██████░░░░░░░░░░░░░░ 45.00
2021 Reimbursements ╢████░░░░░░░░░░░░░░░░ 30.00
2022 Expenses       ╢████████████████████ 150.00
2022 Reimbursements ╢███████████████░░░░░ 100.00
```
