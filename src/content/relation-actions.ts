// Ações dirigidas a uma pessoa, mostradas na aba Relações.
//
// Os efeitos usam `{ by: 'target' }`: o engine substitui pelo id de quem
// recebeu a ação antes de aplicar.

import type { RelationAction } from '../engine/types'

const FAMILIA = ['mother', 'father', 'sibling', 'child'] as const
const TODOS = ['mother', 'father', 'sibling', 'child', 'friend', 'partner', 'spouse'] as const

export const RELATION_ACTIONS: RelationAction[] = [
  // --- Cadeia --------------------------------------------------------------
  // Preso, o jogador só enxerga o que declara `inPrison`. Sem estas duas, a
  // pena seria isolamento total: nem falar com a mãe. A visita é o único
  // laço que sobrevive, e ela custa caro a quem vem.
  {
    id: 'visit_prison',
    label: 'Receber visita',
    hint: 'Fila, revista, quarenta minutos. Vale por meses.',
    cost: 1,
    kinds: [...FAMILIA, 'spouse', 'partner'],
    conditions: [{ type: 'inPrison', value: true }],
    cooldown: 2,
    outcomes: [
      {
        chance: 0.7,
        text: 'a visita veio, e por quarenta minutos a cadeia ficou do lado de fora.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: 14 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
        ],
      },
      {
        chance: 0.3,
        text: 'a visita veio, viu onde você está, e foi embora mais calada do que chegou.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: 5 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
        ],
      },
    ],
  },

  {
    id: 'write_from_prison',
    label: 'Escrever uma carta',
    hint: 'Tempo é o que não falta aqui dentro.',
    cost: 1,
    kinds: [...TODOS],
    conditions: [{ type: 'inPrison', value: true }],
    outcomes: [
      {
        chance: 0.6,
        text: 'a resposta chegou três semanas depois, e você leu quatro vezes.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: 9 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'a carta foi. A resposta não veio.',
        effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
      },
    ],
  },

  {
    id: 'talk',
    label: 'Conversar',
    hint: 'Custa tempo e quase nada mais.',
    cost: 1,
    kinds: [...TODOS],
    outcomes: [
      {
        chance: 0.75,
        bias: { charisma: 0.3 },
        text: 'vocês conversaram de verdade, sem pressa.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: 12 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
        ],
      },
      {
        chance: 0.25,
        text: 'a conversa não foi para lugar nenhum.',
        effects: [{ type: 'relation', target: { by: 'target' }, delta: 3 }],
      },
    ],
  },

  {
    id: 'gift',
    label: 'Presentear',
    hint: 'Funciona quase sempre. Custa dinheiro.',
    cost: 1,
    kinds: [...TODOS],
    requirements: [{ type: 'money', min: 2_000 }],
    outcomes: [
      {
        chance: 0.85,
        text: 'o presente acertou em cheio.',
        effects: [
          { type: 'money', delta: -2_000 },
          { type: 'relation', target: { by: 'target' }, delta: 20 },
        ],
      },
      {
        chance: 0.15,
        text: 'o presente foi educadamente guardado numa gaveta.',
        effects: [
          { type: 'money', delta: -2_000 },
          { type: 'relation', target: { by: 'target' }, delta: 4 },
        ],
      },
    ],
  },

  {
    id: 'ask_money',
    label: 'Pedir dinheiro',
    hint: 'Resolve o mês e cobra na relação.',
    cost: 1,
    cooldown: 3,
    kinds: [...FAMILIA, 'friend', 'spouse'],
    minRelation: 30,
    outcomes: [
      {
        chance: 0.5,
        bias: { charisma: 0.4 },
        text: 'emprestou sem fazer perguntas.',
        effects: [
          { type: 'money', delta: 15_000 },
          { type: 'relation', target: { by: 'target' }, delta: -12 },
          // `{ by: 'target' }` é o único alvo exato do jogo: uma ação de
          // relação sabe em QUEM foi disparada. Marcar aqui e ler em
          // `pay_back` é a cadeia inteira dentro de uma pessoa só.
          { type: 'personFlag', target: { by: 'target' }, flag: 'helped_me', value: true },
        ],
      },
      {
        chance: 0.3,
        text: 'ajudou com o que dava, e ficou claro que doeu.',
        effects: [
          { type: 'money', delta: 4_000 },
          { type: 'relation', target: { by: 'target' }, delta: -18 },
        ],
      },
      {
        chance: 0.2,
        text: 'disse que não tinha. Ficou um clima.',
        effects: [{ type: 'relation', target: { by: 'target' }, delta: -22 }],
      },
    ],
  },

  {
    id: 'fight',
    label: 'Brigar',
    hint: 'Alivia na hora e cobra depois.',
    cost: 0,
    kinds: [...TODOS],
    outcomes: [
      {
        chance: 0.6,
        text: 'vocês gritaram tudo o que estava entalado.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: -25 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'a briga passou de todos os limites.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: -40 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
        ],
      },
    ],
  },

  {
    id: 'propose',
    label: 'Pedir em casamento',
    hint: 'Vira cônjuge. A festa sai do seu bolso.',
    cost: 1,
    kinds: ['partner'],
    conditions: [
      { type: 'age', min: 18 },
      { type: 'flag', flag: 'married', value: false },
    ],
    requirements: [{ type: 'money', min: 15_000 }],
    minRelation: 60,
    outcomes: [
      {
        chance: 0.8,
        bias: { charisma: 0.25, looks: 0.15 },
        text: 'disse sim.',
        effects: [
          { type: 'money', delta: -15_000 },
          { type: 'relationKind', target: { by: 'target' }, kind: 'spouse' },
          { type: 'relation', target: { by: 'target' }, delta: 15 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
          { type: 'flag', flag: 'married', value: true },
        ],
      },
      {
        chance: 0.2,
        text: 'disse não, e vocês terminaram na mesma semana.',
        effects: [
          { type: 'removeRelation', target: { by: 'target' } },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -22 },
        ],
      },
    ],
  },

  {
    id: 'have_child',
    label: 'Ter um filho',
    hint: 'Muda tudo. Custa caro e vale a pena, ou não.',
    cost: 1,
    cooldown: 3,
    kinds: ['spouse'],
    conditions: [{ type: 'age', min: 20, max: 48 }],
    minRelation: 50,
    outcomes: [
      {
        chance: 0.85,
        bias: { luck: 0.3 },
        text: 'nasceu saudável.',
        effects: [
          { type: 'addRelation', kind: 'child' },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
          { type: 'stat', stat: 'health', op: 'delta', value: -4 },
          { type: 'money', delta: -18_000 },
          { type: 'flag', flag: 'has_child', value: true },
        ],
      },
      {
        chance: 0.15,
        text: 'não vingou. Levou tempo para vocês se recuperarem.',
        effects: [
          { type: 'stat', stat: 'happiness', op: 'delta', value: -18 },
          { type: 'money', delta: -12_000 },
        ],
      },
    ],
  },

  {
    id: 'end_it',
    label: 'Terminar',
    hint: 'Acaba com o relacionamento. Sem volta.',
    cost: 0,
    confirm: 'Terminar não tem volta: a pessoa deixa de ser família. Tem certeza?',
    kinds: ['partner'],
    outcomes: [
      {
        chance: 1,
        text: 'acabou.',
        effects: [
          { type: 'removeRelation', target: { by: 'target' } },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
        ],
      },
    ],
  },

  // Separado de `end_it` porque não é a mesma coisa: namoro acaba, casamento
  // se desfaz — e desfazer custa metade do patrimônio, ou mais com filho. O
  // efeito `divorce` é regra, não conteúdo: dividir bens envolve vender o que
  // não se divide, e isso não cabe num `money`.
  {
    id: 'divorce',
    label: 'Pedir o divórcio',
    hint: 'Metade do patrimônio vai embora. Mais, se houver filho.',
    cost: 0,
    confirm:
      'O divórcio parte o patrimônio ao meio, vende os bens que não dá para dividir, e custa mais se houver filho. Tem certeza?',
    kinds: ['spouse'],
    outcomes: [
      {
        chance: 1,
        text: 'os advogados resolveram o resto.',
        effects: [
          { type: 'divorce' },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -20 },
        ],
      },
    ],
  },

  // --- O que só existe por causa da história com aquela pessoa -------------
  //
  // Estas duas são a razão de `Person.flags` existir. Antes da Fase 9 uma
  // relação era um número e um tipo: dava para saber que o amigo estava
  // distante, nunca POR QUÊ. Elas aparecem em UMA pessoa da lista — a que
  // pegou o dinheiro, a que emprestou — e em mais ninguém.
  {
    id: 'collect_debt',
    label: 'Cobrar o que devem',
    hint: 'Cobrar custa a relação. Deixar passar custa o dinheiro.',
    cost: 1,
    cooldown: 4,
    kinds: [...FAMILIA, 'friend'],
    personFlags: { owes_me: true },
    outcomes: [
      {
        chance: 0.35,
        bias: { charisma: 0.4, reputation: 0.3 },
        text: 'pagou o que devia, parcelado, e sumiu depois.',
        effects: [
          { type: 'money', delta: 12_000 },
          { type: 'relation', target: { by: 'target' }, delta: -10 },
          { type: 'personFlag', target: { by: 'target' }, flag: 'owes_me', value: false },
        ],
      },
      {
        chance: 0.3,
        text: 'pagou uma parte e chorou o resto.',
        effects: [
          { type: 'money', delta: 4_000 },
          { type: 'relation', target: { by: 'target' }, delta: -6 },
          { type: 'personFlag', target: { by: 'target' }, flag: 'owes_me', value: false },
        ],
      },
      {
        chance: 0.35,
        text: 'disse que você está cobrando na pior hora possível.',
        effects: [{ type: 'relation', target: { by: 'target' }, delta: -20 }],
      },
    ],
  },

  {
    id: 'pay_back',
    label: 'Retribuir',
    hint: 'Devolver o que fizeram por você, quando você podia menos.',
    cost: 1,
    cooldown: 5,
    kinds: [...FAMILIA, 'friend', 'spouse'],
    personFlags: { helped_me: true },
    requirements: [{ type: 'money', min: 15_000 }],
    outcomes: [
      {
        chance: 0.75,
        text: 'recebeu de volta o que emprestou, e a cara de quem não esperava mais.',
        effects: [
          { type: 'money', delta: -12_000 },
          { type: 'relation', target: { by: 'target' }, delta: 22 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
          { type: 'personFlag', target: { by: 'target' }, flag: 'helped_me', value: false },
        ],
      },
      {
        chance: 0.25,
        text: 'recusou, e disse que aquilo nunca foi empréstimo.',
        effects: [
          { type: 'relation', target: { by: 'target' }, delta: 12 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
          { type: 'personFlag', target: { by: 'target' }, flag: 'helped_me', value: false },
        ],
      },
    ],
  },

  {
    id: 'cut_off',
    label: 'Cortar relações',
    hint: 'Some da vida da pessoa de vez.',
    cost: 0,
    confirm: 'Cortar relações é definitivo. Tem certeza?',
    kinds: ['friend', 'sibling'],
    maxRelation: 40,
    outcomes: [
      {
        chance: 1,
        text: 'você parou de responder, e ficou por isso mesmo.',
        effects: [
          { type: 'removeRelation', target: { by: 'target' } },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
        ],
      },
    ],
  },
]
