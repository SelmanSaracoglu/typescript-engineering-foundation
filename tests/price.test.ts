import { describe, expect, it } from "vitest";
import { calculateFinalPrice } from "../src/price";

describe("calculateFinalPrice", () => {
  it("subtracts 20 when discount is enabled", () => {
    const result = calculateFinalPrice(100, true);

    expect(result).toBe(80);
  });

  it("returns zero when price equals the discount amount", () => {
    const result = calculateFinalPrice(20, true);

    expect(result).toBe(0);
  });
  it("does not return a price below zero", () => {
    const result = calculateFinalPrice(19, true);

    expect(result).toBe(0);
  });

  it("keeps the original price when discount is disabled", () => {
    const result = calculateFinalPrice(15, false);

    expect(result).toBe(15);
  });
});