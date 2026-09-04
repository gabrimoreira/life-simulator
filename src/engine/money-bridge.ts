// Reexporta o que `divorce.ts` precisa de efeitos.
//
// Mesma razao do `careers-bridge.ts`: `effects.ts` importa `divorce.ts`, entao
// `divorce.ts` nao pode importar `effects.ts` de volta.
export { addMoney } from './effects'
