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

### Install from npm

The easiest way is to install as a global package from [npm](https://www.npmjs.com/package/@joshjohanning/hsa-expense-analyzer-cli) and run it:

```bash
npm install -g @joshjohanning/hsa-expense-analyzer-cli
hsa-expense-analyzer-cli --dirPath="/path/to/your/receipts"
```

### Local Development

Or if you want to clone locally and hack on the code:

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

You can also run locally using sample data to test the functionality:

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

If you have files that don't match the expected naming pattern, you'll see a warning at the top of the output:

```text
⚠️  WARNING: The following files do not match the expected pattern:
Expected pattern: <yyyy-mm-dd> - <description> - $<amount>.<ext>

Filename                                                         Error
--------                                                         -----
2021-01-10 - doctor-incorrect-amount - $50,00.pdf                Amount "$50,00.pdf" should be a valid format like $50.00
2021-01-10 - doctor-incorrect-amount - $50.pdf                   Amount "$50.pdf" should be a valid format like $50.00
2021-01-15 - doctor-missing-dollar-sign - 50.00.pdf              Amount "50.00.pdf" should start with $
2021-01-25 - doctor-no-extension - $50.00                        File is missing extension (should end with .pdf, .jpg, etc.)
2021-01-30 - doctor-missing-amount.pdf                                  File name should have format "yyyy-mm-dd - description - $amount.ext"
2021-01-30- doctor-missing-space-after-dash - $50.00.pdf         File name should have format "yyyy-mm-dd - description - $amount.ext"
2021-1-25 - doctor-wrong-date-format - $50.00.pdf                Date "2021-1-25" should be yyyy-mm-dd format
2021-25-01 - doctor-wrong-date-format - $50.00.pdf               Date "2021-25-01" should be yyyy-mm-dd format
doctor-missing-date - $120.00.pdf                                File name should have format "yyyy-mm-dd - description - $amount.ext"
```

[ci]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/actions/workflows/ci.yml
[publish]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/actions/workflows/publish.yml
[npm]: https://www.npmjs.com/package/@joshjohanning/hsa-expense-analyzer-cli
[stars]: https://github.com/joshjohanning/hsa-expense-analyzer-cli/stargazers
