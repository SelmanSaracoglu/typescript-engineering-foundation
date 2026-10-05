"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const shipment_1 = require("../src/shipment");
(0, vitest_1.describe)("calculateShippingFee", () => {
    (0, vitest_1.it)("shipment fee is 0 when order equel or hogher then 50", () => {
        const result = (0, shipment_1.calculateShippingFee)(50, false);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("shipment fee is 0 when customer is premium", () => {
        const result = (0, shipment_1.calculateShippingFee)(40, true);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("shipment fee is 5 when order smaller then 50", () => {
        const result = (0, shipment_1.calculateShippingFee)(49, false);
        (0, vitest_1.expect)(result).toBe(5);
    });
});
