// 18 a 29 anos: a década em que quase tudo ainda dá para desfazer.

import type { GameEvent } from '../../engine/types'

export const YOUNG_ADULT_EVENTS: GameEvent[] = [
  {
    id: 'ya_university',
    category: 'school',
    weight: 16,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 23 },
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'enrolled', value: false },
      { type: 'not', condition: { type: 'education', level: 'bachelor', atLeast: true } },
    ],
    text: 'Saiu o resultado do vestibular. Você passou em duas coisas diferentes, e só dá para escolher uma.',
    options: [
      {
        text: 'Engenharia, na federal',
        requirements: [{ type: 'stat', stat: 'intelligence', min: 60 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você se matriculou em Engenharia. Agora é aguentar os anos.',
            effects: [{ type: 'enroll', courseId: 'engenharia' }],
          },
        ],
      },
      {
        text: 'Administração, na particular',
        outcomes: [
          {
            chance: 1,
            text: 'Você se matriculou em Administração. A mensalidade vai doer.',
            effects: [{ type: 'enroll', courseId: 'administracao' }],
          },
        ],
      },
      {
        text: 'Nenhuma das duas',
        outcomes: [
          {
            chance: 1,
            text: 'Você rasgou os dois resultados e foi procurar trabalho.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_move_out',
    category: 'relationship',
    weight: 12,
    once: true,
    conditions: [{ type: 'age', min: 19, max: 28 }],
    text: 'Você já pode sair de casa. O aluguel vai comer quase tudo que você ganha.',
    options: [
      {
        text: 'Alugar um lugar sozinh{o}',
        requirements: [{ type: 'money', min: 5000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Um quarto e sala, sem móveis. É pequeno, é seu, e o silêncio é ótimo.',
            effects: [
              { type: 'money', delta: -5000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -5 },
              { type: 'flag', flag: 'lives_alone', value: true },
            ],
          },
        ],
      },
      {
        text: 'Dividir apartamento',
        outcomes: [
          {
            chance: 0.6,
            luckBias: 0.4,
            text: 'Você caiu numa casa boa. Um dos colegas virou amizade para a vida.',
            effects: [
              { type: 'money', delta: -2000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
              { type: 'addRelation', kind: 'friend' },
              { type: 'flag', flag: 'lives_alone', value: true },
            ],
          },
          {
            chance: 0.4,
            text: 'Seus colegas de apartamento eram um pesadelo. Você aguentou o contrato inteiro.',
            effects: [
              { type: 'money', delta: -2000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'flag', flag: 'lives_alone', value: true },
            ],
          },
        ],
      },
      {
        text: 'Continuar na casa dos pais',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. Economizou bastante e ouviu muita pergunta sobre quando vai sair.',
            effects: [
              { type: 'money', delta: 8000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_first_real_job',
    category: 'career',
    weight: 14,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 18, max: 29 },
      { type: 'hasCareer', value: false },
    ],
    text: 'Apareceu uma vaga de verdade, com carteira assinada. A entrevista é na quinta.',
    options: [
      {
        text: 'Ir preparad{o}',
        requirements: [{ type: 'stat', stat: 'intelligence', min: 40 }],
        outcomes: [
          {
            chance: 0.7,
            luckBias: 0.4,
            text: 'Você passou. Primeiro emprego formal, primeiro contracheque de verdade.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
              { type: 'career', action: 'hire', trackId: 'clt' },
            ],
          },
          {
            chance: 0.3,
            text: 'Você foi bem e mesmo assim escolheram outr{o}. Sem explicação.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Ir no improviso',
        outcomes: [
          {
            chance: 0.35,
            luckBias: 0.8,
            text: 'Você improvisou tudo e passou. O entrevistador gostou do seu jeito.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: 7 },
              { type: 'career', action: 'hire', trackId: 'clt' },
            ],
          },
          {
            chance: 0.65,
            text: 'Ficou claro em cinco minutos que você não tinha se preparado.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -3 },
            ],
          },
        ],
      },
      {
        text: 'Não ir',
        outcomes: [
          {
            chance: 1,
            text: 'Você não apareceu. Ficou o ano inteiro pensando nisso.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -7 }],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_serious_relationship',
    category: 'relationship',
    weight: 11,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 20, max: 29 },
      { type: 'hasRelation', kind: 'partner' },
      { type: 'flag', flag: 'married', value: false },
    ],
    text: 'Vocês estão juntos há tempo suficiente para a pergunta aparecer sozinha.',
    options: [
      {
        text: 'Pedir em casamento',
        requirements: [{ type: 'money', min: 8000 }],
        outcomes: [
          {
            chance: 0.75,
            luckBias: 0.3,
            text: 'Disse sim. A festa foi pequena e não faltou ninguém que importava.',
            effects: [
              { type: 'money', delta: -8000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'addRelation', kind: 'spouse' },
              { type: 'removeRelation', target: { by: 'kind', kind: 'partner' } },
              { type: 'flag', flag: 'married', value: true },
            ],
          },
          {
            chance: 0.25,
            text: 'Disse não. Vocês terminaram na mesma semana.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -20 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'partner' } },
            ],
          },
        ],
      },
      {
        text: 'Morar junto e ver no que dá',
        outcomes: [
          {
            chance: 0.6,
            text: 'Morar junto revelou o melhor dos dois. Está funcionando.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'partner' }, delta: 15 },
            ],
          },
          {
            chance: 0.4,
            text: 'Morar junto revelou o pior dos dois. Durou oito meses.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'partner' } },
            ],
          },
        ],
      },
      {
        text: 'Deixar como está',
        outcomes: [
          {
            chance: 1,
            text: 'Você fugiu do assunto por mais um ano. A pergunta não sumiu.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'partner' }, delta: -10 }],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_crypto_pitch',
    category: 'career',
    weight: 9,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 20, max: 29 },
      { type: 'money', min: 5000 },
    ],
    text: 'Um conhecido do colégio te chamou para um investimento que "não tem como dar errado".',
    options: [
      {
        text: 'Colocar o que você tem',
        requirements: [{ type: 'money', min: 5000 }],
        outcomes: [
          {
            chance: 0.2,
            luckBias: 1,
            text: 'Multiplicou por seis em oito meses. Você sacou tudo a tempo.',
            effects: [
              { type: 'money', delta: 45000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
            ],
          },
          {
            chance: 0.8,
            text: 'Foi golpe. O conhecido sumiu do grupo e do país.',
            effects: [
              { type: 'money', delta: -5000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Colocar um valor pequeno',
        outcomes: [
          {
            chance: 0.25,
            luckBias: 0.8,
            text: 'Rendeu bem. Você ficou com gosto de quero mais e a lição de não exagerar.',
            effects: [{ type: 'money', delta: 6000 }],
          },
          {
            chance: 0.75,
            text: 'Perdeu tudo o que colocou. Deu para pagar a lição.',
            effects: [
              { type: 'money', delta: -1500 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Meses depois soube que a coisa toda era pirâmide.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_night_out',
    category: 'health',
    weight: 9,
    cooldown: 3,
    conditions: [{ type: 'age', min: 18, max: 28 }],
    text: 'Sexta à noite. O grupo já está no terceiro bar e ninguém quer ir para casa.',
    options: [
      {
        text: 'Ir até o fim',
        outcomes: [
          {
            chance: 0.6,
            text: 'Vocês viram o sol nascer na rua. Você não lembra de metade, mas foi ótimo.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 9 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
              { type: 'money', delta: -400 },
            ],
          },
          {
            chance: 0.25,
            text: 'Você perdeu a carteira e o celular. Voltou a pé.',
            effects: [
              { type: 'money', delta: -2500 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.15,
            text: 'Teve confusão na saída do bar e você entrou no meio.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pedir o carro e ir embora',
        outcomes: [
          {
            chance: 1,
            text: 'Você foi embora meia-noite e acordou bem no sábado. Ninguém morreu de saudade.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 2 },
              { type: 'money', delta: -150 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_side_hustle',
    category: 'career',
    weight: 10,
    cooldown: 3,
    conditions: [{ type: 'age', min: 19, max: 29 }],
    text: 'Dá para pegar um freela nos fins de semana. Vai comer o seu descanso inteiro.',
    options: [
      {
        text: 'Pegar tudo que aparecer',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você faturou bem no ano. Também não descansou um sábado sequer.',
            effects: [
              { type: 'money', delta: 18000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você entregou tudo no prazo e um cliente virou contato importante.',
            effects: [
              { type: 'money', delta: 22000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pegar um freela por mês',
        outcomes: [
          {
            chance: 1,
            text: 'Um por mês, sem sufoco. Deu para trocar o computador.',
            effects: [
              { type: 'money', delta: 7000 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Descansar',
        outcomes: [
          {
            chance: 1,
            text: 'Você usou os fins de semana para não fazer nada. Fez muito bem.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 7 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'ya_gym_habit',
    category: 'health',
    weight: 8,
    cooldown: 4,
    conditions: [{ type: 'age', min: 18, max: 29 }],
    text: 'Você anda sem fôlego subindo escada. A academia da esquina está com promoção de matrícula.',
    options: [
      {
        text: 'Assinar e ir de verdade',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você foi o ano inteiro. Virou parte da rotina, não sacrifício.',
            effects: [
              { type: 'money', delta: -1800 },
              { type: 'stat', stat: 'health', op: 'delta', value: 12 },
              { type: 'stat', stat: 'looks', op: 'delta', value: 7 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
          {
            chance: 0.5,
            text: 'Você foi três semanas e nunca mais. A mensalidade continuou saindo.',
            effects: [
              { type: 'money', delta: -1800 },
              { type: 'stat', stat: 'health', op: 'delta', value: 2 },
            ],
          },
        ],
      },
      {
        text: 'Correr na rua de graça',
        outcomes: [
          {
            chance: 0.55,
            text: 'Correr virou hábito. De graça e melhor que academia.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 9 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Choveu, depois esfriou, depois você desistiu.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 1 }],
          },
        ],
      },
      {
        text: 'Deixar para o ano que vem',
        outcomes: [
          {
            chance: 1,
            text: 'Você adiou. A escada continuou vencendo.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
]
