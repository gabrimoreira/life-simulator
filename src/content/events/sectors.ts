// Um evento próprio para cada setor que só tinha tabela de salário.
//
// A Fase 6 partiu Empresário e Celebridade em setores, e a Fase 8 partiu o
// CLT nos cinco do spec. Só que setor sem evento próprio não é setor: é o
// mesmo jogo com outro nome na tela do Perfil. Estes eventos são o que
// diferencia estar num e estar no outro — e são a razão de `careerTrack`
// existir como condição separada de `careerKind`.
//
// A regra que os une: cada um cobra a moeda do seu setor. Alimentação cobra em
// vigilância e margem, tecnologia em prazo, música em estrada, ator em ser
// sempre o mesmo, atleta no corpo, serviço em engolir desaforo.

import type { GameEvent } from '../../engine/types'

export const SECTOR_EVENTS: GameEvent[] = [
  {
    id: 'sector_food_inspection',
    category: 'career',
    weight: 14,
    cooldown: 6,
    conditions: [{ type: 'careerTrack', trackId: 'business_food' }],
    text: 'A fiscalização apareceu sem avisar, numa quarta-feira de movimento, e pediu para ver a cozinha.',
    options: [
      {
        text: 'Abrir tudo e aguentar o que vier',
        outcomes: [
          {
            chance: 0.55,
            text: 'Saiu uma notificação pequena e um prazo para resolver. Você resolveu.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'performance', delta: 6 },
            ],
          },
          {
            chance: 0.45,
            text: 'Interditaram por duas semanas, e as duas semanas apareceram no caixa do ano.',
            effects: [
              { type: 'money', delta: -45_000 },
              { type: 'performance', delta: -14 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Conversar com o fiscal',
        outcomes: [
          {
            chance: 0.5,
            bias: { charisma: 0.45 },
            text: 'Vocês conversaram na calçada e o relatório saiu mais gentil do que a cozinha merecia.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 2 },
            ],
          },
          {
            chance: 0.5,
            text: 'O fiscal entendeu o que você estava propondo, e não gostou.',
            effects: [
              { type: 'money', delta: -60_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -14 },
              { type: 'flag', flag: 'criminal_record', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_shop_chain',
    category: 'career',
    weight: 14,
    cooldown: 7,
    conditions: [{ type: 'careerTrack', trackId: 'business' }],
    text: 'Abriu uma rede grande a duas quadras, com estacionamento e preço que você não consegue fazer.',
    options: [
      {
        text: 'Brigar no preço',
        outcomes: [
          {
            chance: 0.35,
            text: 'Você segurou a freguesia e eles desistiram do ponto em um ano e meio.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'performance', delta: 12 },
            ],
          },
          {
            chance: 0.65,
            text: 'Você vendeu mais barato do que custava, e o ano fechou no vermelho.',
            effects: [
              { type: 'money', delta: -90_000 },
              { type: 'performance', delta: -10 },
            ],
          },
        ],
      },
      {
        text: 'Apostar em quem já é seu cliente',
        outcomes: [
          {
            chance: 0.6,
            bias: { charisma: 0.35 },
            text: 'Você sabe o nome de todo mundo que entra, e isso a rede não tem como copiar.',
            effects: [
              { type: 'performance', delta: 14 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.4,
            text: 'Simpatia não pagou a diferença de preço, e a freguesia foi indo aos poucos.',
            effects: [
              { type: 'money', delta: -55_000 },
              { type: 'performance', delta: -8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_internet_viral',
    category: 'career',
    weight: 15,
    cooldown: 6,
    conditions: [{ type: 'careerTrack', trackId: 'celebrity' }],
    text: 'Um vídeo seu de trinta segundos saiu do seu público e caiu no colo do país inteiro.',
    options: [
      {
        text: 'Surfar enquanto dura',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você postou todo dia por três meses e saiu do outro lado com o dobro de gente te acompanhando.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 16 },
              { type: 'money', delta: 60_000 },
              { type: 'performance', delta: 10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.4,
            text: 'A internet virou para o assunto seguinte em nove dias e levou junto quem tinha chegado.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Sumir até passar',
        outcomes: [
          {
            chance: 0.55,
            // Fama alta atrapalha: quem já é muito conhecido não some por
            // vontade própria — as pessoas continuam falando do mesmo jeito.
            bias: { fame: -0.4 },
            text: 'Passou. Você voltou para o seu tamanho e para quem estava lá antes.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'performance', delta: 4 },
            ],
          },
          {
            chance: 0.45,
            text: 'Sumir foi lido como confirmação, e o assunto continuou sem você por perto para responder.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -10 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_tech_acquisition',
    category: 'career',
    weight: 16,
    once: true,
    conditions: [
      { type: 'careerTrack', trackId: 'business_tech' },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Uma empresa grande quer comprar a sua. A proposta paga bem e mantém você lá dentro por três anos.',
    options: [
      {
        text: 'Vender',
        outcomes: [
          {
            chance: 0.65,
            bias: { charisma: 0.3 },
            text: 'Você negociou o valor para cima e assinou. O dinheiro caiu de uma vez.',
            effects: [
              { type: 'money', delta: 900_000 },
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.35,
            text: 'Assinaram, pagaram, e em oito meses desmontaram tudo o que você tinha construído.',
            effects: [
              { type: 'money', delta: 450_000 },
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Recusar e continuar sozinho',
        outcomes: [
          {
            chance: 0.5,
            text: 'A recusa correu o mercado e o seu nome passou a valer mais do que a proposta.',
            effects: [
              { type: 'performance', delta: 15 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Eles compraram o concorrente e passaram o ano seguinte inteiro comendo o seu mercado.',
            effects: [
              { type: 'performance', delta: -18 },
              { type: 'money', delta: -80_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_music_tour',
    category: 'career',
    weight: 14,
    cooldown: 8,
    conditions: [
      { type: 'careerTrack', trackId: 'celebrity_music' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'A produção montou uma turnê de nove meses: trinta cidades, van, hotel ruim e casa cheia.',
    options: [
      {
        text: 'Ir para a estrada',
        outcomes: [
          {
            chance: 0.6,
            text: 'A turnê pegou. Você voltou acabado, mais conhecido e com dinheiro no bolso.',
            effects: [
              { type: 'money', delta: 220_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'performance', delta: 12 },
            ],
          },
          {
            chance: 0.4,
            text: 'Meia dúzia de casas vazias, uma van quebrada em Minas e nove meses fora de casa.',
            effects: [
              { type: 'money', delta: -30_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -18 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -14 },
            ],
          },
        ],
      },
      {
        text: 'Ficar e trabalhar em música nova',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você passou o ano compondo e saiu dele com o melhor disco que já fez.',
            effects: [
              { type: 'performance', delta: 16 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.5,
            text: 'O ano passou, o disco não veio, e a produção deu a turnê para outro artista.',
            effects: [
              { type: 'performance', delta: -12 },
              { type: 'stat', stat: 'fame', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_acting_typecast',
    category: 'career',
    weight: 13,
    cooldown: 7,
    conditions: [
      { type: 'careerTrack', trackId: 'celebrity_acting' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Ofereceram o mesmo personagem pela quarta vez. É o papel que o público quer ver você fazendo.',
    options: [
      {
        text: 'Aceitar de novo — paga as contas',
        outcomes: [
          {
            chance: 0.75,
            text: 'Funcionou como sempre funciona. Ninguém reclamou, e ninguém se lembrou.',
            effects: [
              { type: 'money', delta: 160_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 5 },
              { type: 'performance', delta: 3 },
            ],
          },
          {
            chance: 0.25,
            text: 'Desta vez o público percebeu, e a crítica escreveu a palavra "cansado".',
            effects: [
              { type: 'money', delta: 160_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
              { type: 'performance', delta: -8 },
            ],
          },
        ],
      },
      {
        text: 'Recusar e esperar por outra coisa',
        outcomes: [
          {
            chance: 0.45,
            bias: { intelligence: 0.25, reputation: 0.25 },
            text: 'Apareceu um papel pequeno num filme difícil, e ele mudou o que falam de você.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 16 },
              { type: 'performance', delta: 14 },
            ],
          },
          {
            chance: 0.55,
            text: 'Você passou o ano recusando o que vinha, e no fim dele parou de vir.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: -10 },
              { type: 'performance', delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_sports_injury',
    category: 'health',
    weight: 16,
    cooldown: 6,
    conditions: [
      { type: 'careerTrack', trackId: 'celebrity_sports' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'O joelho travou no meio da temporada. O departamento médico fala em seis meses; o clube, em seis semanas.',
    options: [
      {
        text: 'Voltar no prazo do clube',
        outcomes: [
          {
            chance: 0.4,
            bias: { health: 0.4 },
            text: 'Deu certo. Você voltou antes e jogou o resto da temporada inteira.',
            effects: [
              { type: 'performance', delta: 14 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.6,
            text: 'O joelho não era o mesmo, e nunca mais foi.',
            effects: [
              { type: 'flag', flag: 'chronic_condition', value: true },
              { type: 'stat', stat: 'health', op: 'delta', value: -14 },
              { type: 'performance', delta: -20 },
            ],
          },
        ],
      },
      {
        text: 'Fazer o tratamento inteiro',
        outcomes: [
          {
            chance: 0.7,
            text: 'Seis meses de fisioterapia e uma temporada perdida. O joelho voltou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
              { type: 'performance', delta: -12 },
              { type: 'money', delta: -20_000 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você fez tudo certo e o clube contratou outro para a sua posição.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
              { type: 'performance', delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_corporate_reorg',
    category: 'career',
    weight: 14,
    cooldown: 7,
    conditions: [
      { type: 'careerTrack', trackId: 'clt' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Anunciaram uma reestruturação por e-mail às sete da noite. Duas áreas viram uma, e sobra um cargo.',
    options: [
      {
        text: 'Se posicionar para o cargo',
        outcomes: [
          {
            chance: 0.45,
            bias: { charisma: 0.4, reputation: 0.2 },
            text: 'Você conversou com quem decidia antes de a decisão existir, e o cargo foi seu.',
            effects: [
              { type: 'career', action: 'promote' },
              { type: 'performance', delta: 10 },
            ],
          },
          {
            chance: 0.55,
            text: 'Escolheram o outro, que estava fazendo exatamente a mesma coisa que você.',
            effects: [
              { type: 'performance', delta: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Ficar quieto e trabalhar',
        outcomes: [
          {
            chance: 0.6,
            text: 'A poeira baixou e você continuou onde estava, com o dobro de escopo e o mesmo salário.',
            effects: [
              { type: 'performance', delta: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.4,
            text: 'Quem ficou quieto entrou na lista. Você foi chamado numa sexta de manhã.',
            effects: [
              { type: 'career', action: 'fire' },
              { type: 'money', delta: 20_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_dev_crunch',
    category: 'career',
    weight: 14,
    cooldown: 6,
    conditions: [
      { type: 'careerTrack', trackId: 'clt_tech' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'A data foi prometida a um cliente sem ninguém perguntar ao time. Faltam onze semanas de trabalho e restam cinco.',
    options: [
      {
        text: 'Virar noites até entregar',
        outcomes: [
          {
            chance: 0.6,
            text: 'Entregou. Ninguém agradeceu, mas o seu nome ficou associado a quem entrega.',
            effects: [
              { type: 'performance', delta: 16 },
              { type: 'stat', stat: 'health', op: 'delta', value: -7 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Entregou pela metade, quebrado, e a metade que faltou foi a que o cliente usava.',
            effects: [
              { type: 'performance', delta: -10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -9 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que a data é impossível',
        outcomes: [
          {
            chance: 0.5,
            bias: { charisma: 0.35, reputation: 0.2 },
            text: 'Você mostrou a conta em números e a data foi renegociada com o cliente.',
            effects: [
              { type: 'performance', delta: 8 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.5,
            text: 'Anotaram que você é difícil de trabalhar, e a data continuou de pé.',
            effects: [
              { type: 'performance', delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'sector_services_customer',
    category: 'career',
    weight: 15,
    cooldown: 5,
    conditions: [{ type: 'careerTrack', trackId: 'clt_servicos' }],
    text: 'O cliente gritou com você na frente da loja inteira e exigiu falar com o gerente.',
    options: [
      {
        text: 'Engolir e pedir desculpa',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você pediu desculpa por algo que não fez, e a chefia registrou como boa conduta.',
            effects: [
              { type: 'performance', delta: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -9 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você pediu desculpa e ele continuou gritando até se cansar sozinho.',
            effects: [
              { type: 'performance', delta: 3 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
            ],
          },
        ],
      },
      {
        text: 'Responder na mesma altura',
        outcomes: [
          {
            chance: 0.35,
            bias: { charisma: 0.4 },
            text: 'A loja inteira ficou do seu lado, e até a chefia achou que ele tinha passado do ponto.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.65,
            text: 'Virou reclamação formal, advertência por escrito e uma conversa na sala dos fundos.',
            effects: [
              { type: 'performance', delta: -18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Chamar o gerente e sair de perto',
        outcomes: [
          {
            chance: 1,
            text: 'O gerente resolveu em dois minutos, do jeito que você teria resolvido se pudesse.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
]
