# hsa-expense-analyzer

🩺 🧾 📊 Analyzes HSA expense totals by year from a folder of receipts.

<img src="https://github.com/user-attachments/assets/825336eb-b9fd-4fe4-ae1b-735d09d4bce1" alt="hsa-expense-analyzer example results" width="75%">

## File Structure

Expects files to be in single folder with the following naming convention:

- Expenses:
`<yyyy-mm-dd> - <description> - $<total>.pdf|png|jpg|whatever`
- Reimbursed expenses:
`<yyyy-mm-dd> - <description> - $<total>.reimbursement.pdf|png|jpg|whatever`

Example:

```text
<dirPath>/
├── 2021-01-01 - doctor - $45.00.pdf                  # Expense
├── 2021-02-15 - pharmacy - $30.00.reimbursement.pdf  # Reimbursement
├── 2022-02-01 - doctor - $50.00.reimbursement.pdf    # Reimbursement
├── 2022-03-15 - dentist - $150.00.png                # Expense
├── 2022-11-01 - glasses - $50.00.reimbursement.jpg   # Reimbursement
├── 2023-05-01 - doctor - $45.00.pdf                  # Expense
├── 2023-06-01 - doctor - $45.00.pdf                  # Expense
├── 2024-07-15 - doctor - $50.00.pdf                  # Expense
└── 2025-01-15 - doctor - $125.00.pdf                 # Expense
```

> [!NOTE]
>
> - Any file extension for receipts is fine; only the date and $ amount are used
> - The script detects reimbursements by looking for `.reimbursement.` anywhere in the filename.

## Running

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

## Example Output

```text
2021:
  expenses:       $45.00
  reimbursements: $30.00
  receipts:       2
2022:
  expenses:       $150.00
  reimbursements: $100.00
  receipts:       3
2023:
  expenses:       $90.00
  reimbursements: $0.00
  receipts:       2
2024:
  expenses:       $50.00
  reimbursements: $0.00
  receipts:       1
2025:
  expenses:       $125.00
  reimbursements: $0.00
  receipts:       1

Expenses by year
2021 ╢██████░░░░░░░░░░░░░░ $45.00
2022 ╢████████████████████ $150.00
2023 ╢████████████░░░░░░░░ $90.00
2024 ╢███████░░░░░░░░░░░░░ $50.00
2025 ╢█████████████████░░░ $125.00
     ╚════════════════════

Reimbursement by year
2021 ╢██████░░░░░░░░░░░░░░ $30.00
2022 ╢████████████████████ $100.00
2023 ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2024 ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2025 ╢░░░░░░░░░░░░░░░░░░░░ $0.00
     ╚════════════════════

Comparison by year:
2021 Expenses       ╢██████░░░░░░░░░░░░░░ $45.00
2021 Reimbursements ╢████░░░░░░░░░░░░░░░░ $30.00
2022 Expenses       ╢████████████████████ $150.00
2022 Reimbursements ╢█████████████░░░░░░░ $100.00
2023 Expenses       ╢████████████░░░░░░░░ $90.00
2023 Reimbursements ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2024 Expenses       ╢██████░░░░░░░░░░░░░░ $50.00
2024 Reimbursements ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2025 Expenses       ╢████████████████░░░░ $125.00
2025 Reimbursements ╢░░░░░░░░░░░░░░░░░░░░ $0.00
                    ╚════════════════════
```
