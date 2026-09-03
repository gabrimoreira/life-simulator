// Infância: 0 a 12 anos. Pouca agência, consequências que duram.

import type { GameEvent } from '../../engine/types'

export const CHILDHOOD_EVENTS: GameEvent[] = [
  {
    id: 'childhood_first_word',
    category: 'childhood',
    weight: 12,
    once: true,
    conditions: [{ type: 'age', min: 1, max: 2 }],
    text: 'Você está aprendendo a falar. A casa inteira aposta em qual vai ser a primeira palavra.',
    options: [
      {
        text: 'Chamar pela mãe',
        outcomes: [
          {
            chance: 1,
            text: '"Mamãe". {mother} chorou e ligou para todo mundo que conhece.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Chamar pelo pai',
        outcomes: [
          {
            chance: 1,
            text: '"Papai". {father} passou o resto do ano contando essa história.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Dizer "não"',
        outcomes: [
          {
            chance: 1,
            text: 'Sua primeira palavra foi "não". Seus pais entenderam o recado cedo.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_stray_dog',
    category: 'childhood',
    weight: 9,
    once: true,
    conditions: [{ type: 'age', min: 5, max: 11 }],
    text: 'Um cachorro magro apareceu no portão de casa e não quer ir embora.',
    options: [
      {
        text: 'Implorar para ficar com ele',
        outcomes: [
          {
            chance: 0.65,
            luckBias: 0.5,
            text: 'Seus pais cederam. Ele dorme no seu pé todas as noites.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
              { type: 'money', delta: -600 },
              { type: 'flag', flag: 'had_pet', value: true },
            ],
          },
          {
            chance: 0.35,
            text: 'Não teve jeito. Levaram o cachorro embora antes de você acordar.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Levar até um abrigo',
        outcomes: [
          {
            chance: 1,
            text: 'Você caminhou três quilômetros com ele no colo até o abrigo. Voltou cansad{o} e em paz.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Fingir que não viu',
        outcomes: [
          {
            chance: 1,
            text: 'Você fechou a janela. No dia seguinte ele não estava mais lá.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_recess_bully',
    category: 'childhood',
    weight: 8,
    cooldown: 3,
    conditions: [{ type: 'age', min: 7, max: 12 }],
    text: 'Um colega mais velho começou a te empurrar no recreio, todo dia, na frente dos outros.',
    options: [
      {
        text: 'Revidar',
        outcomes: [
          {
            chance: 0.45,
            luckBias: 0.6,
            text: 'Você revidou uma vez só. Nunca mais encostaram em você.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.55,
            text: 'Você apanhou e ainda foi suspens{o}. Seus pais não gostaram nada.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -6 },
            ],
          },
        ],
      },
      {
        text: 'Contar para a professora',
        outcomes: [
          {
            chance: 0.6,
            text: 'A escola chamou os pais dele. Parou na hora.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 5 }],
          },
          {
            chance: 0.4,
            text: 'A escola não fez nada e agora te chamam de dedo-duro.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Aguentar calad{o}',
        outcomes: [
          {
            chance: 1,
            text: 'Você aguentou o ano inteiro sem falar nada. Aprendeu a ficar pequen{o}.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
              { type: 'flag', flag: 'was_bullied', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_thick_book',
    category: 'childhood',
    weight: 10,
    cooldown: 3,
    conditions: [{ type: 'age', min: 6, max: 12 }],
    text: '{mother} te deu de aniversário um livro grosso, sem figuras, com letra miúda.',
    options: [
      {
        text: 'Ler do começo ao fim',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você levou meses, mas terminou. Descobriu que gosta disso.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 7 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 5 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você travou na página quarenta e nunca mais voltou.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 2 }],
          },
        ],
      },
      {
        text: 'Ler só os pedaços interessantes',
        outcomes: [
          {
            chance: 1,
            text: 'Você pulou direto para as partes boas. Funcionou.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 4 }],
          },
        ],
      },
      {
        text: 'Deixar na estante',
        outcomes: [
          {
            chance: 1,
            text: 'O livro ficou na estante juntando poeira. {mother} reparou.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_move_away',
    category: 'childhood',
    weight: 6,
    once: true,
    conditions: [{ type: 'age', min: 4, max: 12 }],
    text: 'A família vai se mudar de {city}. Você vai perder todos os seus amigos de uma vez.',
    options: [
      {
        text: 'Encarar como aventura',
        outcomes: [
          {
            chance: 0.6,
            luckBias: 0.4,
            text: 'Na escola nova você virou novidade. Fez amigos na primeira semana.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: 6 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'Demorou um ano inteiro até alguém sentar com você no almoço.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Chorar e brigar com todo mundo',
        outcomes: [
          {
            chance: 1,
            text: 'A mudança aconteceu do mesmo jeito. Só que agora com todo mundo de mal.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -8 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_sweet_jar',
    category: 'childhood',
    weight: 8,
    cooldown: 3,
    conditions: [{ type: 'age', min: 4, max: 10 }],
    text: 'O pote de doce está em cima da geladeira. Não tem ninguém em casa.',
    options: [
      {
        text: 'Comer tudo',
        outcomes: [
          {
            chance: 0.5,
            text: 'Valeu cada segundo. A dor de barriga também.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você derrubou o pote. O barulho entregou tudo.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pegar só um',
        outcomes: [
          {
            chance: 1,
            text: 'Você pegou um e recolocou o pote no lugar exato. Crime perfeito.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Esperar e pedir',
        outcomes: [
          {
            chance: 1,
            text: 'Você esperou {mother} chegar e pediu. Ganhou dois.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_school_team',
    category: 'childhood',
    weight: 9,
    cooldown: 3,
    conditions: [{ type: 'age', min: 8, max: 12 }],
    text: 'A escola está montando o time e a biblioteca abriu turma de xadrez. Os dois no mesmo horário.',
    options: [
      {
        text: 'Entrar para o time',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você não era o melhor, mas corria mais que todo mundo.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.25,
            text: 'Você torceu o tornozelo no primeiro treino e ficou de fora o ano todo.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Ir para o xadrez',
        outcomes: [
          {
            chance: 1,
            text: 'Você perdeu quase todas as partidas do primeiro semestre. Depois parou de perder.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Ficar em casa vendo TV',
        outcomes: [
          {
            chance: 1,
            text: 'Você viu televisão até enjoar. O ano passou rápido e não sobrou nada dele.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 2 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'childhood_rusty_bike',
    category: 'childhood',
    weight: 8,
    once: true,
    conditions: [{ type: 'age', min: 6, max: 10 }],
    text: 'Tem uma bicicleta velha encostada na garagem. Ninguém usa há anos.',
    options: [
      {
        text: 'Aprender sozinh{o}',
        outcomes: [
          {
            chance: 0.55,
            luckBias: 0.5,
            text: 'Você caiu umas vinte vezes e aprendeu numa tarde. Ninguém viu, mas você sabe.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você caiu feio, ralou o joelho inteiro e desistiu por enquanto.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Pedir ajuda a {father}',
        outcomes: [
          {
            chance: 1,
            text: '{father} segurou o selim correndo atrás de você a tarde inteira. Soltou sem avisar.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 7 },
            ],
          },
        ],
      },
    ],
  },
]
