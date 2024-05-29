# hsa-expense-analyzer

Analyzes HSA expense totals by year from a folder of receipts.

## File format

Expects files to be in single folder with this format

```text
2024-01-01 - doctor - $50.00.pdf
2023-01-01 - doctor - $45.00.pdf
2023-01-02 - doctor - $45.00.pdf
```

Notes:

- File extension is not important; only the date and $ amount are used
- My receipts are all in the same folder

## Running

```bash
npm install
npm run start -- --dirPath="/path/to/receipts"
```

## Example Output

```text
2023: 
  total:    $90.00
  receipts: 2
2024: 
  total:    $50.00
  receipts: 1
```
