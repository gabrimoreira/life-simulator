// Ativos compráveis. Cada um tem manutenção anual — dinheiro parado não é
// neutro, e nenhum destes é só um número guardado.

import type { AssetDef } from '../engine/types'

export const ASSETS: AssetDef[] = [
  // --- Veículos: depreciam. São conforto, não investimento. ----------------
  {
    id: 'car_popular',
    name: 'Carro popular',
    kind: 'vehicle',
    hint: 'Resolve a vida. Perde valor todo ano, como todo carro.',
    price: 55_000,
    upkeepRate: 0.09,
    appreciation: -0.09,
    volatility: 0.02,
    requirements: [{ type: 'age', min: 18 }],
  },
  {
    id: 'car_premium',
    name: 'Carro importado',
    kind: 'vehicle',
    hint: 'Caro de comprar, caro de manter, some rápido.',
    price: 320_000,
    upkeepRate: 0.12,
    appreciation: -0.11,
    volatility: 0.03,
    requirements: [{ type: 'age', min: 18 }],
  },

  // --- Imóveis: valorizam devagar e cobram IPTU e reforma. -----------------
  {
    id: 'apartment_small',
    name: 'Apartamento de dois quartos',
    kind: 'property',
    hint: 'Sai do aluguel. Valoriza devagar, cobra condomínio e IPTU.',
    price: 340_000,
    upkeepRate: 0.035,
    appreciation: 0.05,
    volatility: 0.05,
    requirements: [{ type: 'age', min: 18 }],
  },
  {
    id: 'house',
    name: 'Casa com quintal',
    kind: 'property',
    hint: 'Espaço de verdade, e manutenção de verdade junto.',
    price: 780_000,
    upkeepRate: 0.04,
    appreciation: 0.05,
    volatility: 0.06,
    requirements: [{ type: 'age', min: 21 }],
  },
  {
    id: 'beach_house',
    name: 'Casa de praia',
    kind: 'property',
    hint: 'Você vai em duas semanas por ano e paga as outras cinquenta.',
    price: 1_400_000,
    upkeepRate: 0.055,
    appreciation: 0.055,
    volatility: 0.09,
    requirements: [{ type: 'age', min: 25 }],
  },

  // --- Investimentos: sem manutenção, com risco proporcional ao retorno. ---
  {
    id: 'fixed_income',
    name: 'Renda fixa',
    kind: 'investment',
    hint: 'Rende pouco e quase nunca decepciona.',
    price: 20_000,
    upkeepRate: 0.005,
    appreciation: 0.04,
    volatility: 0.02,
    requirements: [{ type: 'age', min: 16 }],
  },
  {
    id: 'stock_fund',
    name: 'Fundo de ações',
    kind: 'investment',
    hint: 'Ano bom paga a casa. Ano ruim leva um terço.',
    price: 60_000,
    upkeepRate: 0.01,
    appreciation: 0.065,
    volatility: 0.3,
    requirements: [{ type: 'age', min: 18 }],
  },
  {
    id: 'startup_equity',
    name: 'Participação numa startup',
    kind: 'investment',
    hint: 'Quase sempre vira pó. Quase.',
    price: 150_000,
    upkeepRate: 0,
    appreciation: 0.11,
    volatility: 0.85,
    requirements: [
      { type: 'age', min: 21 },
      { type: 'stat', stat: 'intelligence', min: 55 },
    ],
  },
]
