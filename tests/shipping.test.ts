import { describe, expect, it } from "vitest";
import { calculateShippingFee } from "../src/shipment";

describe("calculateShippingFee", () => {
  it("shipment fee is 0 when order equel or hogher then 50", () => {
    const result = calculateShippingFee(50, false);

    expect(result).toBe(0);
  });

  it("shipment fee is 0 when customer is premium", () => {
    const result = calculateShippingFee(40, true);

    expect(result).toBe(0);
  });

  it("shipment fee is 5 when order smaller then 50", () => {
    const result = calculateShippingFee(49, false);

    expect(result).toBe(5);
  });
});