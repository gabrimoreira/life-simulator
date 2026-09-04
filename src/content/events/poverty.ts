// A contrapartida de luxury.ts.
//
// A medida que motivou este arquivo: um rico de 45 anos tinha 38 eventos
// elegíveis; um pobre sem carreira e sem família, 20. O jogo tinha sete
// eventos sobre ter iate e nenhum sobre não ter o que comer — `socialClass`
// aparecia em três condições num catálogo de 152. A distribuição premiava
// quem já tinha vencido, que é o contrário do que um simulador de vida
// deveria fazer.
//
// O gate aqui é por DINHEIRO e PATRIMÔNIO, não só por classe de nascimento:
// quem quebrou aos cinquenta também mora nesta faixa.

import type { GameEvent } from '../../engine/types'

export const POVERTY_EVENTS: GameEvent[] = [
  {
    id: 'poverty_month_end',
    category: 'random',
    weight: 13,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 18 },
      { type: 'money', max: 3_000 },
      { type: 'netWorth', max: 20_000 },
    ],
    text: 'Faltam nove dias para o pagamento e faltam quase todos os dias de comida.',
    options: [
      {
        text: 'Pedir emprestado',
        outcomes: [
          {
            chance: 0.6,
            text: 'Conseguiram te emprestar. Você devolveu no mês seguinte, quase todo.',
            effects: [
              { type: 'money', delta: 900 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -10 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ninguém tinha. Todo mundo que você conhece está na mesma semana do mês.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -9 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Esticar o que tem',
        outcomes: [
          {
            chance: 1,
            text: 'Arroz, ovo e criatividade. Deu para os nove dias.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 2 },
            ],
          },
        ],
      },
      {
        text: 'Comprar fiado no mercado da esquina',
        outcomes: [
          {
            chance: 1,
            text: 'O caderninho do seu Antônio segurou mais um mês.',
            effects: [
              { type: 'debt', delta: 1_200 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_informal_hustle',
    category: 'career',
    weight: 12,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 16 },
      { type: 'hasCareer', value: false },
      { type: 'netWorth', max: 40_000 },
    ],
    text: 'Apareceu um corre. Não tem carteira, não tem garantia, e paga hoje.',
    options: [
      {
        text: 'Pegar',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você trabalhou o ano inteiro nisso e recebeu quase tudo o que combinaram.',
            effects: [
              { type: 'money', delta: 14_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você trabalhou três meses e o cara sumiu sem pagar o último.',
            effects: [
              { type: 'money', delta: 4_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Segurar e procurar coisa melhor',
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.3 },
            text: 'Apareceu coisa melhor. Valeu ter esperado.',
            effects: [
              { type: 'money', delta: 9_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.65,
            text: 'Não apareceu nada melhor, e o corre já tinha ido para outro.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_utility_cut',
    category: 'random',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 20 },
      { type: 'money', max: 5_000 },
    ],
    text: 'Cortaram a luz. A conta atrasada é de dois meses e a religação tem taxa.',
    options: [
      {
        text: 'Pagar tudo de uma vez',
        requirements: [{ type: 'money', min: 900 }],
        outcomes: [
          {
            chance: 1,
            text: 'Voltou no mesmo dia. Custou o que você tinha guardado para outra coisa.',
            effects: [
              { type: 'money', delta: -900 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Parcelar',
        outcomes: [
          {
            chance: 1,
            text: 'Parcelaram em seis vezes com juros. Voltou a luz e ficou a conta.',
            effects: [
              { type: 'debt', delta: 1_600 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -2 },
            ],
          },
        ],
      },
      {
        text: 'Passar o mês sem',
        outcomes: [
          {
            chance: 1,
            text: 'Vela, vizinho e geladeira vazia. Um mês é muito tempo assim.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -9 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_eviction',
    category: 'random',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'money', max: 2_000 },
      { type: 'not', condition: { type: 'ownsAsset', kind: 'property' } },
    ],
    text: 'O aluguel subiu de novo e o proprietário quer a casa de volta em trinta dias.',
    options: [
      {
        text: 'Voltar para a casa da família',
        requirements: [{ type: 'hasRelation', kind: 'mother' }],
        outcomes: [
          {
            chance: 1,
            text: 'Você voltou para o quarto onde cresceu, aos {age} anos.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
              { type: 'money', delta: 6_000 },
              { type: 'flag', flag: 'lives_alone', value: false },
            ],
          },
        ],
      },
      {
        text: 'Achar um lugar mais longe e mais barato',
        outcomes: [
          {
            chance: 1,
            text: 'Duas horas de ônibus para cada lado, todo dia, para caber no orçamento.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -15 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_school_shoes',
    category: 'childhood',
    weight: 12,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 7, max: 15 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
    ],
    text: 'O tênis furou e ainda faltam quatro meses para o fim do ano letivo.',
    options: [
      {
        text: 'Aguentar até dezembro',
        outcomes: [
          {
            chance: 0.55,
            text: 'Ninguém reparou, ou repararam e não falaram nada.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
          {
            chance: 0.45,
            text: 'Repararam, e alguém achou graça na frente da turma inteira.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'flag', flag: 'was_bullied', value: true },
            ],
          },
        ],
      },
      {
        text: 'Faltar até dar para comprar outro',
        outcomes: [
          {
            chance: 1,
            text: 'Você perdeu seis semanas de aula. Ninguém da escola ligou perguntando.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_family_support',
    category: 'relationship',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 25 },
      { type: 'money', min: 20_000 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
      { type: 'hasRelation', kind: 'mother' },
    ],
    text: 'Você foi o único da família que subiu. Todo mundo sabe disso, e todo mundo precisa.',
    options: [
      {
        text: 'Sustentar quem precisar',
        outcomes: [
          {
            chance: 1,
            text: 'Você virou o plano de saúde, o seguro-desemprego e o banco da família inteira.',
            effects: [
              { type: 'money', delta: -18_000 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 18 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Ajudar só quem você consegue',
        outcomes: [
          {
            chance: 1,
            text: 'Você ajudou uma pessoa e disse não para as outras. Não foi esquecido.',
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 6 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -12 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que também está apertado',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que não dava. Era mentira, e você sabe que eles sabem.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -18 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_free_clinic',
    category: 'health',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 20 },
      { type: 'money', max: 8_000 },
      { type: 'stat', stat: 'health', max: 60 },
    ],
    text: 'Você precisa de médico e a fila do posto abre às quatro da manhã.',
    options: [
      {
        text: 'Ir e esperar o que for preciso',
        outcomes: [
          {
            chance: 0.6,
            text: 'Conseguiu ficha, foi atendido, e o que era simples voltou a ser simples.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
            ],
          },
          {
            chance: 0.4,
            text: 'As fichas acabaram às seis. Você voltou para casa e para o trabalho.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -7 },
            ],
          },
        ],
      },
      {
        text: 'Deixar para quando piorar',
        outcomes: [
          {
            chance: 0.5,
            text: 'Melhorou sozinho, como quase sempre melhora.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -3 }],
          },
          {
            chance: 0.5,
            text: 'Piorou, e aí já era caso de emergência.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -16 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_first_appliance',
    category: 'random',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 20 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
      { type: 'money', min: 2_000, max: 60_000 },
    ],
    text: 'Dá para trocar a geladeira que faz barulho desde que você era criança.',
    options: [
      {
        text: 'Comprar à vista, a mais simples',
        requirements: [{ type: 'money', min: 2_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Chegou, coube na cozinha, e a casa inteira foi olhar.',
            effects: [
              { type: 'money', delta: -2_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
        ],
      },
      {
        text: 'Parcelar a boa em doze vezes',
        outcomes: [
          {
            chance: 1,
            text: 'Doze vezes com juros embutidos, mas é a melhor da rua.',
            effects: [
              { type: 'debt', delta: 5_500 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
        ],
      },
      {
        text: 'Consertar a velha mais uma vez',
        outcomes: [
          {
            chance: 1,
            text: 'O técnico disse que era a última vez. Ele diz isso desde 2014.',
            effects: [
              { type: 'money', delta: -300 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 2 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_pride_of_place',
    category: 'relationship',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 25 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
    ],
    text: 'Perguntaram de onde você é, e você percebeu que ia dar uma resposta curta.',
    options: [
      {
        text: 'Dizer o nome do bairro, inteiro',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você disse com todas as letras. A conversa continuou igual, ou melhor.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você disse, e a conversa mudou de assunto rápido demais.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Dar uma referência mais genérica',
        outcomes: [
          {
            chance: 1,
            text: '"Zona sul." Tecnicamente verdade, e você ficou pensando nisso depois.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 2 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'poverty_bus_fare_math',
    category: 'random',
    weight: 11,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 16 },
      { type: 'money', max: 4_000 },
    ],
    text: 'A passagem subiu de novo. Contando ida e volta, é quase um dia de trabalho por semana.',
    options: [
      {
        text: 'Ir a pé o trecho que der',
        outcomes: [
          {
            chance: 1,
            text: 'Quarenta minutos de caminhada por dia, chova ou faça sol.',
            effects: [
              { type: 'money', delta: 2_200 },
              { type: 'stat', stat: 'health', op: 'delta', value: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Continuar pagando',
        outcomes: [
          {
            chance: 1,
            text: 'Você continuou pagando e continuou não sobrando nada no fim do mês.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
]
