// O gênero, que o jogo perguntava e não usava.
//
// Até a Fase 9 a condição `{ type: 'gender' }` aparecia UMA vez em 214
// eventos. O jogo pedia o gênero na criação do personagem, flexionava todo o
// texto por ele (`{o}`, `{ele}`, `{dele}`) e depois vivia exatamente a mesma
// vida dos dois lados. Era a mesma doença dos vícios antes da Fase 8: uma
// pergunta feita ao jogador que o conteúdo nunca lia.
//
// O que está escrito aqui não é "eventos de mulher". São pares: quase todo
// evento daqui tem um irmão do outro lado, porque o custo de gênero não é de
// um lado só — é diferente. A licença que interrompe uma carreira e a licença
// de cinco dias que não deixa ninguém conhecer o próprio filho são a mesma
// regra vista de dois ângulos, e as duas cobram.
//
// Regras que eu segui e que quem editar isto deveria seguir também:
//
//   - Nenhum evento aqui é só ruim. Todos têm ao menos uma saída que rende
//     alguma coisa, porque o jogador está vivendo, não sendo repreendido.
//   - Nada de estatística vestida de personagem. O evento descreve UMA noite,
//     UMA sala, UMA consulta — o agregado é problema de quem mede.
//   - Ninguém aqui é vítima por definição. Toda opção é uma escolha com
//     consequência, inclusive a de não fazer nada.

import type { GameEvent } from '../../engine/types'

