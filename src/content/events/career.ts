// Eventos que só existem por causa de carreira e faculdade. Todos gatilhados
// por estado real — `hasCareer`, `careerKind`, `enrolled`, `performance` —
// e não por flags soltas.

import type { GameEvent } from '../../engine/types'

export const CAREER_EVENTS: GameEvent[] = [
  {
    id: 'career_headhunter',
    category: 'career',
    weight: 9,
    cooldown: 6,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'careerKind', kind: 'clt' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Um recrutador te achou no LinkedIn com uma proposta de outra empresa.',
    options: [
      {
        text: 'Ir para a entrevista',
        outcomes: [
          {
            chance: 0.45,
            bias: { charisma: 0.35, reputation: 0.2 },
            text: 'A proposta era boa e você usou como alavanca onde já estava.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'performance', delta: 8 },
            ],
          },
          {
            chance: 0.35,
            text: 'A proposta era pior do que parecia. Você ficou onde estava.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
          {
            chance: 0.2,
            text: 'Seu chefe descobriu que você estava conversando por fora.',
            effects: [
              { type: 'performance', delta: -18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Agradecer e recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou sem nem perguntar o salário.',
            effects: [{ type: 'performance', delta: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'career_layoff_wave',
    category: 'career',
    weight: 6,
    cooldown: 12,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'careerKind', kind: 'clt' },
    ],
    text: 'A empresa anunciou corte de 20% do quadro. A lista sai na sexta.',
    options: [
      {
        text: 'Aparecer o máximo possível',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você sobreviveu ao corte. Metade do seu time, não.',
            effects: [
              { type: 'performance', delta: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Seu nome estava na lista mesmo assim.',
            effects: [
              { type: 'career', action: 'fire' },
              { type: 'money', delta: 15_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Pedir para sair na lista, com acordo',
        outcomes: [
          {
            chance: 1,
            text: 'Você negociou a saída e levou uma rescisão decente.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'money', delta: 30_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_business_offer',
    category: 'career',
    weight: 9,
    cooldown: 7,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'careerKind', kind: 'business' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Um concorrente maior ofereceu comprar o seu negócio.',
    options: [
      {
        text: 'Vender e sair',
        outcomes: [
          {
            chance: 1,
            text: 'Você vendeu. Acabou com dinheiro no bolso e um vazio na agenda.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'money', delta: 250_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Recusar e brigar por mercado',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.4 },
            text: 'Você segurou o mercado e saiu maior da briga.',
            effects: [{ type: 'performance', delta: 15 }],
          },
          {
            chance: 0.5,
            text: 'O concorrente te esmagou em preço por dois anos seguidos.',
            effects: [
              { type: 'performance', delta: -18 },
              { type: 'money', delta: -60_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_scandal',
    category: 'career',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'careerKind', kind: 'celebrity' },
      { type: 'stat', stat: 'fame', min: 30 },
    ],
    text: 'Vazou um áudio seu falando mal de quem te deu a primeira chance.',
    options: [
      {
        text: 'Pedir desculpas publicamente',
        outcomes: [
          {
            chance: 0.6,
            text: 'O pedido soou sincero e a história morreu em duas semanas.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'O pedido soou ensaiado e virou meme.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -18 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 10 },
              { type: 'performance', delta: -10 },
            ],
          },
        ],
      },
      {
        text: 'Peitar e dobrar a aposta',
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.5 },
            text: 'Funcionou. Metade da internet passou a te achar autêntic{o}.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 16 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.65,
            text: 'Você perdeu dois contratos publicitários na mesma semana.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -22 },
              { type: 'money', delta: -80_000 },
              { type: 'performance', delta: -15 },
            ],
          },
        ],
      },
      {
        text: 'Sumir por um tempo',
        outcomes: [
          {
            chance: 1,
            text: 'Você sumiu seis meses. A internet esqueceu — e esqueceu de você junto.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: -14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_viral',
    category: 'career',
    weight: 10,
    cooldown: 4,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'careerKind', kind: 'celebrity' },
    ],
    text: 'Uma coisa boba que você postou começou a explodir.',
    options: [
      {
        text: 'Surfar a onda o quanto der',
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.5 },
            text: 'Você aproveitou a janela inteira. Ganhou público que ficou.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 18 },
              { type: 'money', delta: 30_000 },
              { type: 'performance', delta: 8 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você forçou a barra e o público percebeu.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 5 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Deixar passar e seguir o plano',
        outcomes: [
          {
            chance: 1,
            text: 'Você não mudou nada por causa de um pico. Foi maduro e foi chato.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 6 },
              { type: 'performance', delta: 5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_burnout_semester',
    category: 'school',
    weight: 10,
    cooldown: 3,
    conditions: [
      { type: 'enrolled', value: true },
      { type: 'stat', stat: 'happiness', max: 40 },
    ],
    text: 'O semestre está te engolindo. Dá para segurar, ou dá para trancar.',
    options: [
      {
        text: 'Segurar até o fim',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você segurou. Passou raspando em tudo, mas passou.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você segurou e o corpo cobrou a conta inteira de uma vez.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Trancar o curso',
        outcomes: [
          {
            chance: 1,
            text: 'Você trancou. Foi um alívio imediato e um arrependimento lento.',
            effects: [
              { type: 'dropOut' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_professor_offer',
    category: 'career',
    weight: 7,
    cooldown: 8,
    conditions: [
      { type: 'education', level: 'postgrad', atLeast: true },
      { type: 'hasCareer', value: false },
      { type: 'age', min: 26 },
    ],
    text: 'A faculdade onde você estudou está com vaga para dar aula.',
    options: [
      {
        text: 'Aceitar dar aula',
        outcomes: [
          {
            chance: 1,
            text: 'Você começou a dar aula. Paga pouco, mas ninguém te demite.',
            effects: [
              { type: 'career', action: 'hire', trackId: 'clt' },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Não era o que você tinha estudado tanto para fazer.',
            effects: [],
          },
        ],
      },
    ],
  },

  {
    id: 'career_underperformer_warning',
    category: 'career',
    weight: 11,
    cooldown: 3,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'performance', max: 35 },
    ],
    text: 'Seu chefe marcou uma conversa de quinze minutos. Não é sobre promoção.',
    options: [
      {
        text: 'Prometer virar o jogo',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você virou o jogo nos meses seguintes.',
            effects: [
              { type: 'performance', delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você prometeu e não entregou. A próxima conversa foi mais curta.',
            effects: [{ type: 'performance', delta: -8 }],
          },
        ],
      },
      {
        text: 'Falar o que realmente pensa',
        outcomes: [
          {
            chance: 0.3,
            bias: { luck: 0.4 },
            text: 'Ele ouviu. Mudou o que dava para mudar, e você voltou a render.',
            effects: [
              { type: 'performance', delta: 25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.7,
            text: 'Ele não ouviu, e agora você é o problema.',
            effects: [
              { type: 'performance', delta: -20 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'career_earned_the_seat',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'hasCareer', value: true },
      { type: 'performance', min: 78 },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'A vaga acima da sua abriu, e o seu nome foi o primeiro que apareceu na conversa.',
    options: [
      {
        text: 'Assumir',
        outcomes: [
          {
            chance: 1,
            // `career: 'promote'` checa os requisitos do nível de destino
            // desde 210d33e — quem não os cumpre não sobe, e o efeito não vira
            // um atalho para furar a tabela.
            text: 'Você assumiu, e a sala mudou de tamanho.',
            effects: [
              { type: 'career', action: 'promote' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Indicar outra pessoa',
        outcomes: [
          {
            chance: 1,
            text: 'Você indicou quem merecia mais, e todo mundo soube que foi você.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
              { type: 'performance', delta: -8 },
            ],
          },
        ],
      },
    ],
  },
]
