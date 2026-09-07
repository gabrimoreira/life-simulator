// Eventos que cobram — ou pagam — uma escolha antiga.
//
// Toda flag escrita pelo conteúdo precisa de alguém que a leia. Sem isso o
// Perfil vira uma vitrine de marcas decorativas: o jogo diz "Ficha suja" e se
// comporta exatamente igual. Este arquivo é onde a memória do jogo cobra.
//
// Duas memórias diferentes moram aqui. A FLAG responde "isso aconteceu com
// você" — e é sempre o resultado, não a decisão. A condição `chose` responde
// "você escolheu isto", e é o que permite cobrar a decisão mesmo quando ela
// deu certo. Antes da Fase 5 só existia a primeira, e por isso nenhum callback
// alimentava outro: a cadeia tinha profundidade um.

import type { GameEvent } from '../../engine/types'

export const CALLBACK_EVENTS: GameEvent[] = [
  {
    id: 'callback_record_haunts',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'flag', flag: 'criminal_record', value: true },
    ],
    text: 'Pediram uma certidão de antecedentes. A sua não vem limpa.',
    options: [
      {
        text: 'Contar antes que descubram',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.4 },
            text: 'A franqueza contou a seu favor. Não resolveu, mas não piorou.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 4 }],
          },
          {
            chance: 0.5,
            text: 'Agradeceram a sinceridade e escolheram outra pessoa.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Pagar um advogado para tentar limpar',
        requirements: [{ type: 'money', min: 40_000 }],
        outcomes: [
          {
            chance: 0.4,
            bias: { luck: 0.5 },
            text: 'Saiu. Depois de anos, seu nome está limpo de novo.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'flag', flag: 'criminal_record', value: false },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.6,
            text: 'O processo não andou. O dinheiro andou.',
            effects: [{ type: 'money', delta: -40_000 }],
          },
        ],
      },
      {
        text: 'Deixar como está',
        outcomes: [
          {
            chance: 1,
            text: 'Você parou de se candidatar a coisas que pedem certidão.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_old_band',
    category: 'relationship',
    weight: 9,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 30, max: 65 },
      { type: 'flag', flag: 'plays_music', value: true },
    ],
    text: 'O grupo da banda do colégio voltou a apitar. Alguém quer marcar um ensaio.',
    options: [
      {
        text: 'Aparecer no ensaio',
        outcomes: [
          {
            chance: 0.55,
            text: 'Tocar de novo depois de tantos anos foi melhor do que você lembrava.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.45,
            text: 'Ninguém sabia mais tocar, e ficou claro por que a banda acabou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Voltar a tocar sério',
        requirements: [{ type: 'stat', stat: 'charisma', min: 50 }],
        outcomes: [
          {
            chance: 0.3,
            bias: { luck: 0.6 },
            text: 'Vocês começaram a tocar em bar e uma coisa levou à outra.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 14 },
              { type: 'money', delta: 12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.7,
            text: 'Vocês tocaram em três bares vazios e desistiram.',
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
        ],
      },
      {
        text: 'Sair do grupo',
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu do grupo sem responder. Aquilo já tinha passado.',
            effects: [{ type: 'flag', flag: 'plays_music', value: false }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_pet',
    category: 'random',
    weight: 8,
    cooldown: 12,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'flag', flag: 'had_pet', value: true },
    ],
    text: 'Você passou na frente de uma feira de adoção e travou.',
    options: [
      {
        text: 'Adotar de novo',
        requirements: [{ type: 'money', min: 3_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você levou um pra casa. A casa mudou no mesmo dia.',
            effects: [
              { type: 'money', delta: -3_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Seguir andando',
        outcomes: [
          {
            chance: 1,
            text: 'Você seguiu. Pensou naquilo o resto da semana.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_cheating',
    category: 'career',
    weight: 8,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 24, max: 55 },
      { type: 'flag', flag: 'caught_cheating', value: true },
    ],
    text: 'Um colega de escola virou seu colega de trabalho. Ele lembra da prova.',
    options: [
      {
        text: 'Rir junto',
        outcomes: [
          {
            chance: 0.7,
            text: 'Virou piada interna e morreu ali.',
            effects: [{ type: 'stat', stat: 'charisma', op: 'delta', value: 4 }],
          },
          {
            chance: 0.3,
            text: 'A história circulou e colou em você.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Negar que aconteceu',
        outcomes: [
          {
            chance: 1,
            text: 'Você negou com firmeza demais. Todo mundo entendeu.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -14 },
              { type: 'performance', delta: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    // O único callback do jogo que não pergunta o que ACONTECEU com você, e
    // sim o que aconteceu com ELE. `forgave_me` mora no cônjuge, e é por isso
    // que este evento morre junto com o casamento — uma flag global diria
    // "fui perdoado" para sempre, inclusive depois de um divórcio e outro
    // casamento com outra pessoa.
    id: 'callback_the_forgiveness',
    category: 'relationship',
    weight: 11,
    cooldown: 9,
    conditions: [
      { type: 'personFlag', kind: 'spouse', flag: 'forgave_me', value: true },
      { type: 'age', min: 35 },
    ],
    text: 'Numa discussão boba sobre outra coisa, {conjuge} disse "depois daquilo eu já engoli bem pior".',
    options: [
      {
        text: 'Levar a sério e conversar de verdade',
        outcomes: [
          {
            chance: 0.55,
            text: 'Vocês conversaram até de madrugada. Alguma coisa que estava presa desde então saiu.',
            bias: { charisma: 0.4 },
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'personFlag', target: { by: 'kind', kind: 'spouse' }, flag: 'forgave_me', value: false },
            ],
          },
          {
            chance: 0.45,
            text: 'A conversa abriu tudo de novo e não fechou. Ficou pior por um bom tempo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Deixar passar, como das outras vezes',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou. Fica guardado, e volta na próxima discussão sobre outra coisa qualquer.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_living_alone',
    category: 'health',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 28, max: 65 },
      { type: 'flag', flag: 'lives_alone', value: true },
      { type: 'not', condition: { type: 'hasRelation', kind: 'spouse' } },
    ],
    text: 'Faz três dias que você não fala com ninguém e só percebeu agora.',
    options: [
      {
        text: 'Ligar para alguém',
        outcomes: [
          {
            chance: 0.8,
            text: 'Vocês conversaram duas horas. Fez mais diferença do que devia.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 12 },
            ],
          },
          {
            chance: 0.2,
            text: 'Ninguém atendeu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Aproveitar o silêncio',
        outcomes: [
          {
            chance: 1,
            text: 'Você aproveitou. Funciona por um tempo, e depois deixa de funcionar.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_no_children',
    category: 'relationship',
    weight: 8,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 48, max: 75 },
      { type: 'flag', flag: 'chose_no_children', value: true },
    ],
    text: 'Num almoço de família alguém perguntou, de novo, se você não se arrepende.',
    options: [
      {
        text: 'Dizer que não',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você disse não e era verdade. A mesa mudou de assunto.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 8 }],
          },
          {
            chance: 0.25,
            text: 'Você disse não e passou a noite acordado.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Mudar de assunto',
        outcomes: [
          {
            chance: 1,
            text: 'Você desviou. Perguntam de novo todo ano.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_exam_prep',
    category: 'school',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 26 },
      { type: 'flag', flag: 'exam_prepped', value: true },
    ],
    text: 'O cursinho deixou uma coisa que você não esperava: você aprendeu a estudar.',
    options: [
      {
        text: 'Usar isso',
        outcomes: [
          {
            chance: 1,
            text: 'Estudar deixou de ser sofrimento e virou método.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Não pensar mais nisso',
        outcomes: [
          {
            chance: 1,
            text: 'Você fechou os cadernos e não abriu mais.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_retirement_days',
    category: 'health',
    weight: 12,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 60 },
      { type: 'flag', flag: 'retired', value: true },
    ],
    text: 'O dia inteiro é seu e ninguém espera nada de você. Isso pesa mais do que parecia.',
    options: [
      {
        text: 'Arrumar uma ocupação',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você virou voluntário e a semana voltou a ter forma.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.25,
            text: 'Você tentou três coisas e não engatou em nenhuma.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Cuidar do corpo enquanto dá',
        outcomes: [
          {
            chance: 1,
            text: 'Caminhada de manhã, médico em dia, comida decente.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
        ],
      },
      {
        text: 'Deixar os dias passarem',
        outcomes: [
          {
            chance: 1,
            text: 'Os dias passaram. Foram muitos e foram iguais.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_memoir',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 72 },
      { type: 'flag', flag: 'wrote_memoir', value: true },
    ],
    text: 'Um neto leu seus cadernos e quer publicar aquilo.',
    options: [
      {
        text: 'Deixar publicar',
        outcomes: [
          {
            chance: 0.6,
            bias: { luck: 0.4 },
            text: 'Virou um livro pequeno que uma cidade inteira leu.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ninguém leu, mas ficou impresso. Já é mais do que a maioria consegue.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 10 }],
          },
        ],
      },
      {
        text: 'Aquilo era para a família',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que era da família e ficou na família.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 15 },
            ],
          },
        ],
      },
    ],
  },

  // --- Escolhas, não resultados ---------------------------------------------

  {
    id: 'callback_intern_paid_off',
    category: 'career',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 30, max: 48 },
      // Opção 1 de young_internship_choice: "O que ensina".
      { type: 'chose', eventId: 'young_internship_choice', optionIndex: 1 },
    ],
    text: 'Quem te orientou naquele estágio virou gente grande e lembrou de você.',
    options: [
      {
        text: 'Atender o telefonema',
        outcomes: [
          {
            chance: 0.65,
            text: 'Era uma proposta, e das boas. Vinte anos depois, o estágio que não pagava pagou.',
            effects: [
              { type: 'performance', delta: 20 },
              { type: 'money', delta: 60_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.35,
            text: 'Era só um café. Bom café.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Deixar tocar',
        outcomes: [
          {
            chance: 1,
            text: 'Você viu o nome na tela e não atendeu. Nunca soube o que era.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_intern_money_regret',
    category: 'career',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 30, max: 48 },
      // Opção 0: "O que paga". Note que ela dava dinheiro — o callback cobra a
      // ESCOLHA, não o resultado ruim, que é justamente o que a flag não faz.
      { type: 'chose', eventId: 'young_internship_choice', optionIndex: 0 },
    ],
    text: 'Um colega da mesma turma te ultrapassou faz tempo. Você sabe exatamente onde a estrada se dividiu.',
    options: [
      {
        text: 'Voltar a estudar por conta',
        outcomes: [
          {
            chance: 1,
            text: 'Você comprou os livros e acordou uma hora mais cedo durante um ano inteiro.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 10 },
              { type: 'actionPoints', delta: -1 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar que foi a escolha certa na época',
        outcomes: [
          {
            chance: 1,
            text: 'Você precisava daquele dinheiro naquele ano. Ninguém escolhe no vácuo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 7 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_crypto_again',
    category: 'random',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 33 },
      // Opção 0 do pitch: apostou tudo. Deu certo ou não, você é o tipo que aposta.
      { type: 'chose', eventId: 'ya_crypto_pitch', optionIndex: 0 },
    ],
    text: 'O mesmo conhecido reapareceu com a mesma cara e um negócio novo.',
    options: [
      {
        text: 'Entrar de novo',
        requirements: [{ type: 'money', min: 40_000 }],
        outcomes: [
          {
            chance: 0.15,
            bias: { luck: 1 },
            text: 'Contra tudo o que era razoável, deu certo outra vez.',
            effects: [
              { type: 'money', delta: 220_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 15 },
            ],
          },
          {
            chance: 0.85,
            text: 'Igualzinho da primeira vez. Você sabia, e entrou assim mesmo.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -15 },
            ],
          },
        ],
      },
      {
        text: 'Dessa vez não',
        outcomes: [
          {
            chance: 1,
            text: 'Você ouviu a conversa inteira por educação e foi embora.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_second_order',
    category: 'random',
    weight: 9,
    once: true,
    conditions: [
      { type: 'age', min: 45 },
      // Cadeia de profundidade DOIS: este callback lê a escolha feita dentro
      // de outro callback. É o que a memória por flag não conseguia fazer.
      { type: 'chose', eventId: 'callback_intern_paid_off', optionIndex: 1 },
    ],
    text: 'Você descobriu, por acaso e tarde demais, o que era aquele telefonema que você não atendeu.',
    options: [
      {
        text: 'Ligar agora',
        outcomes: [
          {
            chance: 0.3,
            text: 'Atenderam. Foi constrangedor e bom.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.7,
            text: 'O número não existe mais.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Deixar quieto',
        outcomes: [
          {
            chance: 1,
            text: 'Você guardou aquilo junto com as outras coisas que não deu para desfazer.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_night_school',
    category: 'school',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 28, max: 55 },
      { type: 'education', level: 'highschool', atLeast: false },
      { type: 'enrolled', value: false },
    ],
    text: 'Abriu uma turma de supletivo perto do trabalho, à noite. Dois anos, e você teria o diploma que nunca teve.',
    options: [
      {
        text: 'Fazer',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você aguentou os dois anos, chegando em casa quase meia-noite.',
            effects: [
              // `education` direto: o supletivo não é um curso do catálogo,
              // é uma escada lateral que sobe o nível sem passar por matrícula.
              { type: 'education', level: 'highschool' },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você foi três meses e o cansaço venceu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -7 }],
          },
        ],
      },
      {
        text: 'Deixar para lá',
        outcomes: [
          {
            chance: 1,
            text: 'Você olhou o cartaz por duas semanas e um dia ele não estava mais lá.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_study_ahead',
    category: 'school',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'enrolled', value: true }],
    text: 'Você tem um verão inteiro pela frente e a matéria do ano que vem já está no site.',
    options: [
      {
        text: 'Adiantar tudo',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você chegou em fevereiro sabendo o que os outros iam aprender em novembro.',
            effects: [
              // `study`: empurra um ano de curso de graça, sem gastar o ponto
              // de ação que a ação "Cursar" cobraria.
              { type: 'study' },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você abriu o material em janeiro, leu quatro páginas e foi para a praia.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 8 }],
          },
        ],
      },
      {
        text: 'Descansar',
        outcomes: [
          {
            chance: 1,
            text: 'Você não pensou em nada disso por três meses, e voltou inteiro.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_year_of_air',
    category: 'random',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 25 },
      { type: 'stat', stat: 'happiness', min: 70 },
    ],
    text: 'Foi um ano em que tudo coube. Você acordava com disposição sobrando.',
    options: [
      {
        text: 'Aproveitar o fôlego',
        outcomes: [
          {
            chance: 1,
            text: 'Deu para fazer mais coisa nesse ano do que nos dois anteriores.',
            // `actionPoints`: um ano de fôlego é literalmente mais tempo útil.
            effects: [{ type: 'actionPoints', delta: 1 }],
          },
        ],
      },
      {
        text: 'Não fazer nada de especial com ele',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou o ano passar sendo bom, que já é bastante.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 5 }],
          },
        ],
      },
    ],
  },
]
