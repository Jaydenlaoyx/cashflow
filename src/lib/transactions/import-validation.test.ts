import { describe, expect, it } from "vitest";

import {
  isValidImportDate,
  validateImportRow,
} from "@/lib/transactions/import-validation";

describe("isValidImportDate", () => {
  it("accepts a valid ISO date", () => {
    expect(isValidImportDate("2026-09-17")).toBe(true);
  });

  it("rejects a different date format", () => {
    expect(isValidImportDate("17/09/2026")).toBe(false);
  });

  it("rejects an impossible calendar date", () => {
    expect(isValidImportDate("2026-02-31")).toBe(false);
  });

  it("accepts a valid leap-year date", () => {
    expect(isValidImportDate("2024-02-29")).toBe(true);
  });

  it("rejects an invalid leap-year date", () => {
    expect(isValidImportDate("2025-02-29")).toBe(false);
  });
});

describe("validateImportRow", () => {
  it("accepts and normalises a valid expense row", () => {
    const result = validateImportRow(
      {
        date: " 2026-09-17 ",
        type: " Expense ",
        description: " Groceries ",
        category: " Food ",
        account: " Everyday ",
        amount: " 45.50 ",
        notes: " Weekly shop ",
      },
      0,
    );

    expect(result).toEqual({
      rowNumber: 2,
      date: "2026-09-17",
      type: "expense",
      description: "Groceries",
      category: "Food",
      account: "Everyday",
      amount: "45.50",
      notes: "Weekly shop",
      errors: [],
    });
  });

  it("accepts a valid income row", () => {
    const result = validateImportRow(
      {
        date: "2026-09-17",
        type: "income",
        description: "Salary",
        category: "Salary",
        account: "Everyday",
        amount: "2500",
      },
      3,
    );

    expect(result.rowNumber).toBe(5);
    expect(result.errors).toEqual([]);
  });

  it("rejects unsupported transaction types", () => {
    const result = validateImportRow(
      {
        date: "2026-09-17",
        type: "transfer",
        description: "Transfer",
        category: "Other",
        account: "Everyday",
        amount: "100",
      },
      0,
    );

    expect(result.errors).toContain(
      'Type must be either "income" or "expense".',
    );
  });

  it.each(["", "0", "-10", "abc"])(
    "rejects invalid amount %s",
    (amount) => {
      const result = validateImportRow(
        {
          date: "2026-09-17",
          type: "expense",
          description: "Test expense",
          category: "Other",
          account: "Everyday",
          amount,
        },
        0,
      );

      expect(result.errors).toContain(
        "Amount must be greater than zero.",
      );
    },
  );

  it("reports every missing required value", () => {
    const result = validateImportRow(
      {
        date: "",
        type: "",
        description: "",
        category: "",
        account: "",
        amount: "",
      },
      0,
    );

    expect(result.errors).toHaveLength(6);
    expect(result.errors).toContain("Description is required.");
    expect(result.errors).toContain("Category is required.");
    expect(result.errors).toContain("Account is required.");
  });
});