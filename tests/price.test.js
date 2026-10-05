"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const price_1 = require("../src/price");
(0, vitest_1.describe)("calculateFinalPrice", () => {
    (0, vitest_1.it)("subtracts 20 when discount is enabled", () => {
        const result = (0, price_1.calculateFinalPrice)(100, true);
        (0, vitest_1.expect)(result).toBe(80);
    });
    (0, vitest_1.it)("returns zero when price equals the discount amount", () => {
        const result = (0, price_1.calculateFinalPrice)(20, true);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("does not return a price below zero", () => {
        const result = (0, price_1.calculateFinalPrice)(19, true);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("keeps the original price when discount is disabled", () => {
        const result = (0, price_1.calculateFinalPrice)(15, false);
        (0, vitest_1.expect)(result).toBe(15);
    });
});
