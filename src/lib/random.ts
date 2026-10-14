export function barreja<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function tria<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Tria un element segons pesos (pesos > 0) */
export function triaPonderat<T>(arr: T[], pes: (x: T) => number): T {
  const pesos = arr.map(pes);
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= pesos[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

/** Tria n elements diferents a l'atzar */
export function triaN<T>(arr: T[], n: number): T[] {
  return barreja(arr).slice(0, n);
}
