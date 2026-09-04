// Amizade, vizinhança e as pessoas que aparecem sem aviso. Faixas largas de
// propósito: a vida social não tem idade de começo nem de fim.

import type { GameEvent } from '../../engine/types'

export const SOCIAL_EVENTS: GameEvent[] = [
  {
    id: 'social_best_friend',
    category: 'relationship',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 12 },
      { type: 'relationCount', kind: 'friend', min: 1 },
    ],
    text: 'Um amigo seu está passando por uma coisa grande e não pediu nada a ninguém.',
    options: [
      {
        text: 'Aparecer sem ser chamado',
        outcomes: [
          {
            chance: 0.8,
            text: 'Você apareceu. Foi disso que ele precisava e não sabia pedir.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 30 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.2,
            text: 'Ele quis ficar sozinho e você respeitou depois de insistir demais.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -8 }],
          },
        ],
      },
      {
        text: 'Esperar ele chamar',
        outcomes: [
          {
            chance: 1,
            text: 'Ele nunca chamou. Vocês se falam menos desde então.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_friend_borrows',
    category: 'relationship',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 18 },
      { type: 'relationCount', kind: 'friend', min: 1 },
      { type: 'money', min: 15_000 },
    ],
    text: 'Um amigo pediu dinheiro emprestado, e você sabe que ele não vai poder devolver.',
    options: [
      {
        text: 'Dar, e chamar de presente',
        outcomes: [
          {
            chance: 1,
            text: 'Você deu e disse que era presente. Salvou o dinheiro e a amizade.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 20 },
            ],
          },
        ],
      },
      {
        text: 'Emprestar de verdade',
        outcomes: [
          {
            chance: 0.3,
            text: 'Ele devolveu tudo, e mais rápido do que combinaram.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 15 }],
          },
          {
            chance: 0.7,
            text: 'Ele não devolveu e passou a evitar você.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -35 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que não dá',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que não dava. Ele entendeu e algo ficou diferente.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -12 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_group_splits',
    category: 'relationship',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 16 },
      { type: 'relationCount', kind: 'friend', min: 2 },
    ],
    text: 'Dois amigos seus brigaram feio e os dois querem que você escolha um lado.',
    options: [
      {
        text: 'Não escolher lado',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você segurou a ponte. Meses depois eles voltaram a se falar por sua causa.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 15 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.5,
            text: 'Os dois acharam que você ficou do lado do outro.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -20 }],
          },
        ],
      },
      {
        text: 'Escolher quem tem razão',
        outcomes: [
          {
            chance: 1,
            text: 'Você escolheu. Ganhou um amigo mais próximo e perdeu o outro.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 20 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'friend' } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_wedding_invite',
    category: 'relationship',
    weight: 9,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 20, max: 60 },
      { type: 'relationCount', kind: 'friend', min: 1 },
    ],
    text: 'Casamento de amigo em outra cidade, no fim de semana em que você já tinha planos.',
    options: [
      {
        text: 'Ir',
        outcomes: [
          {
            chance: 1,
            text: 'Você foi, gastou mais do que devia e não se arrependeu.',
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Mandar presente e desculpa',
        outcomes: [
          {
            chance: 1,
            text: 'Você mandou um presente caro. Não é a mesma coisa e todo mundo sabe.',
            effects: [
              { type: 'money', delta: -3_000 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_teen_first_party',
    category: 'relationship',
    weight: 10,
    cooldown: 3,
    conditions: [{ type: 'age', min: 13, max: 19 }],
    text: 'Te chamaram para uma festa onde você não conhece quase ninguém.',
    options: [
      {
        text: 'Ir sozinho mesmo assim',
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.4 },
            text: 'Você foi e voltou com dois números de telefone.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: 8 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.45,
            text: 'Você passou duas horas encostado numa parede olhando o celular.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Não ir',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi e ficou aliviado por uns vinte minutos.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_teen_secret',
    category: 'relationship',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'age', min: 13, max: 20 }],
    text: 'Um amigo te contou uma coisa séria e pediu para não contar a ninguém. É séria demais.',
    options: [
      {
        text: 'Contar para um adulto',
        outcomes: [
          {
            chance: 0.65,
            text: 'Foi a coisa certa. Ele demorou meses para falar com você de novo, e falou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.35,
            text: 'O adulto não fez nada e o seu amigo soube que você contou.',
            effects: [
              { type: 'removeRelation', target: { by: 'kind', kind: 'friend' } },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Guardar segredo',
        outcomes: [
          {
            chance: 1,
            text: 'Você guardou. Carregou aquilo sozinho por muito tempo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_teen_sports_cut',
    category: 'health',
    weight: 9,
    once: true,
    conditions: [{ type: 'age', min: 13, max: 18 }],
    text: 'Você não passou no corte do time da escola, e a lista está no mural.',
    options: [
      {
        text: 'Treinar sozinho o ano todo',
        outcomes: [
          {
            chance: 0.55,
            text: 'No ano seguinte você entrou. Ninguém treinou mais que você.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Você treinou o ano inteiro e não passou de novo.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Largar esporte',
        outcomes: [
          {
            chance: 1,
            text: 'Você largou. Não voltou a jogar nada por muitos anos.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_teen_part_time',
    category: 'career',
    weight: 9,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 14, max: 18 },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle', 'middle'] },
    ],
    text: 'Dá para trabalhar nas férias e ter o seu próprio dinheiro pela primeira vez.',
    options: [
      {
        text: 'Trabalhar',
        outcomes: [
          {
            chance: 1,
            text: 'Você trabalhou dois meses e comprou uma coisa com dinheiro que era seu.',
            effects: [
              { type: 'money', delta: 4_000 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
        ],
      },
      {
        text: 'Aproveitar as férias',
        outcomes: [
          {
            chance: 1,
            text: 'Você não fez nada por dois meses. Foram ótimos.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_reconnect_ex',
    category: 'relationship',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 26 },
      { type: 'not', condition: { type: 'hasRelation', kind: 'spouse' } },
      { type: 'not', condition: { type: 'hasRelation', kind: 'partner' } },
    ],
    text: 'Alguém com quem você já teve alguma coisa mandou mensagem depois de anos.',
    options: [
      {
        text: 'Responder',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'Vocês se reencontraram e desta vez o momento era outro.',
            effects: [
              { type: 'addRelation', kind: 'partner' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.55,
            text: 'Ficou claro em duas semanas por que não tinha dado certo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Não responder',
        outcomes: [
          {
            chance: 1,
            text: 'Você leu, não respondeu, e apagou a conversa depois de uma semana.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_mentor_someone',
    category: 'career',
    weight: 9,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 32 },
      { type: 'hasCareer', value: true },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Alguém no começo da carreira pediu para você orientar. Vai custar tempo que você não tem.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você orientou por dois anos e viu a pessoa passar por onde você não conseguiu.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.25,
            text: 'A pessoa sumiu depois de três conversas.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
      {
        text: 'Dizer que não tem tempo',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que não tinha tempo, e era verdade.',
            effects: [{ type: 'performance', delta: 5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_community',
    category: 'relationship',
    weight: 9,
    cooldown: 7,
    conditions: [{ type: 'age', min: 25 }],
    text: 'O bairro está se organizando por causa de um problema que atinge todo mundo.',
    options: [
      {
        text: 'Entrar na organização',
        outcomes: [
          {
            chance: 0.65,
            text: 'Vocês conseguiram. Você passou a conhecer o nome de metade da rua.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 14 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.35,
            text: 'Reuniões e mais reuniões, e o problema continuou igual.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Assinar o abaixo-assinado e parar por aí',
        outcomes: [
          {
            chance: 1,
            text: 'Você assinou e seguiu a vida.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_pet_dies',
    category: 'relationship',
    weight: 9,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 15 },
      { type: 'flag', flag: 'had_pet', value: true },
    ],
    text: 'Seu cachorro está velho e o veterinário foi honesto com você.',
    options: [
      {
        text: 'Fazer o tratamento caro',
        requirements: [{ type: 'money', min: 15_000 }],
        outcomes: [
          {
            chance: 0.4,
            text: 'Ganharam mais dois anos juntos. Valeu cada centavo.',
            effects: [
              { type: 'money', delta: -15_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.6,
            text: 'Não adiantou. Você gastou e perdeu do mesmo jeito.',
            effects: [
              { type: 'money', delta: -15_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -16 },
              { type: 'flag', flag: 'had_pet', value: false },
            ],
          },
        ],
      },
      {
        text: 'Ficar junto até o fim',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou até o fim, com a mão nele. Foi a coisa certa e doeu igual.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
              { type: 'flag', flag: 'had_pet', value: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'social_second_chance_love',
    category: 'relationship',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 55 },
      { type: 'not', condition: { type: 'hasRelation', kind: 'spouse' } },
      { type: 'not', condition: { type: 'hasRelation', kind: 'partner' } },
    ],
    text: 'Você conheceu alguém e percebeu que ainda sabe como isso funciona.',
    options: [
      {
        text: 'Ir devagar e ir',
        outcomes: [
          {
            chance: 0.7,
            text: 'Nesta idade ninguém tem tempo para jogo. Vocês foram diretos ao ponto.',
            effects: [
              { type: 'addRelation', kind: 'partner' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
            ],
          },
          {
            chance: 0.3,
            text: 'Vocês eram bons demais em viver sozinhos.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Achar que já passou da idade',
        outcomes: [
          {
            chance: 1,
            text: 'Você decidiu que já tinha passado da idade. Ninguém decidiu isso com você.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'social_kid_wants_pet',
    category: 'relationship',
    weight: 9,
    once: true,
    conditions: [
      { type: 'hasRelation', kind: 'child' },
      { type: 'age', min: 30 },
    ],
    text: 'Seu filho está implorando por um cachorro, com a mesma cara que você fazia.',
    options: [
      {
        text: 'Deixar',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou. Adivinha quem acabou passeando com ele todo dia.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'flag', flag: 'had_pet', value: true },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
        ],
      },
      {
        text: 'Dizer não',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse não pelos mesmos motivos que ouviu quando tinha aquela idade.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -10 }],
          },
        ],
      },
    ],
  },
]
