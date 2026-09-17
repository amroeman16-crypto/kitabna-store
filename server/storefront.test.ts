import { describe, expect, it } from "vitest";
import { books, formatPrice } from "../client/src/pages/Home";

describe("storefront catalog", () => {
  it("ships with realistic demo catalog data", () => {
    expect(books.length).toBeGreaterThanOrEqual(6);
    expect(books.every((book) => book.title && book.author && book.price > 0)).toBe(true);
    expect(books.some((book) => book.badge === "الأكثر مبيعًا")).toBe(true);
    expect(books.some((book) => book.format.includes("إلكتروني"))).toBe(true);
  });

  it("formats prices for the Arabic storefront", () => {
    expect(formatPrice(39)).toContain("ر.س");
    expect(formatPrice(150)).toContain("١٥٠");
  });
});
