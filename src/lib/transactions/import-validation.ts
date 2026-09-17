export type CsvRow = {
  date?: string;
  type?: string;
  description?: string;
  category?: string;
  account?: string;
  amount?: string;
  notes?: string;
};

export type PreviewRow = {
  rowNumber: number;
  date: string;
  type: string;
  description: string;
  category: string;
  account: string;
  amount: string;
  notes: string;
  errors: string[];
};

export const requiredImportHeaders = [
  "date",
  "type",
  "description",
  "category",
  "account",
  "amount",
];

export function isValidImportDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function validateImportRow(
  row: CsvRow,
  index: number,
): PreviewRow {
  const errors: string[] = [];

  const date = row.date?.trim() ?? "";
  const type = row.type?.trim().toLowerCase() ?? "";
  const description = row.description?.trim() ?? "";
  const category = row.category?.trim() ?? "";
  const account = row.account?.trim() ?? "";
  const amount = row.amount?.trim() ?? "";
  const notes = row.notes?.trim() ?? "";

  if (!isValidImportDate(date)) {
    errors.push("Date must use a valid YYYY-MM-DD value.");
  }

  if (type !== "income" && type !== "expense") {
    errors.push('Type must be either "income" or "expense".');
  }

  if (!description) {
    errors.push("Description is required.");
  }

  if (!category) {
    errors.push("Category is required.");
  }

  if (!account) {
    errors.push("Account is required.");
  }

  const parsedAmount = Number(amount);

  if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be greater than zero.");
  }

  return {
    rowNumber: index + 2,
    date,
    type,
    description,
    category,
    account,
    amount,
    notes,
    errors,
  };
}