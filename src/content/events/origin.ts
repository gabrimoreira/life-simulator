// Nascer do lado de cima.
//
// Um achado da auditoria da Fase 9: as sete condições de `socialClass` do
// conteúdo eram TODAS do lado de baixo — seis `['poor','lowerMiddle']` e uma
// que ia até `middle`. Nascer classe média alta ou classe alta mudava dois
// números (dinheiro inicial e custo de vida) e nada do que acontecia com a
// pessoa. Do lado de baixo, `poverty.ts` tem dez eventos e alcança 77% das
// vidas; do lado de cima, zero.
//
// Um detalhe do motor que este arquivo assume, e que vale escrever: a
// `socialClass` é decidida no nascimento (`generate.ts`) e NUNCA muda. Não
// existe efeito que a altere. Ela é ORIGEM, não posição atual — e é por isso
// que os eventos daqui são sobre de onde a pessoa veio, e não sobre quanto ela
// tem hoje. Riqueza conquistada já tem casa: `luxury.ts`, gated em `netWorth`.
//
// Os dois últimos eventos daqui vivem justamente no cruzamento — nascido em
// cima e sem dinheiro hoje. Cair de onde se nasceu é uma experiência
// específica, e nenhum dos dois arquivos a cobria.

import type { GameEvent } from '../../engine/types'

const ALTA = ['upperMiddle', 'rich'] as const

