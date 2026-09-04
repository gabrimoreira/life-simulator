// Flags que o próprio engine consulta, fora do sistema de Conditions.
//
// Existem como constantes por dois motivos: para serem grepáveis, e para o
// detector de flags órfãs saber que elas têm leitor. Uma flag lida só aqui
// não aparece em nenhuma condição de conteúdo, e sem esta lista o teste a
// acusaria de write-only.

export const FLAG_CHRONIC_CONDITION = 'chronic_condition'
export const FLAG_TRAINS_REGULARLY = 'trains_regularly'

export const ENGINE_READ_FLAGS: readonly string[] = [
  FLAG_CHRONIC_CONDITION,
  FLAG_TRAINS_REGULARLY,
]
