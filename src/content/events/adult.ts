// 30 a 59 anos: as escolhas custam mais caro e desfazem menos.

import type { GameEvent } from '../../engine/types'

export const ADULT_EVENTS: GameEvent[] = [
  {
    id: 'adult_midlife_crisis',
    category: 'health',
    weight: 12,
    once: true,
    conditions: [{ type: 'age', min: 38, max: 49 }],
    text: 'Você acordou numa terça-feira com a sensação de que a vida inteira foi decidida por outra pessoa.',
    options: [
      {
        text: 'Largar tudo e recomeçar',
        outcomes: [
          {
            chance: 0.4,
            bias: { luck: 0.6 },
            text: 'Deu certo. Você perdeu dinheiro e ganhou de volta o gosto de acordar.',
            effects: [
              { type: 'money', delta: -30000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
              { type: 'career', action: 'quit' },
            ],
          },
          {
            chance: 0.6,
            text: 'Você largou tudo e não achou nada do outro lado. Voltou pior.',
            effects: [
              { type: 'money', delta: -40000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'career', action: 'quit' },
            ],
          },
        ],
      },
      {
        text: 'Mudar uma coisa só',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você mudou uma coisa pequena e o resto foi junto. Sem drama.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.3,
            text: 'Não foi suficiente. A sensação continuou lá, esperando.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Engolir e seguir',
        outcomes: [
          {
            chance: 1,
            text: 'Você seguiu igual. Funcionou por mais alguns anos.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_health_scare',
    category: 'health',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 35, max: 59 },
      { type: 'stat', stat: 'health', max: 65 },
    ],
    text: 'O exame de rotina veio com uma alteração. O médico pediu para você voltar em duas semanas.',
    options: [
      {
        text: 'Investigar a fundo',
        requirements: [{ type: 'money', min: 4000 }],
        outcomes: [
          {
            chance: 0.65,
            text: 'Não era nada grave, e você pegou dois outros problemas cedo.',
            effects: [
              { type: 'money', delta: -4000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.35,
            text: 'Era sério. Pegaram a tempo, mas o tratamento vai durar.',
            effects: [
              { type: 'money', delta: -18000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
      {
        text: 'Esperar e ver',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.7 },
            text: 'Passou sozinho. Você teve sorte e sabe disso.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -2 }],
          },
          {
            chance: 0.55,
            text: 'Piorou. Quando você voltou ao médico já era outro tamanho de problema.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -18 },
              { type: 'money', delta: -12000 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_property_offer',
    category: 'career',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 30, max: 55 },
      { type: 'money', min: 60000 },
    ],
    text: 'Apareceu um apartamento bom, bem localizado, por um preço que não vai durar.',
    options: [
      {
        text: 'Comprar à vista',
        requirements: [{ type: 'money', min: 60000 }],
        outcomes: [
          {
            chance: 0.7,
            bias: { luck: 0.3 },
            text: 'A região valorizou. Foi a melhor decisão financeira que você tomou.',
            effects: [
              { type: 'asset', action: 'buy', assetId: 'apartment_small' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.3,
            text: 'O prédio tinha problema estrutural. Você descobriu depois da escritura.',
            effects: [
              { type: 'asset', action: 'buy', assetId: 'apartment_small' },
              { type: 'debt', delta: 25_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Financiar em vinte anos',
        outcomes: [
          {
            chance: 1,
            // O banco libera, você compra, e a dívida fica. É como funciona.
            text: 'Você assinou o financiamento. Vinte anos de parcela e a chave na mão.',
            effects: [
              { type: 'money', delta: 340_000 },
              { type: 'asset', action: 'buy', assetId: 'apartment_small' },
              { type: 'debt', delta: 390_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Deixar passar',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou passar. Continuou pagando aluguel e dormindo tranquil{o}.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_parent_illness',
    category: 'relationship',
    weight: 11,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 38, max: 59 },
      { type: 'anyOf', conditions: [
        { type: 'hasRelation', kind: 'mother' },
        { type: 'hasRelation', kind: 'father' },
      ] },
    ],
    text: 'Ligaram de madrugada. Um dos seus pais está internado e vai precisar de cuidado por meses.',
    options: [
      {
        text: 'Largar tudo e cuidar',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou o ano indo e voltando do hospital. Perdeu dinheiro e ganhou tempo com {ele}.',
            effects: [
              { type: 'money', delta: -25000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 20 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pagar um cuidador',
        requirements: [{ type: 'money', min: 40000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou o melhor cuidado que conseguiu e visitou nos fins de semana.',
            effects: [
              { type: 'money', delta: -40000 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 6 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 6 },
            ],
          },
        ],
      },
      {
        text: 'Deixar para os irmãos',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi. A família toda reparou e ninguém falou nada.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -25 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -25 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_burnout',
    category: 'health',
    weight: 10,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 30, max: 55 },
      { type: 'hasCareer', value: true },
    ],
    text: 'Faz meses que você trabalha sem sentir nada. Nem cansaço, nem satisfação. Só faz.',
    options: [
      {
        text: 'Tirar uma licença',
        outcomes: [
          {
            chance: 0.7,
            text: 'Três meses parad{o} recolocaram você no eixo. Voltou outr{o}.',
            effects: [
              { type: 'money', delta: -12000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'stat', stat: 'health', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você voltou da licença e a empresa já tinha te substituído na prática.',
            effects: [
              { type: 'money', delta: -12000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
              { type: 'career', action: 'fire' },
            ],
          },
        ],
      },
      {
        text: 'Procurar terapia',
        outcomes: [
          {
            chance: 0.8,
            text: 'Um ano de terapia. Você entendeu de onde vinha e parou de repetir.',
            effects: [
              { type: 'money', delta: -9000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.2,
            text: 'Você não engatou com a terapeuta e desistiu no terceiro mês.',
            effects: [{ type: 'money', delta: -2500 }],
          },
        ],
      },
      {
        text: 'Aguentar',
        outcomes: [
          {
            chance: 1,
            text: 'Você aguentou mais um ano. O corpo cobrou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_have_child',
    category: 'relationship',
    weight: 12,
    // O cooldown e a leitura de `chose_no_children` existem porque este evento
    // voltava TODO ANO ate os 44, inclusive para quem ja tinha respondido que
    // nao queria — e "adiar mais um pouco" custa 8 de relacao a cada vez.
    cooldown: 3,
    conditions: [
      { type: 'age', min: 27, max: 44 },
      { type: 'hasRelation', kind: 'spouse' },
      { type: 'flag', flag: 'has_child', value: false },
      { type: 'flag', flag: 'chose_no_children', value: false },
    ],
    text: '{conjuge} quis conversar sobre ter filho, e desta vez não foi hipotético.',
    options: [
      {
        text: 'Ter um filho',
        outcomes: [
          {
            chance: 0.85,
            bias: { luck: 0.3 },
            text: 'Nasceu saudável. Você não dormiu direito por dois anos e não trocaria por nada.',
            effects: [
              { type: 'addRelation', kind: 'child' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
              { type: 'money', delta: -20000 },
              { type: 'flag', flag: 'has_child', value: true },
            ],
          },
          {
            chance: 0.15,
            text: 'A gravidez foi complicada e não vingou. Levou tempo para vocês se recuperarem.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -18 },
              { type: 'money', delta: -15000 },
            ],
          },
        ],
      },
      {
        text: 'Adiar mais um pouco',
        outcomes: [
          {
            chance: 1,
            text: 'Vocês adiaram. A conversa volta todo ano, um pouco mais tensa.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -8 }],
          },
        ],
      },
      {
        text: 'Decidir que não vai ter',
        outcomes: [
          {
            chance: 0.6,
            text: 'Vocês decidiram juntos. Foi um alívio para os dois.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 10 },
              { type: 'flag', flag: 'chose_no_children', value: true },
            ],
          },
          {
            chance: 0.4,
            text: 'Só você decidiu. Foi o começo do fim.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -30 },
              { type: 'flag', flag: 'chose_no_children', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_old_friend',
    category: 'relationship',
    weight: 8,
    cooldown: 8,
    conditions: [{ type: 'age', min: 30, max: 55 }],
    text: 'Alguém que você não vê há quinze anos mandou mensagem. Quer marcar um café.',
    options: [
      {
        text: 'Marcar',
        outcomes: [
          {
            chance: 0.55,
            text: 'Foram quatro horas de conversa. Vocês retomaram como se nada tivesse passado.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.3,
            text: 'Ficou claro em vinte minutos que vocês viraram pessoas muito diferentes.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
          {
            chance: 0.15,
            text: 'Era pitch de um negócio. Você pagou o café e a conta da amizade.',
            effects: [
              { type: 'money', delta: -8000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Responder que está sem tempo',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou no vácuo educado. A mensagem não voltou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'adult_promotion_window',
    category: 'career',
    weight: 12,
    cooldown: 7,
    conditions: [
      { type: 'age', min: 30, max: 55 },
      { type: 'hasCareer', value: true },
    ],
    text: 'Abriu uma vaga de chefia acima de você. Tem outro candidato interno.',
    options: [
      {
        text: 'Disputar abertamente',
        requirements: [{ type: 'stat', stat: 'charisma', min: 50 }],
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.4 },
            text: 'Você levou a vaga. Salário maior e o dobro de reunião.',
            effects: [
              { type: 'performance', delta: 22 },
              { type: 'money', delta: 20_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você perdeu e agora responde para quem disputou com você.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Jogar sujo nos bastidores',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: -0.4 },
            text: 'Funcionou. Você levou a vaga e ninguém soube como.',
            effects: [
              { type: 'performance', delta: 22 },
              { type: 'money', delta: 20_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Descobriram. Você não levou a vaga e virou o cara em quem ninguém confia.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Não se candidatar',
        outcomes: [
          {
            chance: 1,
            text: 'Você não se candidatou. Continuou no que já sabia fazer.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
]
