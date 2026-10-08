import { describe, expect, it } from "vitest";
import { validateProduct } from "../src/productValidation";

describe("validateProduct", () => {
    it("returns a valid product result for valid input", () => {
        const input = {
            name: "Elma",
            price: 120,
            inStock: true
        };

        const result = validateProduct(input);

        expect(result).toEqual({
            success: true,
            product: {
                name: "Elma",
                price: 120,
                inStock: true
            }
        });
    });
    it("returns validation error when input is null", () => {
        const input = null;

        const result = validateProduct(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid product"
            
        });
    });
    it("returns validation error when input is not an object", () => {
        const input = "Elma";

        const result = validateProduct(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid product"
        });
    });

    it("returns validation error when a required property is missing", () => {
        const input = { name: "Elma", price: 120 };

        const result = validateProduct(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid product"
        });
    });

    it("returns validation error when price has the wrong type", () => {
        const input = { name: "Elma", price: "120", inStock: true };

        const result = validateProduct(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid product"
        });
    });
    it("returns validation error when inStock has the wrong type", () => {
        const input = { name: "Elma", price: 120, inStock: "yes" };

        const result = validateProduct(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid product"
        });
    });
})