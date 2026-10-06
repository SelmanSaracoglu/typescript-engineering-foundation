export type Product = {
    name: string;
    price: number;
    inStock: boolean;
}

export function getAvailablePremiumProducts(products: Product[]): Product[] {
  const inStockProduct: Product[] = [];

  for (const product of products) {
    if (product.inStock && product.price >= 100 ) {
      inStockProduct.push({
        name: product.name,
        price: product.price,
        inStock: product.inStock
      });
    }
  }
  return inStockProduct;
}