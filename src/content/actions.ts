// Ações da aba Ações. Matrícula, estudo e entrada em carreira NÃO estão aqui:
// são derivadas dos cursos e das trilhas por `engine/actions.ts`, porque
// "você pode se matricular no que tem requisito" é regra, não dado.

import type { GameAction } from '../engine/types'

export const GAME_ACTIONS: GameAction[] = [
  // --- Saúde ---------------------------------------------------------------
  {
    id: 'train',
    group: 'health',
    label: 'Treinar',
    hint: 'Um ano de exercício. Cansa, mas o corpo agradece.',
    cost: 1,
    conditions: [{ type: 'age', min: 12 }],
    outcomes: [
      {
        chance: 0.8,
        text: 'Você treinou o ano inteiro. Deu para sentir a diferença.',
        effects: [
          { type: 'stat', stat: 'health', op: 'delta', value: 7 },
          { type: 'stat', stat: 'looks', op: 'delta', value: 4 },
        ],
      },
      {
        chance: 0.2,
        text: 'Você exagerou na carga e se machucou no meio do ano.',
        effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -4 }],
      },
    ],
  },
  {
    id: 'doctor',
    group: 'health',
    label: 'Cuidar da saúde',
    hint: 'Exames, dentista, o que estava atrasado.',
    cost: 1,
    conditions: [{ type: 'age', min: 12 }],
    requirements: [{ type: 'money', min: 2_000 }],
    outcomes: [
      {
        chance: 1,
        text: 'Você pôs os exames em dia e tratou o que estava pendente.',
        effects: [
          { type: 'money', delta: -2_000 },
          { type: 'stat', stat: 'health', op: 'delta', value: 9 },
        ],
      },
    ],
  },
  {
    id: 'therapy',
    group: 'health',
    label: 'Fazer terapia',
    hint: 'Um ano de sessões semanais.',
    cost: 1,
    conditions: [{ type: 'age', min: 14 }],
    requirements: [{ type: 'money', min: 6_000 }],
    outcomes: [
      {
        chance: 0.8,
        text: 'A terapia pegou. Você entendeu coisas que estavam há anos no caminho.',
        effects: [
          { type: 'money', delta: -6_000 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
          { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
        ],
      },
      {
        chance: 0.2,
        text: 'Você não engatou com a terapeuta e parou no terceiro mês.',
        effects: [
          { type: 'money', delta: -2_000 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 2 },
        ],
      },
    ],
  },

  // --- Educação ------------------------------------------------------------
  {
    id: 'self_study',
    group: 'education',
    label: 'Estudar por conta',
    hint: 'Sem diploma no fim, mas a cabeça fica melhor.',
    cost: 1,
    conditions: [{ type: 'age', min: 10 }],
    outcomes: [
      {
        chance: 0.7,
        text: 'Você estudou sozinh{o} o ano inteiro e aprendeu bastante.',
        effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 5 }],
      },
      {
        chance: 0.3,
        text: 'Você começou animad{o} e abandonou em março.',
        effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 1 }],
      },
    ],
  },

  // --- Carreira ------------------------------------------------------------
  {
    id: 'work_hard',
    group: 'career',
    label: 'Se dedicar ao trabalho',
    hint: 'Sobe o desempenho, que é o que puxa promoção. Cobra em felicidade.',
    cost: 1,
    conditions: [{ type: 'hasCareer', value: true }],
    outcomes: [
      {
        chance: 0.75,
        text: 'Você entregou tudo, e apareceu.',
        effects: [
          { type: 'performance', delta: 12 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
        ],
      },
      {
        chance: 0.25,
        text: 'Você se matou de trabalhar e ninguém notou.',
        effects: [
          { type: 'performance', delta: 4 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
          { type: 'stat', stat: 'health', op: 'delta', value: -3 },
        ],
      },
    ],
  },
  {
    id: 'ask_raise',
    group: 'career',
    label: 'Pedir aumento',
    hint: 'Pode dar certo. Pode queimar seu filme.',
    cost: 1,
    cooldown: 3,
    conditions: [{ type: 'hasCareer', value: true }],
    outcomes: [
      {
        chance: 0.45,
        luckBias: 0.4,
        text: 'Conseguiu. Não foi o que você pediu, mas foi.',
        effects: [
          { type: 'money', delta: 18_000 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
        ],
      },
      {
        chance: 0.4,
        text: 'Disseram que não é o momento. Ninguém nunca diz que é.',
        effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
      },
      {
        chance: 0.15,
        text: 'A conversa azedou e ficou marcada.',
        effects: [
          { type: 'performance', delta: -12 },
          { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
        ],
      },
    ],
  },
  {
    id: 'network',
    group: 'career',
    label: 'Fazer networking',
    hint: 'Eventos, cafés, gente nova. Abre porta que currículo não abre.',
    cost: 1,
    conditions: [{ type: 'age', min: 16 }],
    outcomes: [
      {
        chance: 0.6,
        text: 'Você conheceu gente que valia a pena conhecer.',
        effects: [
          { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
          { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'Foi um ano de conversa fiada em evento caro.',
        effects: [
          { type: 'money', delta: -1_500 },
          { type: 'stat', stat: 'charisma', op: 'delta', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'quit_job',
    group: 'career',
    label: 'Pedir demissão',
    hint: 'Sai limpo, mas sai. Todo o progresso da trilha vai junto.',
    cost: 0,
    conditions: [{ type: 'hasCareer', value: true }],
    confirm: 'Sair agora zera o progresso desta trilha. Voltar depois custa níveis. Pedir demissão?',
    outcomes: [
      {
        chance: 1,
        text: 'Você pediu as contas.',
        effects: [
          { type: 'career', action: 'quit' },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
        ],
      },
    ],
  },

  // --- Social --------------------------------------------------------------
  {
    id: 'meet_people',
    group: 'social',
    label: 'Sair para conhecer gente',
    hint: 'Amizade não aparece sozinha.',
    cost: 1,
    conditions: [{ type: 'age', min: 12 }],
    outcomes: [
      {
        chance: 0.55,
        luckBias: 0.4,
        text: 'Você fez uma amizade de verdade este ano.',
        effects: [
          { type: 'addRelation', kind: 'friend' },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
        ],
      },
      {
        chance: 0.45,
        text: 'Você saiu bastante e não engatou com ninguém.',
        effects: [
          { type: 'money', delta: -800 },
          { type: 'stat', stat: 'charisma', op: 'delta', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'visit_family',
    group: 'social',
    label: 'Dar atenção à família',
    hint: 'Almoço de domingo, telefonema, presença.',
    cost: 1,
    conditions: [
      { type: 'age', min: 14 },
      {
        type: 'anyOf',
        conditions: [
          { type: 'hasRelation', kind: 'mother' },
          { type: 'hasRelation', kind: 'father' },
          { type: 'hasRelation', kind: 'sibling' },
        ],
      },
    ],
    outcomes: [
      {
        chance: 1,
        text: 'Você apareceu mais este ano. Fez diferença.',
        effects: [
          { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 14 },
          { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 14 },
          { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 12 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
        ],
      },
    ],
  },
  {
    id: 'look_for_love',
    group: 'social',
    label: 'Procurar um relacionamento',
    hint: 'Aplicativo, apresentação de amigo, sorte.',
    cost: 1,
    cooldown: 2,
    conditions: [
      { type: 'age', min: 16 },
      { type: 'flag', flag: 'married', value: false },
      { type: 'not', condition: { type: 'hasRelation', kind: 'partner' } },
    ],
    outcomes: [
      {
        chance: 0.45,
        luckBias: 0.5,
        text: 'Você conheceu alguém, e desta vez foi diferente.',
        effects: [
          { type: 'addRelation', kind: 'partner' },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
        ],
      },
      {
        chance: 0.55,
        text: 'Foi um ano de encontros que não deram em nada.',
        effects: [
          { type: 'money', delta: -1_200 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
        ],
      },
    ],
  },

  // --- Preso ---------------------------------------------------------------
  // Só aparecem na cadeia. Toda ação que NÃO menciona prisão some lá dentro,
  // então esta lista é a vida inteira de quem está preso.
  {
    id: 'prison_lay_low',
    group: 'crime',
    label: 'Manter a cabeça baixa',
    hint: 'Não chamar atenção é a estratégia mais chata e mais eficaz.',
    cost: 1,
    conditions: [{ type: 'inPrison', value: true }],
    outcomes: [
      {
        chance: 0.85,
        text: 'O ano passou sem que ninguém reparasse em você.',
        effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 4 }],
      },
      {
        chance: 0.15,
        text: 'Sobrou para você mesmo assim.',
        effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -8 }],
      },
    ],
  },
  {
    id: 'prison_study',
    group: 'crime',
    label: 'Estudar na biblioteca',
    hint: 'Tempo é a única coisa que sobra. Dá para usar.',
    cost: 1,
    conditions: [{ type: 'inPrison', value: true }],
    outcomes: [
      {
        chance: 0.8,
        text: 'Você leu tudo o que tinha na estante, duas vezes.',
        effects: [
          { type: 'stat', stat: 'intelligence', op: 'delta', value: 6 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
        ],
      },
      {
        chance: 0.2,
        text: 'Você não conseguiu se concentrar em uma página sequer.',
        effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
      },
    ],
  },
  {
    id: 'prison_connections',
    group: 'crime',
    label: 'Se aproximar de quem manda',
    hint: 'Proteção lá dentro, dívida lá fora.',
    cost: 1,
    cooldown: 2,
    conditions: [{ type: 'inPrison', value: true }],
    outcomes: [
      {
        chance: 0.55,
        luckBias: 0.4,
        text: 'Você virou gente de confiança. Ninguém mais te encosta.',
        effects: [
          { type: 'stat', stat: 'charisma', op: 'delta', value: 6 },
          { type: 'stat', stat: 'health', op: 'delta', value: 5 },
          { type: 'addRelation', kind: 'friend' },
        ],
      },
      {
        chance: 0.45,
        text: 'Você se aproximou de quem não devia e agora deve favor.',
        effects: [
          { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
        ],
      },
    ],
  },
  {
    id: 'prison_good_behavior',
    group: 'crime',
    label: 'Pedir progressão de regime',
    hint: 'Bom comportamento pode encurtar a pena.',
    cost: 2,
    cooldown: 3,
    conditions: [{ type: 'inPrison', value: true }],
    outcomes: [
      {
        chance: 0.35,
        luckBias: 0.5,
        text: 'O juiz aceitou. Você sai antes do previsto.',
        effects: [{ type: 'release' }],
      },
      {
        chance: 0.65,
        text: 'O pedido foi negado sem muita explicação.',
        effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
      },
    ],
  },

  // --- Crime ---------------------------------------------------------------
  // A trilha de crime existe desde a Fase 4. Estas duas continuam porque são o
  // crime de quem NÃO fez carreira nele: sem requisito, sem escada, sem
  // reincidência que valha a pena. Quem leva a sério entra na trilha.
  {
    id: 'petty_theft',
    group: 'crime',
    label: 'Furtar',
    hint: 'Pouco dinheiro, risco pequeno, vergonha garantida se pegarem.',
    cost: 1,
    conditions: [{ type: 'age', min: 12 }],
    outcomes: [
      {
        chance: 0.65,
        luckBias: 0.5,
        text: 'Deu certo e ninguém viu.',
        effects: [{ type: 'money', delta: 3_000 }],
      },
      {
        chance: 0.35,
        text: 'Você foi pego. Assinou termo e ligaram para sua casa.',
        effects: [
          { type: 'stat', stat: 'reputation', op: 'delta', value: -14 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
          { type: 'flag', flag: 'criminal_record', value: true },
        ],
      },
    ],
  },
  {
    id: 'run_scam',
    group: 'crime',
    label: 'Aplicar um golpe',
    hint: 'Muito dinheiro se der certo. Ficha suja e dívida se não der.',
    cost: 2,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 18 },
      { type: 'stat', stat: 'charisma', min: 45 },
    ],
    outcomes: [
      {
        chance: 0.4,
        luckBias: 0.6,
        text: 'Funcionou. O dinheiro entrou e ninguém veio atrás.',
        effects: [
          { type: 'money', delta: 60_000 },
          { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
        ],
      },
      {
        chance: 0.6,
        text: 'Deu errado. Processo, advogado e o nome na lista.',
        effects: [
          { type: 'debt', delta: 40_000 },
          { type: 'stat', stat: 'reputation', op: 'delta', value: -25 },
          { type: 'flag', flag: 'criminal_record', value: true },
        ],
      },
    ],
  },
]
