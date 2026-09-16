export type ImportTransactionInput = {
  date: string;
  type: string;
  description: string;
  category: string;
  account: string;
  amount: string;
  notes: string;
};

export type ImportTransactionsResult = {
  success: boolean;
  message: string;
  importedCount?: number;
};