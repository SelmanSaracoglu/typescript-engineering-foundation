import type { Product } from "./product";

export type ProductValidationResult =
  | {
      success: true;
      product: Product;
    }
  | {
      success: false;
      error: string;
    };

export function validateProduct(input: unknown): ProductValidationResult {
  if (typeof input !== "object" || input === null) {
    return {
        success: false,
        error: "Invalid product"
    };
  } 

  if (
    !("name" in input) ||
    !("price" in input) ||
    !("inStock" in input)
  ) {
    return {
        success: false,
        error: "Invalid product"
    };
  }

  if (
    typeof input.name !== "string" ||
    typeof input.price !== "number" ||
    typeof input.inStock !== "boolean"
  ) {
    return {
        success: false,
        error: "Invalid product"
    };
  }

  return {
      success: true,
      product: {
        name: input.name,
        price: input.price,
        inStock: input.inStock
      }
    };
}

export function getValidatedProductPrice(result: ProductValidationResult): number {
  if(!result.success){
    throw new Error("Cannot get price from invalid product");
  }
  return result.product.price
}