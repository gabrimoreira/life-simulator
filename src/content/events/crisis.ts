// Crise: o que acontece quando a infelicidade dura.
//
// O spec pede eventos de crise "se a felicidade zerar por VÁRIOS turnos", e
// até a Fase 6 existiam dois gates instantâneos de felicidade baixa em 193
// eventos. A diferença importa: um gate instantâneo dispara no primeiro ano
// ruim de uma vida boa, e o que o spec descreve é a espiral — o ano ruim que
// vira década.
//
// Todo evento aqui lê `unhappyYears`, o contador que zera no primeiro ano bom.
// A escada é deliberada: dois anos é um mau momento, cinco é um estado, dez é
// uma vida inteira sendo vivida errado. Os textos escalam junto.

import type { GameEvent } from '../../engine/types'

export const CRISIS_EVENTS: GameEvent[] = [
  {
    id: 'crisis_two_years',
    category: 'health',
    weight: 14,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 16 },
      { type: 'unhappyYears', min: 2 },
    ],
    text: 'Faz dois anos que você acorda com a mesma sensação. Não é um dia ruim: é o padrão.',
    options: [
      {
        text: 'Procurar ajuda profissional',
        outcomes: [
          {
            chance: 0.7,
            text: 'Levou meses para engrenar, e engrenou. Você começou a conseguir nomear as coisas.',
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
              { type: 'flag', flag: 'sought_help', value: true },
            ],
          },
          {
            chance: 0.3,
            text: 'Você não se deu com a primeira pessoa e não procurou uma segunda.',
            effects: [
              { type: 'money', delta: -2_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Contar para alguém de casa',
        requirements: [{ type: 'relationCount', kind: 'friend', min: 1, minRelation: 50 }],
        outcomes: [
          {
            chance: 0.6,
            text: 'Você falou em voz alta pela primeira vez, e a conversa durou até de madrugada.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 15 },
            ],
          },
          {
            chance: 0.4,
            text: 'Mandaram você se distrair, que é o que as pessoas dizem sem saber o que dizer.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Continuar tocando',
        outcomes: [
          {
            chance: 1,
            text: 'Você seguiu, porque é o que dá para fazer quando não se sabe fazer outra coisa.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crisis_burnout',
    category: 'career',
    weight: 13,
    cooldown: 5,
    conditions: [
      { type: 'unhappyYears', min: 3 },
      { type: 'hasCareer', value: true },
    ],
    text: 'Você chegou no ponto de olhar para a tela e não conseguir começar. Faz semanas assim.',
    options: [
      {
        text: 'Tirar licença',
        outcomes: [
          {
            chance: 0.65,
            text: 'Três meses parado. Voltou diferente, e o trabalho estava lá esperando.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'stat', stat: 'health', op: 'delta', value: 10 },
              { type: 'performance', delta: -15 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você tirou a licença e passou os três meses esperando eles te ligarem. Não ligaram.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'career', action: 'fire' },
            ],
          },
        ],
      },
      {
        text: 'Pedir demissão e respirar',
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu sem ter para onde ir, e foi a primeira noite de sono em três anos.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 26 },
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
            ],
          },
        ],
      },
      {
        text: 'Aguentar mais um ano',
        outcomes: [
          {
            chance: 1,
            text: 'Mais um ano. Você já não lembra de quando não era assim.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -9 },
              { type: 'performance', delta: -10 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crisis_withdrawal',
    category: 'relationship',
    weight: 12,
    cooldown: 4,
    conditions: [{ type: 'unhappyYears', min: 4 }],
    text: 'Você parou de responder mensagens. Não por raiva — só não sobra nada para responder com.',
    options: [
      {
        text: 'Forçar-se a sair de casa',
        outcomes: [
          {
            chance: 0.55,
            text: 'Foi difícil e foi bom. Você lembrou de como era estar entre gente.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 12 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você foi, ficou vinte minutos e voltou. Pelo menos foi.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 4 }],
          },
        ],
      },
      {
        text: 'Deixar todo mundo para lá',
        outcomes: [
          {
            chance: 1,
            text: 'As pessoas param de convidar quem nunca vai. Elas pararam.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -25 },
              { type: 'flag', flag: 'lives_alone', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crisis_bottom',
    category: 'health',
    weight: 14,
    cooldown: 6,
    conditions: [{ type: 'unhappyYears', min: 6 }],
    text: 'Seis anos. Em algum momento isso deixou de ser uma fase e virou a sua vida.',
    options: [
      {
        text: 'Mudar de cidade, de trabalho, do que der',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.3 },
            text: 'Você arrancou tudo pela raiz e recomeçou. Deu certo, contra o que era razoável esperar.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'set', value: 60 },
              { type: 'money', delta: -25_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -20 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você mudou tudo e levou você junto, que era o problema.',
            effects: [
              { type: 'money', delta: -25_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
        ],
      },
      {
        text: 'Tratamento sério, com tudo o que isso implica',
        outcomes: [
          {
            chance: 0.75,
            text: 'Foi longo, foi caro, e funcionou. Ninguém te devolveu os seis anos.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'stat', stat: 'happiness', op: 'set', value: 55 },
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'flag', flag: 'sought_help', value: true },
            ],
          },
          {
            chance: 0.25,
            text: 'Você tentou. Melhorou um pouco, que já é diferente de não melhorar.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'flag', flag: 'sought_help', value: true },
            ],
          },
        ],
      },
      {
        text: 'Nada. De novo.',
        outcomes: [
          {
            chance: 1,
            text: 'Mais um ano igual, e o corpo começou a cobrar o que a cabeça vinha cobrando.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crisis_after_help',
    category: 'health',
    weight: 11,
    once: true,
    conditions: [
      { type: 'flag', flag: 'sought_help', value: true },
      { type: 'age', min: 30 },
      { type: 'stat', stat: 'happiness', min: 55 },
    ],
    text: 'Faz tempo que você está bem. Bem o bastante para pensar em parar o acompanhamento.',
    options: [
      {
        text: 'Parar',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você parou e continuou bem. Aprendeu o que precisava aprender.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
          {
            chance: 0.45,
            text: 'Você parou, e oito meses depois estava de volta ao mesmo lugar.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -24 }],
          },
        ],
      },
      {
        text: 'Continuar mesmo estando bem',
        outcomes: [
          {
            chance: 1,
            text: 'Você manteve, porque manutenção é mais barata que reconstrução.',
            effects: [
              { type: 'money', delta: -4_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },
]
