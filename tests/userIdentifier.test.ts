import { describe, expect, it } from "vitest";
import { normalizeUserIdentifier } from "../src/userIdentifier"

describe("normalizeUserIdentifier", () => {
    it("accepts a numeric user identifier", () => {
        const input = 42;

        const result = normalizeUserIdentifier(input);

        expect(result).toEqual({
            success: true,
            id: 42
        });
    });
    it("accepts a string user identifier", () => {
        const input = "USR-42";

        const result = normalizeUserIdentifier(input);

        expect(result).toEqual({
            success: true,
            id: "USR-42"
            
        });
    });
    it("rejects a boolean user identifier", () => {
        const input = true;

        const result = normalizeUserIdentifier(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid user identifier"
        });
    });

    it("rejects null", () => {
        const input = null;

        const result = normalizeUserIdentifier(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid user identifier"
        });
    });

    it("rejects an object user identifier", () => {
        const input = { id: 42 };

        const result = normalizeUserIdentifier(input);

        expect(result).toEqual({
            success: false,
            error: "Invalid user identifier"
        });
    });
})