# Bölüm 1 — Value & Decision Mechanics

[İçindekiler](../README.md)

## Öğrenme sırası

1. [equality](./01-equality.md)
2. [truthy falsy](./02-truthy-falsy.md)
3. [logical operators](./03-logical-operators.md)
4. [short circuit](./04-short-circuit.md)
5. [nullish coalescing](./05-nullish-coalescing.md)
6. [ternary](./06-ternary.md)
7. [switch case](./07-switch-case.md)

## Bütüncül model

Equality, truthiness, logical operators, short-circuit, nullish fallback, ternary ve switch birbirini tamamlayan karar araçlarıdır. İş kuralı geçerli falsy değerleri eksik veriyle karıştırmamalıdır.

## Birikimli örnek

```ts
type Request={status:string;attempts:number|null;isAdmin:boolean;isOwner:boolean;blocked:boolean};
function decide(r:Request):string {
 const tries=r.attempts??3;
 if (!(r.isAdmin||r.isOwner) || r.blocked) return 'Denied';
 if (tries===0) return 'No attempts';
 switch(r.status){
  case 'pending': return tries>1?'Review pending':'Last attempt';
  case 'approved': return 'Approved';
  default: return 'Unknown';
 }
}
```

## Bölüm kapanışı için kontrol

- Örnekte karar sırasını ve veri akışını açıkla.
- Normal, sınır ve hata senaryosu yaz.
- Yanlış mantıksal operatörü ya da referans kullanımını hangi testin yakalayacağını belirle.

**Durum:** Teorik çalışma tamamlandı. Bu belge, bağımsız VS Code uygulaması veya başarılı Vitest kanıtı değildir.