export const ORIGIN_EVENTS: GameEvent[] = [
  {
    id: 'origin_family_expectation',
    category: 'career',
    weight: 12,
    cooldown: 10,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 17, max: 30 },
    ],
    text: 'Na sua família já decidiram o que você vai ser. Falaram disso na sua frente, no plural.',
    options: [
      {
        text: 'Seguir o roteiro',
        outcomes: [
          {
            chance: 0.6,
            text: 'Portas abertas, o caminho já limpo por gente que você nem conhece.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você seguiu e descobriu tarde que não queria nada daquilo.',
            effects: [
              { type: 'money', delta: 20_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que vai fazer outra coisa',
        outcomes: [
          {
            chance: 0.45,
            text: 'Levaram um susto, brigaram, e no fim respeitaram. Sem ajuda, mas respeitaram.',
            bias: { charisma: 0.5, reputation: 0.3 },
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -8 },
            ],
          },
          {
            chance: 0.55,
            text: 'Cortaram a mesada no mês seguinte para ver quanto tempo você aguentava.',
            effects: [
              { type: 'money', delta: -15_000 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_safety_net',
    category: 'career',
    weight: 11,
    cooldown: 12,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 20, max: 45 },
    ],
    // O privilégio que ninguém chama de privilégio: poder errar barato.
    text: 'Deu tudo errado, e você sabe que se pedir eles cobrem. Sempre cobriram.',
    options: [
      {
        text: 'Pedir',
        outcomes: [
          {
            chance: 1,
            text: 'Resolveram em uma tarde, e nunca mais tocaram no assunto — o que é pior do que tocar.',
            effects: [
              { type: 'money', delta: 40_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Virar sozinho, mesmo custando caro',
        outcomes: [
          {
            chance: 0.5,
            text: 'Levou dois anos e você saiu de lá sendo outra pessoa.',
            bias: { intelligence: 0.4, health: 0.2 },
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
              { type: 'money', delta: -8_000 },
            ],
          },
          {
            chance: 0.5,
            text: 'Não virou. Ligou no fim do ano, e eles cobriram do mesmo jeito.',
            effects: [
              { type: 'money', delta: 30_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_friend_for_the_money',
    category: 'relationship',
    weight: 11,
    cooldown: 9,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 15 },
      { type: 'hasRelation', kind: 'friend' },
    ],
    text: 'Você contou a conta da viagem em voz alta e viu, no rosto de quem estava junto, quanto daquela amizade era a conta.',
    options: [
      {
        text: 'Perguntar direto',
        outcomes: [
          {
            chance: 0.45,
            text: 'Ficou magoado com a pergunta, e tinha razão de ficar. Vocês ficaram mais próximos.',
            bias: { charisma: 0.5 },
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.55,
            text: 'Ele desconversou, e sumiu no mês em que você parou de pagar as coisas.',
            effects: [
              { type: 'removeRelation', target: { by: 'kind', kind: 'friend' } },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Continuar pagando e não pensar nisso',
        outcomes: [
          {
            chance: 1,
            text: 'Sai mais barato do que descobrir.',
            effects: [
              { type: 'money', delta: -18_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_relative_needs_job',
    category: 'relationship',
    weight: 10,
    cooldown: 10,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 26 },
      { type: 'hasRelation', kind: 'sibling' },
    ],
    text: 'Um parente que você quase não vê ligou pedindo que você "converse com alguém" por ele.',
    options: [
      {
        text: 'Fazer a ligação',
        outcomes: [
          {
            chance: 0.55,
            text: 'Ele entrou, se deu bem, e a família inteira ficou sabendo quem abriu a porta.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ele entrou e foi um desastre. Quem indicou foi você.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -10 },
              { type: 'performance', delta: -6 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que não mistura as coisas',
        outcomes: [
          {
            chance: 1,
            text: 'Você não misturou. Passaram a te achar arrogante, e talvez seja isso mesmo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_never_worked',
    category: 'career',
    weight: 10,
    cooldown: 10,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 22 },
      { type: 'hasCareer', value: true },
    ],
    text: 'Disseram na sua cara, na frente da equipe, que você não sabe o que é trabalhar de verdade.',
    options: [
      {
        text: 'Provar o contrário no serviço',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você virou um ano puxando o que ninguém queria. Pararam de falar.',
            bias: { intelligence: 0.3, health: 0.3 },
            effects: [
              { type: 'performance', delta: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você se matou de trabalhar e continuaram achando que era sobrenome.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Concordar e rir',
        outcomes: [
          {
            chance: 0.6,
            text: 'Desarmou a sala. Ficou sendo o único que admite.',
            bias: { charisma: 0.6 },
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'Levaram a sério e passaram a te dar menos coisa para fazer.',
            effects: [{ type: 'performance', delta: -8 }],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_school_bubble',
    category: 'school',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 10, max: 17 },
    ],
    text: 'Você percebeu que todo mundo do seu colégio mora a dez minutos da sua casa, e que a cidade não é aquilo.',
    options: [
      {
        text: 'Ir atrás de gente de fora da bolha',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você fez amizade num lugar que a sua mãe achou estranho, e aprendeu mais ali que na aula.',
            bias: { charisma: 0.4 },
            effects: [
              { type: 'addRelation', kind: 'friend' },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.45,
            text: 'Foi constrangedor para todo mundo, principalmente para você.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Ficar onde está',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou, e a bolha faz muito bem para as notas.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_inheritance_waiting',
    category: 'relationship',
    weight: 10,
    cooldown: 12,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 35 },
      { type: 'hasRelation', kind: 'sibling' },
    ],
    text: 'Um irmão seu começou a falar do inventário. Seus pais ainda estão vivos.',
    options: [
      {
        text: 'Cortar o assunto',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ele parou. Ficou um clima que não passou mais.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ele foi conversar sozinho com os advogados da família.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -20 },
              { type: 'money', delta: -30_000 },
            ],
          },
        ],
      },
      {
        text: 'Sentar e organizar tudo agora',
        outcomes: [
          {
            chance: 0.5,
            text: 'Resolveram em vida, sem briga. Raro, e caro em honorários.',
            bias: { intelligence: 0.4 },
            effects: [
              { type: 'money', delta: -20_000 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.5,
            text: 'A conversa virou uma briga de vinte anos em uma tarde.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_guilt',
    category: 'random',
    weight: 10,
    cooldown: 10,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 18 },
    ],
    text: 'Você olhou o quanto teve de vantagem antes de fazer qualquer coisa e não soube o que fazer com isso.',
    options: [
      {
        text: 'Botar dinheiro onde dói',
        requirements: [{ type: 'money', min: 30_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você doou, de verdade e sem contar para ninguém. Não resolveu nada e resolveu alguma coisa.',
            effects: [
              { type: 'money', delta: -25_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
        ],
      },
      {
        text: 'Botar tempo, que é mais difícil',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você foi todo sábado por um ano. Mudou você mais do que mudou eles, e você sabe.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'Você foi duas vezes e parou. A vida encheu de novo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Não é culpa sua',
        outcomes: [
          {
            chance: 1,
            text: 'Não é. Você seguiu o dia normalmente.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },

  // --- Cair de onde se nasceu ----------------------------------------------
  {
    id: 'origin_fallen_pride',
    category: 'random',
    weight: 12,
    cooldown: 8,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 28 },
      { type: 'netWorth', max: 15_000 },
    ],
    // O cruzamento que nenhum dos dois arquivos cobria: nascido em cima,
    // quebrado hoje. `poverty.ts` fala de quem sempre foi pobre; `luxury.ts`,
    // de quem tem. Isto é o terceiro caso.
    text: 'Encontraram você no mercado e perguntaram como vai a família, com aquele tom. Você mentiu.',
    options: [
      {
        text: 'Assumir a situação para quem te conhece',
        outcomes: [
          {
            chance: 0.5,
            text: 'Um deles apareceu com uma proposta de trabalho três dias depois. Sem esmola, trabalho.',
            bias: { reputation: 0.4, charisma: 0.3 },
            effects: [
              { type: 'money', delta: 12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Viraram assunto de mesa. Ninguém ligou depois.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Manter as aparências custe o que custar',
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou a conta de todo mundo com dinheiro que não tinha.',
            effects: [
              { type: 'debt', delta: 9_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'origin_selling_the_house',
    category: 'random',
    weight: 11,
    cooldown: 15,
    conditions: [
      { type: 'socialClass', oneOf: [...ALTA] },
      { type: 'age', min: 32 },
      { type: 'netWorth', max: 30_000 },
    ],
    text: 'A família vai vender a casa onde você cresceu. Perguntaram se você tem como ficar com a parte dos outros.',
    options: [
      {
        text: 'Tentar segurar a casa',
        requirements: [{ type: 'money', min: 5_000 }],
        outcomes: [
          {
            chance: 0.35,
            text: 'Você conseguiu, e vai pagar por isso pelos próximos dez anos.',
            bias: { luck: 0.3 },
            effects: [
              { type: 'debt', delta: 120_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.65,
            text: 'Não deu. Você gastou o que tinha em advogado para descobrir isso.',
            effects: [
              { type: 'money', delta: -5_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Assinar e pegar a sua parte',
        outcomes: [
          {
            chance: 1,
            text: 'Você assinou. O dinheiro entrou, e você passou de carro na rua uma vez só depois disso.',
            effects: [
              { type: 'money', delta: 90_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
    ],
  },
]
