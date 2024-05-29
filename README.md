# hsa-expense-analyzer

Analyzes HSA expense totals by year from a folder of receipts.

## File Structure

Expects files to be in single folder with the following naming convention: `<yyyy-mm-dd> - <description> - $<total>.ext`

Example:

```text
<dirPath>/
├── 2021-01-01 - doctor - $45.00.pdf
├── 2022-02-01 - doctor - $75.00.pdf
├── 2022-02-02 - doctor - $75.00.pdf
├── 2023-03-01 - doctor - $45.00.pdf
├── 2023-03-02 - doctor - $45.00.pdf
└── 2024-04-01 - doctor - $50.00.pdf
```

> [!NOTE]  
> File extension is not important; only the date and $ amount are used

## Running

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

## Example Output

```text
2021:
  total:    $75.00
  receipts: 1
2022:
  total:    $150
  receipts: 2
2023:
  total:    $90.00
  receipts: 2
2024:
  total:    $50.00
  receipts: 1
```
