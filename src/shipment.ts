export function calculateShippingFee(
  orderTotal: number,
  isPremium: boolean
): number {
  if(!isPremium){
    if(orderTotal >= 50) {
        return 0
    }
    return 5
  }
  return 0
}