export type UserIdentifierResult =
  | {
      success: true;
      id: string | number;
    }
  | {
      success: false;
      error: string;
    };

export function normalizeUserIdentifier(input: unknown): UserIdentifierResult {
  if (typeof input === "string" || typeof input === "number") {
    return {
      success: true,
      id: input
    };
  }

  return {
    success: false,
    error: "Invalid user identifier"
  };
}