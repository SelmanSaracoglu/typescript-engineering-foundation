import { describe, expect, it } from "vitest";
import { getQualifiedUsers } from "../src/score";
import type { User } from "../src/score";

describe("getQualifiedUsers", () => {
  it("includes an active user with score above 60", () => {
    const users: User[] = [
      { name: "Ali", score: 80, active: true }
    ];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([
      { name: "Ali", score: 80, active: true }
    ]);
  });

  it("includes an active user with score equal to 60", () => {
    const users: User[] = [
      { name: "Ali", score: 60, active: true }
    ];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([
      { name: "Ali", score: 60, active: true }
    ]);
  });

  it("excludes an active user with score below 60", () => {
    const users: User[] = [
      { name: "Ali", score: 59, active: true }
    ];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([]);
  });

  it("excludes an inactive user even when score is above 60", () => {
    const users: User[] = [
      { name: "Ali", score: 90, active: false }
    ];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([]);
  });

  it("returns an empty array when input is empty", () => {
    const users: User[] = [];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([]);
  });

  it("does not mutate the input data", () => {
    const users: User[] = [
      { name: "Ali", score: 80, active: true },
      { name: "Ece", score: 45, active: true }
    ];

    const originalUsers: User[] = [
      { name: "Ali", score: 80, active: true },
      { name: "Ece", score: 45, active: true }
    ];

    getQualifiedUsers(users);

    expect(users).toEqual(originalUsers);
  });

  it("does not share returned user object references with input", () => {
    const users: User[] = [
      { name: "Ali", score: 80, active: true }
    ];

    const result = getQualifiedUsers(users);

    expect(result).not.toBe(users);
    expect(result[0]).not.toBe(users[0]);

    result[0].score = 10;

    expect(result[0].score).toBe(10);
    expect(users[0].score).toBe(80);
  });

    it("includes active users with score equal to 60", () => {
    const users: User[] = [
      { name: "Ali", score: 80, active: true },
      { name: "Ece", score: 90, active: false },
      { name: "Can", score: 70, active: true },
      { name: "Zeynep", score: 40, active: true }
    ];

    const result = getQualifiedUsers(users);

    expect(result).toEqual([
      { name: "Ali", score: 80, active: true },
      { name: "Can", score: 70, active: true },
    ]);
  });


});