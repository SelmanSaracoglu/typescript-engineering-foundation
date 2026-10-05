export function calculateFinalPrice(
  price: number,
  hasDiscount: boolean
): number {
  if (hasDiscount) {
    if (price - 20 < 0) {
      return 0;
    }

    return price - 20;
  }

  return price;
}

const result = calculateFinalPrice(100, true);
console.log(result);