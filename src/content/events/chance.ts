// Eventos de faixa larga. Existem para o sorteio de qualquer idade ter mais
// do que um punhado de opções — a repetição era o problema mais visível numa
// vida de sessenta turnos.

import type { GameEvent } from '../../engine/types'

export const CHANCE_EVENTS: GameEvent[] = [
  {
    id: 'chance_wrong_charge',
    category: 'random',
    weight: 9,
    cooldown: 5,
    conditions: [{ type: 'age', min: 18 }],
    text: 'Uma cobrança que você não reconhece aparece na fatura há três meses.',
    options: [
      {
        text: 'Brigar até resolver',
        outcomes: [
          {
            chance: 0.7,
            text: 'Quatro ligações e um protocolo depois, devolveram tudo.',
            effects: [{ type: 'money', delta: 4_000 }],
          },
          {
            chance: 0.3,
            text: 'Você perdeu horas de vida e não devolveram nada.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Deixar quieto',
        outcomes: [
          {
            chance: 1,
            text: 'Continuou saindo da conta por mais dois anos.',
            effects: [{ type: 'money', delta: -6_000 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_neighbour_feud',
    category: 'random',
    weight: 9,
    cooldown: 6,
    conditions: [{ type: 'age', min: 20 }],
    text: 'Seu vizinho começou uma obra que não termina e não deixa ninguém dormir.',
    options: [
      {
        text: 'Conversar',
        outcomes: [
          {
            chance: 0.55,
            text: 'Ele nem sabia que incomodava tanto. Mudaram o horário.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ele mandou você cuidar da sua vida.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Denunciar',
        outcomes: [
          {
            chance: 0.6,
            text: 'A obra parou. O vizinho descobriu quem denunciou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.4,
            text: 'Nada aconteceu, e agora vocês não se cumprimentam.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Comprar protetor de ouvido',
        outcomes: [
          {
            chance: 1,
            text: 'Funcionou melhor que qualquer conversa.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_found_wallet',
    category: 'random',
    weight: 9,
    cooldown: 8,
    conditions: [{ type: 'age', min: 12 }],
    text: 'Você achou uma carteira cheia na calçada, com documento e tudo.',
    options: [
      {
        text: 'Devolver',
        outcomes: [
          {
            chance: 0.7,
            text: 'A pessoa quase chorou. Você recusou a recompensa e aceitou o café.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.3,
            text: 'A pessoa conferiu se estava tudo lá, na sua frente, e foi embora.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
      {
        text: 'Ficar com o dinheiro',
        outcomes: [
          {
            chance: 1,
            text: 'Você tirou o dinheiro e deixou a carteira no correio.',
            effects: [
              { type: 'money', delta: 2_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_flood',
    category: 'random',
    weight: 8,
    cooldown: 10,
    conditions: [{ type: 'age', min: 15 }],
    text: 'A chuva alagou a rua e a água entrou na sua casa.',
    options: [
      {
        text: 'Salvar o que der',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você salvou o essencial. Perdeu móvel, não perdeu foto.',
            effects: [
              { type: 'money', delta: -20_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Perdeu quase tudo, e o que sobrou nunca mais cheirou igual.',
            effects: [
              { type: 'money', delta: -50_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -16 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Sair e não voltar até baixar',
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu na hora certa. As coisas se perdem, você não.',
            effects: [
              { type: 'money', delta: -35_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_old_teacher',
    category: 'random',
    weight: 8,
    cooldown: 12,
    conditions: [{ type: 'age', min: 25 }],
    text: 'Você reencontrou por acaso o professor que mudou alguma coisa em você.',
    options: [
      {
        text: 'Dizer isso a ele',
        outcomes: [
          {
            chance: 1,
            text: 'Ele não lembrava de você. Ouviu tudo e agradeceu de verdade.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 14 }],
          },
        ],
      },
      {
        text: 'Só cumprimentar',
        outcomes: [
          {
            chance: 1,
            text: 'Você cumprimentou e seguiu. Pensou nisso a semana toda.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_jury_duty',
    category: 'random',
    weight: 8,
    cooldown: 10,
    conditions: [{ type: 'age', min: 21 }],
    text: 'Você foi convocado para o júri de um caso que saiu no jornal.',
    options: [
      {
        text: 'Servir',
        outcomes: [
          {
            chance: 1,
            text: 'Foram semanas difíceis. Você nunca mais falou de justiça do mesmo jeito.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 5 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Arrumar uma justificativa',
        outcomes: [
          {
            chance: 1,
            text: 'Você escapou. Acompanhou o caso pelo jornal como todo mundo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_helped_stranger',
    category: 'random',
    weight: 9,
    cooldown: 7,
    conditions: [{ type: 'age', min: 16 }],
    text: 'Alguém passou mal na sua frente e ninguém em volta se mexeu.',
    options: [
      {
        text: 'Socorrer',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você segurou a pessoa até a ambulância chegar. Ela ficou bem.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.25,
            text: 'Você fez o que deu e não foi suficiente. Levou anos para digerir.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -14 }],
          },
        ],
      },
      {
        text: 'Chamar ajuda e sair',
        outcomes: [
          {
            chance: 1,
            text: 'Você ligou e foi embora antes de chegarem.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_reputation_online',
    category: 'random',
    weight: 9,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 20 },
      { type: 'stat', stat: 'reputation', min: 55 },
    ],
    text: 'Uma marca quer usar o seu nome numa campanha pequena.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.6,
            text: 'Pagou bem e ninguém achou estranho.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.4,
            text: 'A marca se meteu numa polêmica na semana seguinte, com a sua cara no anúncio.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -18 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Reputação também é o que você não assina.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_class_gap',
    category: 'random',
    weight: 8,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
      { type: 'netWorth', min: 400_000 },
    ],
    text: 'Você foi a um lugar onde ninguém veio de onde você veio, e todo mundo percebeu.',
    options: [
      {
        text: 'Fingir que sempre esteve ali',
        outcomes: [
          {
            chance: 0.5,
            text: 'Funcionou. Você aprendeu rápido as regras que ninguém explica.',
            effects: [{ type: 'stat', stat: 'charisma', op: 'delta', value: 8 }],
          },
          {
            chance: 0.5,
            text: 'Não funcionou, e passar a noite atuando foi pior que ter ficado em casa.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Contar de onde veio',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você contou sem pedir licença. Ganhou o respeito de quem valia.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Sorriram com educação e mudaram de assunto.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_gender_ceiling',
    category: 'career',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'hasCareer', value: true },
      { type: 'age', min: 25 },
    ],
    text: 'Você percebeu que a sala decide antes de você falar, e decide sem você.',
    options: [
      {
        text: 'Falar disso abertamente',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você levantou a questão e alguma coisa mudou. Pouca, mas mudou.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você virou "a que reclama", e isso pesou nas avaliações.',
            effects: [
              { type: 'performance', delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Trabalhar o dobro e provar',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você entregou o dobro e ninguém mais teve como ignorar.',
            effects: [
              { type: 'performance', delta: 18 },
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você entregou o dobro e continuaram ignorando.',
            effects: [
              { type: 'performance', delta: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_lottery_ticket_gift',
    category: 'random',
    weight: 7,
    cooldown: 8,
    conditions: [{ type: 'age', min: 18 }],
    text: 'Ganharam de presente um bilhete premiado de raspadinha para você.',
    options: [
      {
        text: 'Raspar',
        outcomes: [
          {
            chance: 0.05,
            bias: { luck: 1 },
            text: 'Deu. Não muda a vida, mas paga um ano.',
            effects: [{ type: 'money', delta: 90_000 }],
          },
          {
            chance: 0.95,
            text: 'Não deu nada, como sempre.',
            effects: [],
          },
        ],
      },
      {
        text: 'Guardar sem raspar',
        outcomes: [
          {
            chance: 1,
            text: 'Você guardou na carteira e esqueceu. Venceu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'chance_debt_collector',
    category: 'random',
    weight: 10,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 20 },
      { type: 'netWorth', max: 0 },
    ],
    text: 'Ligam todo dia no mesmo horário cobrando o que você não tem como pagar.',
    options: [
      {
        text: 'Negociar',
        outcomes: [
          {
            chance: 0.6,
            bias: { charisma: 0.35 },
            text: 'Você negociou um desconto grande para quitar à vista o que dava.',
            effects: [{ type: 'debt', delta: -60_000 }],
          },
          {
            chance: 0.4,
            text: 'A proposta era pior que a dívida. Você desligou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Parar de atender',
        outcomes: [
          {
            chance: 1,
            text: 'Você bloqueou os números. Ligam de outros.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },
]
