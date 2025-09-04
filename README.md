# hsa-expense-analyzer-cli

[![ci workflow](https://img.shields.io/github/actions/workflow/status/joshjohanning/hsa-expense-analyzer-cli/ci.yml?logo=github&label=ci%20workflow&color=brightgreen&labelColor=333)][ci]
[![publish workflow](https://img.shields.io/github/actions/workflow/status/joshjohanning/hsa-expense-analyzer-cli/publish.yml?logo=github&label=publish%20workflow&color=brightgreen&labelColor=333)][publish]
[![npm version](https://img.shields.io/npm/v/%40joshjohanning%2Fhsa-expense-analyzer-cli?logo=npm&labelColor=333)][npm]
[![stars](https://img.shields.io/github/stars/joshjohanning/hsa-expense-analyzer-cli?style=flat&logo=github&color=yellow&label=stars%20★&labelColor=333)][stars]

🩺 🧾 📊 A Node.js CLI tool that analyzes HSA expenses and reimbursements by year from a folder of receipt files

![hsa-expense-analyzer-cli sample output](https://josh-ops.com/assets/screenshots/2025-09-04-hsa-expense-analyzer/hsa-expense-analyzer.png)

## File Structure

Expects receipts to be in single folder with the following naming convention:

- Expenses:
`<yyyy-mm-dd> - <description> - $<total>.pdf|png|jpg|whatever`
- Reimbursed expenses:
`<yyyy-mm-dd> - <description> - $<total>.reimbursed.pdf|png|jpg|whatever`

> [!TIP]
> When you receive a reimbursement from your HSA provider, rename the receipt to include `.reimbursed.` before the extension. This will help track which expenses have been reimbursed and which expenses can still be submitted.

Example file structure:

```text
<dirPath>/
├── 2021-01-01 - doctor - $45.00.pdf               # Expense
├── 2021-02-15 - pharmacy - $30.00.reimbursed.pdf  # Reimbursed expense
├── 2022-02-01 - doctor - $50.00.reimbursed.pdf    # Reimbursed expense
├── 2022-03-15 - dentist - $150.00.png             # Expense
├── 2022-11-01 - glasses - $50.00.reimbursed.jpg   # Reimbursed expense
├── 2023-05-01 - doctor - $45.00.pdf               # Expense
├── 2023-06-01 - doctor - $55.00.reimbursed.pdf    # Reimbursed expense
├── 2024-07-15 - doctor - $50.00.pdf               # Expense
└── 2025-01-15 - doctor - $125.00.pdf              # Expense
```

> [!NOTE]
>
> - Any file extension for receipts is fine; only the date and $ amount are used
> - The script detects reimbursements by looking for `.reimbursed.` anywhere in the filename.

## Running

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

Can also run using sample data to test functionality:

```bash
npm run test
```

## Example Output

```text
2021:
  expenses:       $75.00
  reimbursements: $30.00
  receipts:       2
2022:
  expenses:       $250.00
  reimbursements: $100.00
  receipts:       3
2023:
  expenses:       $100.00
  reimbursements: $55.00
  receipts:       2
2024:
  expenses:       $50.00
  reimbursements: $0.00
  receipts:       1
2025:
  expenses:       $125.00
  reimbursements: $0.00
  receipts:       1
Total: 
  expenses:       $600.00
  reimbursements: $185.00
  receipts:       9

Expenses by year
2021 ╢██████░░░░░░░░░░░░░░ $75.00
2022 ╢████████████████████ $250.00
2023 ╢████████░░░░░░░░░░░░ $100.00
2024 ╢████░░░░░░░░░░░░░░░░ $50.00
2025 ╢██████████░░░░░░░░░░ $125.00
     ╚════════════════════

Reimbursements by year
2021 ╢██████░░░░░░░░░░░░░░ $30.00
2022 ╢████████████████████ $100.00
2023 ╢███████████░░░░░░░░░ $55.00
2024 ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2025 ╢░░░░░░░░░░░░░░░░░░░░ $0.00
     ╚════════════════════

Expenses vs Reimbursements by year
2021 Expenses       ╢██████░░░░░░░░░░░░░░ $75.00
2021 Reimbursements ╢██░░░░░░░░░░░░░░░░░░ $30.00
2022 Expenses       ╢████████████████████ $250.00
2022 Reimbursements ╢████████░░░░░░░░░░░░ $100.00
2023 Expenses       ╢████████░░░░░░░░░░░░ $100.00
2023 Reimbursements ╢████░░░░░░░░░░░░░░░░ $55.00
2024 Expenses       ╢████░░░░░░░░░░░░░░░░ $50.00
2024 Reimbursements ╢░░░░░░░░░░░░░░░░░░░░ $0.00
2025 Expenses       ╢██████████░░░░░░░░░░ $125.00
2025 Reimbursements ╢░░░░░░░░░░░░░░░░░░░░ $0.00
                    ╚════════════════════
```

[ci]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/actions/workflows/ci.yml
[publish]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/actions/workflows/publish.yml
[npm]: https://www.npmjs.com/package/@joshjohanning/hsa-expense-analyzer-cli
[stars]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/stargazers