export const GENDER_EVENTS: GameEvent[] = [
  // --- Trabalho ------------------------------------------------------------
  {
    id: 'gender_pay_gap_learns',
    category: 'career',
    weight: 11,
    cooldown: 9,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'hasCareer', value: true },
      { type: 'age', min: 24 },
    ],
    text: 'Alguém deixou uma planilha aberta. O cara que entrou depois de você ganha mais que você.',
    options: [
      {
        text: 'Levar isso para a chefia',
        outcomes: [
          {
            chance: 0.4,
            text: 'Você chegou com o número na mão. Reajustaram, sem admitir nada.',
            bias: { charisma: 0.5, reputation: 0.3 },
            effects: [
              { type: 'money', delta: 9_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.6,
            text: 'Ouviu que "não é bem assim" e que aquilo era informação confidencial.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'performance', delta: -4 },
            ],
          },
        ],
      },
      {
        text: 'Não falar nada e começar a procurar outra coisa',
        outcomes: [
          {
            chance: 0.45,
            text: 'Você saiu de lá em oito meses, ganhando o que devia desde o começo.',
            bias: { intelligence: 0.4 },
            effects: [
              { type: 'money', delta: 14_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.55,
            text: 'Você ficou. Todo dia sabendo, e todo dia calada.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Fechar a planilha e esquecer',
        outcomes: [
          {
            chance: 1,
            text: 'Você fechou. Não esqueceu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_pay_gap_knows',
    category: 'career',
    weight: 10,
    cooldown: 9,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'hasCareer', value: true },
      { type: 'age', min: 24 },
    ],
    // O outro lado da mesma planilha. Sem este evento, a desigualdade seria
    // uma coisa que acontece COM mulheres e não uma coisa que acontece na
    // empresa onde os dois trabalham.
    text: 'Você descobriu sem querer que ganha bem mais que a colega que faz o mesmo — e está lá há mais tempo.',
    options: [
      {
        text: 'Dizer a ela o que você ganha',
        outcomes: [
          {
            chance: 0.55,
            text: 'Ela foi atrás com o número. Conseguiu, e nunca mais te tratou como qualquer um.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ela levou adiante, não conseguiu nada, e ficaram sabendo quem contou.',
            bias: { reputation: -0.4 },
            effects: [
              { type: 'performance', delta: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -3 },
            ],
          },
        ],
      },
      {
        text: 'Falar com a chefia em vez de com ela',
        outcomes: [
          {
            chance: 0.35,
            text: 'Escutaram de você o que não escutariam dela. Corrigiram no trimestre seguinte.',
            bias: { charisma: 0.5 },
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
              { type: 'performance', delta: 4 },
            ],
          },
          {
            chance: 0.65,
            text: 'Disseram que iam olhar. Não olharam.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
      {
        text: 'Não é problema seu',
        outcomes: [
          {
            chance: 1,
            text: 'Não é. Continuou não sendo, e você continuou ganhando mais.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -2 }],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_maternity_return',
    category: 'career',
    weight: 13,
    cooldown: 10,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'hasCareer', value: true },
      { type: 'hasRelation', kind: 'child' },
      { type: 'age', min: 24, max: 48 },
    ],
    text: 'Você voltou da licença. O projeto que era seu está com outra pessoa, e ninguém achou que precisava avisar.',
    options: [
      {
        text: 'Exigir o projeto de volta',
        outcomes: [
          {
            chance: 0.4,
            text: 'Devolveram. Levou meio ano para pararem de te tratar como quem chegou agora.',
            bias: { charisma: 0.4, reputation: 0.4 },
            effects: [
              { type: 'performance', delta: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.6,
            text: 'Ouviu que era para o seu bem, "com o bebê pequeno em casa".',
            effects: [
              { type: 'performance', delta: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar e reconstruir por fora',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você pegou o que ninguém queria e transformou naquilo que todo mundo passou a precisar.',
            bias: { intelligence: 0.5 },
            effects: [
              { type: 'performance', delta: 8 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'Dois anos depois você ainda estava fazendo o que sobrava.',
            effects: [
              { type: 'performance', delta: -5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pedir demissão',
        requirements: [{ type: 'money', min: 20_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu no mês seguinte. Foi caro e foi alívio.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_paternity_five_days',
    category: 'career',
    weight: 12,
    cooldown: 10,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'hasCareer', value: true },
      { type: 'hasRelation', kind: 'child' },
      { type: 'age', min: 22, max: 48 },
    ],
    // O par do evento acima: a mesma lei, o lado que quase ninguém trata como
    // perda. Cinco dias é o que a CLT garante ao pai.
    text: 'Sua licença acabou. Foram cinco dias. Na segunda-feira você estava de volta à mesa, e {ele} tinha uma semana de vida.',
    options: [
      {
        text: 'Negociar mais tempo, mesmo sem receber',
        outcomes: [
          {
            chance: 0.45,
            text: 'Conseguiu três semanas sem salário. Foram as três semanas que você lembra até hoje.',
            bias: { charisma: 0.5 },
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.55,
            text: 'Riram e mandaram você agradecer pelos cinco.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Voltar e compensar em casa',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você virou o pai que acorda de madrugada. Cansou, e ficou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você voltou tarde todo dia daquele ano e não viu quase nada.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -8 },
              { type: 'performance', delta: 5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_provider_weight',
    category: 'career',
    weight: 10,
    cooldown: 12,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'age', min: 26, max: 55 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'Perguntaram, na mesa de domingo, se você já está "dando conta de sustentar a casa". Ninguém perguntou isso a mais ninguém ali.',
    options: [
      {
        text: 'Dizer que a casa não é sustentada por uma pessoa só',
        outcomes: [
          {
            chance: 0.5,
            text: 'Deu um silêncio curto e o assunto mudou. Você dormiu bem.',
            bias: { charisma: 0.4 },
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
          {
            chance: 0.5,
            text: 'Acharam que você estava se justificando, o que é pior que a pergunta.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Aceitar o peso e trabalhar mais',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você virou o cara que resolve. Cobraram mais, e você deu.',
            effects: [
              { type: 'performance', delta: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.45,
            text: 'O ano inteiro em função disso, e no fim o dinheiro nem era o problema.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  // --- Casa ----------------------------------------------------------------
  {
    id: 'gender_second_shift',
    category: 'relationship',
    weight: 12,
    cooldown: 8,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'hasRelation', kind: 'spouse' },
      { type: 'age', min: 24 },
    ],
    text: 'Você fez a conta de quantas horas por semana cada um dos dois passa cuidando da casa. A diferença é um emprego de meio período.',
    options: [
      {
        text: 'Mostrar a conta a {conjuge}',
        outcomes: [
          {
            chance: 0.5,
            text: 'Ficou constrangido, e mudou de verdade. Não tudo, mas mudou.',
            bias: { charisma: 0.4 },
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'Ouviu que ele "ajuda bastante", e a conversa acabou aí.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Pagar alguém para fazer',
        requirements: [{ type: 'money', min: 12_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Resolveu o seu problema comprando o tempo de outra mulher. Você sabe disso.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 7 },
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Continuar fazendo',
        outcomes: [
          {
            chance: 1,
            text: 'Mais um ano assim. O cansaço não aparece em nenhum lugar até aparecer.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_clock_pressure',
    category: 'relationship',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'age', min: 28, max: 40 },
      { type: 'not', condition: { type: 'hasRelation', kind: 'child' } },
    ],
    text: 'De novo a mesma pergunta, em outra festa: "e filho, quando?"',
    options: [
      {
        text: 'Responder que não é da conta de ninguém',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você cortou o assunto e ninguém mais tocou nele naquela noite.',
            bias: { charisma: 0.4, reputation: 0.2 },
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 5 }],
          },
          {
            chance: 0.4,
            text: 'Passou por grosseria. Comentaram por semanas.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Rir junto e desconversar',
        outcomes: [
          {
            chance: 1,
            text: 'Funcionou, como funciona desde os vinte e cinco. Cansa.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  // --- Rua -----------------------------------------------------------------
  {
    id: 'gender_walk_home_night',
    category: 'random',
    weight: 12,
    // 8, e não 5: com 5 esta noite se repetia 3,5 vezes por vida e virava um
    // tique do jogo em vez de uma noite. Com 8 dá ~2.
    cooldown: 8,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'age', min: 16 },
    ],
    text: 'Onze da noite, três quarteirões até em casa, e passos atrás de você desde o ponto.',
    options: [
      {
        text: 'Andar mais rápido e ligar para alguém',
        outcomes: [
          {
            chance: 0.8,
            text: 'Era só alguém indo para casa também. Você chegou com o coração aos pulos.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
          {
            chance: 0.2,
            text: 'Ele encostou, você gritou, e uma porta se abriu na esquina. Levaram a bolsa.',
            bias: { luck: 0.5 },
            effects: [
              { type: 'money', delta: -1_200 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Pedir um carro e esperar na frente do bar',
        requirements: [{ type: 'money', min: 200 }],
        outcomes: [
          {
            chance: 1,
            text: 'Trinta reais. Você paga isso quase toda semana e ninguém chama de imposto.',
            effects: [{ type: 'money', delta: -30 }],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_bar_challenge',
    category: 'random',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'age', min: 16, max: 45 },
    ],
    text: 'O cara encostou no seu ombro de propósito e ficou esperando. A mesa inteira olhando para ver o que você faz.',
    options: [
      {
        text: 'Deixar quieto e sair',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você saiu inteiro. Um ou outro achou que você amarelou.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: -3 }],
          },
          {
            chance: 0.3,
            text: 'Ele veio atrás na calçada, e aí não tinha mais como sair.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'stat', stat: 'looks', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Encarar',
        outcomes: [
          {
            chance: 0.35,
            text: 'Ele recuou primeiro. Você foi o dono do bar por uma noite.',
            bias: { reputation: 0.4, looks: 0.2 },
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.65,
            text: 'Acabou no chão, com ponto na sobrancelha e a conta do pronto-socorro.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -18 },
              { type: 'stat', stat: 'looks', op: 'delta', value: -6 },
              { type: 'money', delta: -800 },
            ],
          },
        ],
      },
    ],
  },

  // --- Saúde ---------------------------------------------------------------
  {
    id: 'gender_pain_dismissed',
    category: 'health',
    weight: 11,
    cooldown: 8,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'age', min: 20 },
    ],
    text: 'A dor já dura meses. O médico ouviu por dois minutos e falou em ansiedade.',
    options: [
      {
        text: 'Procurar outro médico',
        requirements: [{ type: 'money', min: 600 }],
        outcomes: [
          {
            chance: 0.6,
            text: 'A segunda opinião pediu o exame que a primeira não pediu. Tinha coisa ali, e deu tempo.',
            effects: [
              { type: 'money', delta: -600 },
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Falou a mesma coisa, com outras palavras e a mesma pressa.',
            effects: [
              { type: 'money', delta: -600 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar o diagnóstico e tocar a vida',
        outcomes: [
          {
            chance: 0.55,
            text: 'Passou sozinho, como ele disse que passaria.',
            bias: { luck: 0.4 },
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
          {
            chance: 0.45,
            text: 'Não era ansiedade. Você descobriu isso dois anos mais tarde.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -14 }],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_never_goes_to_doctor',
    category: 'health',
    weight: 11,
    cooldown: 8,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'age', min: 35 },
    ],
    text: 'Faz sete anos que você não vai a um médico. Não dói nada, é esse o argumento.',
    options: [
      {
        text: 'Marcar o check-up',
        requirements: [{ type: 'money', min: 400 }],
        outcomes: [
          {
            chance: 0.55,
            text: 'Está tudo bem, disseram, e mandaram voltar no ano que vem.',
            effects: [
              { type: 'money', delta: -400 },
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.45,
            text: 'Acharam uma coisa cedo o bastante para não virar história.',
            effects: [
              { type: 'money', delta: -1_500 },
              { type: 'stat', stat: 'health', op: 'delta', value: 10 },
            ],
          },
        ],
      },
      {
        text: 'Se estiver ruim eu vou',
        outcomes: [
          {
            chance: 0.6,
            text: 'E não ficou. Mais um ano sem médico, e você continua achando graça disso.',
            bias: { luck: 0.4 },
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
          {
            chance: 0.4,
            text: 'Quando ficou ruim, já estava ruim há bastante tempo.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -16 }],
          },
        ],
      },
    ],
  },

  // --- Velhice -------------------------------------------------------------
  {
    id: 'gender_outlived_everyone',
    category: 'random',
    weight: 12,
    cooldown: 7,
    conditions: [
      { type: 'gender', gender: 'female' },
      { type: 'age', min: 72 },
    ],
    // Elas vivem em média sete anos a mais no Brasil, e o preço disso é
    // enterrar quase todo mundo. O evento é sobre o que sobra depois.
    text: 'Você foi ao velório e percebeu que era a última da turma ainda de pé.',
    options: [
      {
        text: 'Ligar para quem ainda atende',
        outcomes: [
          {
            chance: 0.65,
            text: 'Fizeram um grupo de quatro velhas e um café toda quarta. Salvou o seu ano.',
            bias: { charisma: 0.4 },
            effects: [
              { type: 'addRelation', kind: 'friend' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.35,
            text: 'Os telefones que você tinha ou não existem mais, ou não são atendidos.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Voltar para casa e continuar',
        outcomes: [
          {
            chance: 1,
            text: 'Você continuou. É o que você faz melhor, e ninguém aplaude isso.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
              { type: 'stat', stat: 'health', op: 'delta', value: 2 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'gender_no_one_to_call',
    category: 'random',
    weight: 12,
    cooldown: 7,
    conditions: [
      { type: 'gender', gender: 'male' },
      { type: 'age', min: 68 },
      { type: 'relationCount', kind: 'friend', max: 2, minRelation: 55 },
    ],
    // O par do de cima. Eles morrem antes, e chegam à velhice com uma rede
    // social que passaram a vida inteira sem manter.
    text: 'Você precisou de alguém para levar você ao hospital e passou a lista do telefone inteira sem achar quem chamar.',
    options: [
      {
        text: 'Chamar quem você não fala há anos',
        outcomes: [
          {
            chance: 0.5,
            text: 'Ele veio, e ficou. Vocês voltaram a se falar como se não tivesse passado nada.',
            bias: { charisma: 0.4, luck: 0.3 },
            effects: [
              { type: 'addRelation', kind: 'friend' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.5,
            text: 'Ele foi educado e não veio.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Ir sozinho de aplicativo',
        outcomes: [
          {
            chance: 1,
            text: 'Você foi, esperou quatro horas sozinho e voltou sozinho. Deu tudo certo.',
            effects: [
              { type: 'money', delta: -120 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },
]
