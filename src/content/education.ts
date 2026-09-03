// Cursos. Concluir um curso concede o nível de escolaridade e a flag
// `course_<id>`, que as carreiras e os eventos podem exigir.

import type { Course } from '../engine/types'

export const COURSES: Course[] = [
  {
    id: 'direito',
    name: 'Direito',
    grants: 'bachelor',
    years: 5,
    annualCost: 22_000,
    requirements: [
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 50 },
    ],
    completionEffects: [
      { type: 'stat', stat: 'intelligence', op: 'delta', value: 10 },
      { type: 'stat', stat: 'charisma', op: 'delta', value: 8 },
    ],
  },
  {
    id: 'engenharia',
    name: 'Engenharia',
    grants: 'bachelor',
    years: 5,
    annualCost: 20_000,
    requirements: [
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 60 },
    ],
    completionEffects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 16 }],
  },
  {
    id: 'medicina',
    name: 'Medicina',
    grants: 'bachelor',
    years: 6,
    annualCost: 60_000,
    requirements: [
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 72 },
    ],
    completionEffects: [
      { type: 'stat', stat: 'intelligence', op: 'delta', value: 14 },
      { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
      { type: 'stat', stat: 'health', op: 'delta', value: -6 },
    ],
  },
  {
    id: 'administracao',
    name: 'Administração',
    grants: 'bachelor',
    years: 4,
    annualCost: 14_000,
    requirements: [
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 40 },
    ],
    completionEffects: [
      { type: 'stat', stat: 'intelligence', op: 'delta', value: 7 },
      { type: 'stat', stat: 'charisma', op: 'delta', value: 7 },
    ],
  },
  {
    id: 'artes',
    name: 'Artes Cênicas',
    grants: 'bachelor',
    years: 4,
    annualCost: 11_000,
    requirements: [{ type: 'education', level: 'highschool', atLeast: true }],
    completionEffects: [
      { type: 'stat', stat: 'charisma', op: 'delta', value: 12 },
      { type: 'stat', stat: 'looks', op: 'delta', value: 6 },
      { type: 'stat', stat: 'fame', op: 'delta', value: 8 },
    ],
  },
  {
    id: 'licenciatura',
    name: 'Licenciatura',
    grants: 'bachelor',
    years: 4,
    annualCost: 8_000,
    requirements: [
      { type: 'education', level: 'highschool', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 35 },
    ],
    completionEffects: [
      { type: 'stat', stat: 'intelligence', op: 'delta', value: 9 },
      { type: 'stat', stat: 'reputation', op: 'delta', value: 5 },
    ],
  },
  {
    id: 'mestrado',
    name: 'Mestrado',
    grants: 'postgrad',
    years: 2,
    annualCost: 18_000,
    requirements: [
      { type: 'education', level: 'bachelor', atLeast: true },
      { type: 'stat', stat: 'intelligence', min: 65 },
    ],
    completionEffects: [
      { type: 'stat', stat: 'intelligence', op: 'delta', value: 12 },
      { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
    ],
  },
]

/** Rótulos das flags de curso, para o Perfil listar "Formado em Direito". */
export const COURSE_FLAG_LABELS: Record<string, string> = Object.fromEntries(
  COURSES.map((course) => [`course_${course.id}`, `Formado em ${course.name}`]),
)
