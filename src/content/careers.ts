// Trilhas de carreira. Dados puros: níveis, salários e requisitos.
//
// Trocar de trilha é permitido e custa todo o progresso — a decisão é
// interessante justamente por isso, não porque o jogo pune.
//
// As trilhas de PROFISSÃO (medicina, direito, engenharia) existem porque sem
// elas o diploma não valia nada: nenhuma flag `course_*` era lida em lugar
// nenhum, e Medicina — seis anos e R$360.000 — abria exatamente as mesmas
// portas que Licenciatura, quatro anos e R$32.000. Elas também são o que
// torna a condição `careerTrack` necessária: agora há quatro trilhas de
// `kind: 'clt'`, e "evento de médico" não é a mesma coisa que "evento de
// quem tem carteira assinada".

import type { CareerTrack } from '../engine/types'

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'clt',
    name: 'Corporativo',
    kind: 'clt',
    entryLabel: 'Procurar emprego com carteira assinada',
    entryHint: 'Renda previsível. Promoção depende de desempenho, tempo e carisma.',
    levels: [
      {
        title: 'Estagiário',
        salary: 30_000,
        minYears: 0,
        requirements: [
          // Sem `age`: o médio só termina aos 18 (AGE_HIGHSCHOOL_DONE), então
          // um mínimo de 17 nunca era o gargalo — era condição morta.
          { type: 'education', level: 'highschool', atLeast: true },
          // Emprego formal faz checagem de antecedentes. Autônomo e artista não.
          { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
        ],
      },
      {
        title: 'Analista júnior',
        salary: 52_000,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'intelligence', min: 40 }],
      },
      {
        title: 'Analista pleno',
        salary: 78_000,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 55 },
          { type: 'performance', min: 45 },
        ],
      },
      {
        title: 'Analista sênior',
        salary: 125_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 65 },
          { type: 'performance', min: 55 },
          { type: 'education', level: 'bachelor', atLeast: true },
        ],
      },
      {
        title: 'Gerente',
        salary: 210_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 60 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Diretor',
        salary: 380_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 72 },
          { type: 'stat', stat: 'reputation', min: 55 },
          { type: 'performance', min: 75 },
        ],
      },
    ],
  },

  {
    id: 'business',
    name: 'Empresário',
    kind: 'business',
    entryLabel: 'Abrir o próprio negócio',
    entryHint: 'Renda alta e volátil. Ano ruim é prejuízo de verdade, e falência existe.',
    levels: [
      {
        title: 'Autônomo',
        salary: 32_000,
        volatility: 0.55,
        minYears: 0,
        requirements: [
          { type: 'age', min: 18 },
          { type: 'money', min: 5_000 },
        ],
      },
      {
        title: 'MEI com ponto fixo',
        salary: 72_000,
        volatility: 0.6,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'charisma', min: 45 }],
      },
      {
        title: 'Pequena empresa',
        salary: 155_000,
        volatility: 0.7,
        minYears: 3,
        requirements: [
          // Administração troca carisma por diploma: quem estudou gestão sobe
          // sem precisar ser o mais carismático da sala.
          {
            type: 'anyOf',
            conditions: [
              { type: 'flag', flag: 'course_administracao', value: true },
              { type: 'stat', stat: 'charisma', min: 55 },
            ],
          },
          { type: 'performance', min: 50 },
        ],
      },
      {
        title: 'Empresa média',
        salary: 340_000,
        volatility: 0.8,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 65 },
          { type: 'stat', stat: 'intelligence', min: 60 },
          { type: 'performance', min: 60 },
        ],
      },
      {
        title: 'Grupo empresarial',
        salary: 820_000,
        volatility: 0.85,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 75 },
          { type: 'stat', stat: 'reputation', min: 60 },
          { type: 'performance', min: 72 },
        ],
      },
    ],
  },

  {
    id: 'celebrity',
    name: 'Celebridade',
    kind: 'celebrity',
    entryLabel: 'Tentar viver de holofote',
    entryHint: 'Fama vira dinheiro. Escândalo derruba tudo, e quase ninguém chega ao topo.',
    annualEffects: [{ type: 'stat', stat: 'fame', op: 'delta', value: 3 }],
    levels: [
      {
        title: 'Criador de conteúdo',
        salary: 14_000,
        volatility: 0.7,
        minYears: 0,
        requirements: [{ type: 'age', min: 15 }],
      },
      {
        title: 'Nome conhecido',
        salary: 70_000,
        volatility: 0.7,
        minYears: 2,
        requirements: [
          // Artes Cênicas é o atalho: quem se formou passa com menos fama.
          // É a única coisa que aquele diploma abre, e precisa abrir alguma.
          {
            type: 'anyOf',
            conditions: [
              { type: 'flag', flag: 'course_artes', value: true },
              { type: 'stat', stat: 'fame', min: 25 },
            ],
          },
          { type: 'stat', stat: 'charisma', min: 50 },
        ],
      },
      {
        title: 'Artista nacional',
        salary: 280_000,
        volatility: 0.75,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'fame', min: 50 },
          { type: 'stat', stat: 'looks', min: 55 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Celebridade',
        salary: 900_000,
        volatility: 0.8,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'fame', min: 72 },
          { type: 'stat', stat: 'reputation', min: 50 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Ícone',
        salary: 2_400_000,
        volatility: 0.85,
        minYears: 6,
        requirements: [
          { type: 'stat', stat: 'fame', min: 88 },
          { type: 'stat', stat: 'reputation', min: 65 },
          { type: 'performance', min: 78 },
        ],
      },
    ],
  },

  {
    id: 'crime',
    name: 'Crime',
    kind: 'crime',
    entryLabel: 'Entrar para o crime',
    entryHint: 'Retorno alto e volátil. Cadeia é questão de tempo, não de sorte.',
    levels: [
      {
        title: 'Batedor de carteira',
        salary: 26_000,
        volatility: 0.6,
        minYears: 0,
        requirements: [{ type: 'age', min: 14 }],
      },
      {
        title: 'Assaltante',
        salary: 85_000,
        volatility: 0.7,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'health', min: 40 }],
      },
      {
        title: 'Chefe de quadrilha',
        salary: 260_000,
        volatility: 0.8,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 55 },
          { type: 'performance', min: 50 },
          // Contato feito na cadeia. Quem nunca esteve lá dentro não sobe aqui.
          { type: 'flag', flag: 'underworld_ties', value: true },
        ],
      },
      {
        title: 'Traficante regional',
        salary: 720_000,
        volatility: 0.85,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 65 },
          { type: 'performance', min: 62 },
        ],
      },
      {
        title: 'Chefão',
        salary: 2_100_000,
        volatility: 0.9,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 78 },
          { type: 'performance', min: 75 },
        ],
      },
    ],
  },

  {
    id: 'politics',
    name: 'Política',
    kind: 'politics',
    entryLabel: 'Entrar para a política',
    entryHint: 'Sobe com reputação e rede de contatos. Ficha suja fecha a porta.',
    annualEffects: [{ type: 'stat', stat: 'fame', op: 'delta', value: 2 }],
    levels: [
      {
        title: 'Assessor',
        salary: 48_000,
        minYears: 0,
        requirements: [
          { type: 'age', min: 21 },
          { type: 'education', level: 'highschool', atLeast: true },
          { type: 'stat', stat: 'charisma', min: 45 },
          { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
        ],
      },
      {
        title: 'Vereador',
        salary: 115_000,
        volatility: 0.1,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 55 },
          { type: 'stat', stat: 'reputation', min: 50 },
          // O `entryHint` prometia "rede de contatos" desde a Fase 4 e nenhum
          // dos cinco níveis usava relationCount ou relationLevel: o texto
          // mentia para o jogador.
          //
          // Os números vêm da distribuição medida, não de palpite: uma vida
          // acumula ~20 amigos, mas só ~5 passam de 60 de relação (p90: 7) e
          // ~1 passa de 80 (p90: 2). Contar amigos crus não prendia nada.
          { type: 'relationCount', kind: 'friend', min: 3, minRelation: 60 },
        ],
      },
      {
        title: 'Deputado',
        salary: 280_000,
        volatility: 0.1,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 65 },
          { type: 'stat', stat: 'reputation', min: 60 },
          { type: 'performance', min: 55 },
          { type: 'relationCount', kind: 'friend', min: 5, minRelation: 60 },
        ],
      },
      {
        title: 'Senador',
        salary: 540_000,
        volatility: 0.1,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 75 },
          { type: 'stat', stat: 'reputation', min: 70 },
          { type: 'performance', min: 65 },
          { type: 'relationCount', kind: 'friend', min: 5, minRelation: 60 },
          // Não basta ter gente em volta: alguém tem que te querer bem.
          { type: 'relationCount', kind: 'friend', min: 1, minRelation: 80 },
        ],
      },
      {
        title: 'Governador',
        salary: 980_000,
        volatility: 0.1,
        minYears: 6,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 82 },
          { type: 'stat', stat: 'reputation', min: 78 },
          { type: 'performance', min: 75 },
          { type: 'relationCount', kind: 'friend', min: 6, minRelation: 60 },
          { type: 'relationCount', kind: 'friend', min: 2, minRelation: 75 },
        ],
      },
    ],
  },

  {
    id: 'academia',
    name: 'Acadêmica',
    kind: 'academia',
    entryLabel: 'Seguir carreira acadêmica',
    entryHint: 'Paga bem menos que o mercado e ninguém é demitido. Exige pós.',
    levels: [
      {
        title: 'Professor substituto',
        salary: 46_000,
        minYears: 0,
        requirements: [
          // Era 24, e o caminho mais rápido (médio aos 18, graduação de 4,
          // mestrado de 2) chega exatamente aos 24: zero folga, e qualquer
          // ano perdido empurrava a entrada inteira.
          { type: 'age', min: 22 },
          // Licenciatura entra sem pós — é a porta de quem se formou professor.
          // Os níveis seguintes continuam exigindo o mestrado.
          {
            type: 'anyOf',
            conditions: [
              { type: 'flag', flag: 'course_licenciatura', value: true },
              { type: 'education', level: 'postgrad', atLeast: true },
            ],
          },
        ],
      },
      {
        title: 'Professor assistente',
        salary: 78_000,
        minYears: 3,
        requirements: [
          { type: 'education', level: 'postgrad', atLeast: true },
          { type: 'stat', stat: 'intelligence', min: 62 },
        ],
      },
      {
        title: 'Professor adjunto',
        salary: 115_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 72 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Professor titular',
        salary: 165_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 80 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Pesquisador de referência',
        salary: 230_000,
        minYears: 6,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 88 },
          { type: 'stat', stat: 'reputation', min: 60 },
          { type: 'performance', min: 75 },
        ],
      },
    ],
  },

  // --- Profissões -----------------------------------------------------------
  // Todas de `kind: 'clt'`: são emprego formal, com demissão e antecedentes.
  // O que as separa do corporativo genérico é a porta de entrada — o diploma.

  {
    id: 'medicina',
    name: 'Medicina',
    kind: 'clt',
    entryLabel: 'Exercer a medicina',
    entryHint: 'Paga como nenhuma outra e cobra em plantão. Exige o diploma.',
    levels: [
      {
        title: 'Residente',
        salary: 42_000,
        minYears: 0,
        requirements: [
          { type: 'flag', flag: 'course_medicina', value: true },
          { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
        ],
      },
      {
        title: 'Plantonista',
        salary: 180_000,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'intelligence', min: 60 }],
      },
      {
        title: 'Especialista',
        salary: 320_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 72 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Cirurgião',
        salary: 520_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 80 },
          { type: 'performance', min: 68 },
        ],
      },
      {
        title: 'Chefe de equipe médica',
        salary: 780_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 85 },
          { type: 'stat', stat: 'reputation', min: 62 },
          { type: 'performance', min: 78 },
        ],
      },
    ],
    // O plantão cobra o preço todo ano, em qualquer nível.
    annualEffects: [{ type: 'stat', stat: 'health', op: 'delta', value: -2 }],
  },

  {
    id: 'direito',
    name: 'Advocacia',
    kind: 'clt',
    entryLabel: 'Advogar',
    entryHint: 'Sobe com carisma e reputação. Exige o diploma.',
    levels: [
      {
        title: 'Estagiário de escritório',
        salary: 36_000,
        minYears: 0,
        requirements: [
          { type: 'flag', flag: 'course_direito', value: true },
          { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
        ],
      },
      {
        title: 'Advogado associado',
        salary: 95_000,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'charisma', min: 50 }],
      },
      {
        title: 'Advogado sênior',
        salary: 195_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 62 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Sócio',
        salary: 420_000,
        volatility: 0.12,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 72 },
          { type: 'stat', stat: 'reputation', min: 58 },
          { type: 'performance', min: 68 },
        ],
      },
      {
        title: 'Sócio-fundador',
        salary: 700_000,
        volatility: 0.15,
        minYears: 6,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 80 },
          { type: 'stat', stat: 'reputation', min: 68 },
          { type: 'performance', min: 78 },
        ],
      },
    ],
  },

  {
    id: 'engenharia',
    name: 'Engenharia',
    kind: 'clt',
    entryLabel: 'Trabalhar como engenheiro',
    entryHint: 'Estável e bem paga. Sobe com inteligência. Exige o diploma.',
    levels: [
      {
        title: 'Engenheiro júnior',
        salary: 68_000,
        minYears: 0,
        requirements: [
          { type: 'flag', flag: 'course_engenharia', value: true },
          { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
        ],
      },
      {
        title: 'Engenheiro pleno',
        salary: 120_000,
        minYears: 3,
        requirements: [{ type: 'stat', stat: 'intelligence', min: 62 }],
      },
      {
        title: 'Engenheiro sênior',
        salary: 195_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 72 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Coordenador de projetos',
        salary: 300_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 78 },
          { type: 'stat', stat: 'charisma', min: 55 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Diretor de engenharia',
        salary: 480_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 84 },
          { type: 'stat', stat: 'charisma', min: 65 },
          { type: 'performance', min: 75 },
        ],
      },
    ],
  },
]
