import { describe, expect, it } from "vitest";
import { getAvailablePremiumProducts } from "../src/product";
import type { Product } from "../src/product";

describe("getAvailablePremiumProducts", () => {
  it("includes an inStock product with price above 100", () => {
    const products: Product[] = [
      { name: "Elma", price: 110, inStock: true }
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([
      { name: "Elma", price: 110, inStock: true }
    ]);
  });

  it("includes an inStock product with price equal to 100", () => {
    const products: Product[] = [
      { name: "Karpuz", price: 100, inStock: true }
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([
      { name: "Karpuz", price: 100, inStock: true }
    ]);
  });

  it("excludes an out of Stock product with price above 100", () => {
    const products: Product[] = [
      { name: "Portokal", price: 150, inStock: false }
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([]);
  });

  it("excludes an inStock product with price under 100", () => {
    const products: Product[] = [
      { name: "Nar", price: 80, inStock: true }
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([]);
  });

  it("returns an empty array when input is empty", () => {
    const products: Product[] = [];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([]);
  });

  it("does not mutate the input data", () => {
    const products: Product[] = [
      { name: "Nar", price: 110, inStock: true },
      { name: "Karpuz", price: 100, inStock: true }
    ];

    const originalProducts: Product[] = [
      { name: "Nar", price: 110, inStock: true },
      { name: "Karpuz", price: 100, inStock: true }
    ];

    getAvailablePremiumProducts(products);

    expect(products).toEqual(originalProducts);
  });

  it("does not share returned product object references with input", () => {
    const products: Product[] = [
      { name: "Nar", price: 110, inStock: true },
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).not.toBe(products);
    expect(result[0]).not.toBe(products[0]);

    result[0].price = 10;

    expect(result[0].price).toBe(10);
    expect(products[0].price).toBe(110);
  });

    it("includes multiple in-stock products with price equal to 100", () => {
    const products: Product[] = [
      { name: "Nar", price: 100, inStock: true },
      { name: "Karpuz", price: 100, inStock: true },
      { name: "Elma", price: 100, inStock: false },
      { name: "Incir", price: 100, inStock: true }
    ];

    const result = getAvailablePremiumProducts(products);

    expect(result).toEqual([
      { name: "Nar", price: 100, inStock: true },
      { name: "Karpuz", price: 100, inStock: true },
      { name: "Incir", price: 100, inStock: true }
    ]);
  });
});