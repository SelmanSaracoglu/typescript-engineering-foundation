import { describe, expect, it } from "vitest";
import {
  validateProduct,
  getValidatedProductPrice
} from "../src/productValidation";

describe("getValidatedProductPrice", () => {
  it("returns product price when validation result is successful", () => {
    const result = getValidatedProductPrice({
      success: true,
      product: {
        name: "Elma",
        price: 120,
        inStock: true
      }
    });

    expect(result).toBe(120);
  });

  it("throws when validation result is unsuccessful", () => {
    expect(() =>
      getValidatedProductPrice({
        success: false,
        error: "Invalid product"
      })
    ).toThrow("Cannot get price from invalid product");
  });
});