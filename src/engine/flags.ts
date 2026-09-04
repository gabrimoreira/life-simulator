// Flags que o próprio engine consulta, fora do sistema de Conditions.
//
// Existem como constantes por dois motivos: para serem grepáveis, e para o
// detector de flags órfãs saber que elas têm leitor. Uma flag lida só aqui
// não aparece em nenhuma condição de conteúdo, e sem esta lista o teste a
// acusaria de write-only.

export const FLAG_CHRONIC_CONDITION = 'chronic_condition'
export const FLAG_TRAINS_REGULARLY = 'trains_regularly'

/**
 * Vicios.
 *
 * O spec sempre listou tres coisas que derrubam a saude — idade, doenca e
 * vicio — e ate a Fase 8 so as duas primeiras existiam. Um vicio nao e um
 * evento ruim que ja passou: e uma escolha antiga que continua cobrando todo
 * ano, em saude e em dinheiro, ate alguem gastar um ponto de acao para
 * largar. Os numeros moram em `balance.ts`, junto com o resto da economia.
 */
export const FLAG_SMOKER = 'smoker'
export const FLAG_HEAVY_DRINKER = 'heavy_drinker'

export const ENGINE_READ_FLAGS: readonly string[] = [
  FLAG_CHRONIC_CONDITION,
  FLAG_TRAINS_REGULARLY,
  FLAG_SMOKER,
  FLAG_HEAVY_DRINKER,
]
