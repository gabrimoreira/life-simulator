// Reexporta o que `prison.ts` precisa de carreira e efeitos.
//
// `effects.ts` já importa `careers.ts` e vai importar `prison.ts`; sem esta
// ponte o grafo fecha um ciclo effects -> prison -> careers -> effects.
export { leaveCareer } from './careers'
export { setStat } from './effects'
