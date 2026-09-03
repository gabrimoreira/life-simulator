// Rotulos pt-BR dos enums do proprio engine.
//
// Mora em `engine/` e nao em `content/` de proposito: sao os nomes das coisas
// que o engine define (stats, niveis de educacao, classes). Se ficassem em
// `content/`, o engine passaria a depender do conteudo, invertendo a camada.

import type { EducationLevel, RelationKind, SocialClass, StatKey } from './types'

export const STAT_LABELS: Record<StatKey, string> = {
  health: 'Saúde',
  intelligence: 'Inteligência',
  looks: 'Aparência',
  charisma: 'Carisma',
  happiness: 'Felicidade',
  reputation: 'Reputação',
  luck: 'Sorte',
}

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  none: 'Sem escolaridade',
  elementary: 'Ensino Fundamental',
  highschool: 'Ensino Médio',
  bachelor: 'Graduação',
  postgrad: 'Pós-graduação',
}

export const SOCIAL_CLASS_LABELS: Record<SocialClass, string> = {
  poor: 'Classe baixa',
  lowerMiddle: 'Classe média baixa',
  middle: 'Classe média',
  upperMiddle: 'Classe média alta',
  rich: 'Classe alta',
}

export const RELATION_LABELS: Record<RelationKind, string> = {
  mother: 'Mãe',
  father: 'Pai',
  sibling: 'Irmão/Irmã',
  friend: 'Amigo/Amiga',
  partner: 'Namorado/Namorada',
  spouse: 'Cônjuge',
  child: 'Filho/Filha',
}

export function relationLabel(kind: RelationKind, gender: 'male' | 'female'): string {
  const male = gender === 'male'
  switch (kind) {
    case 'mother':
      return 'Mãe'
    case 'father':
      return 'Pai'
    case 'sibling':
      return male ? 'Irmão' : 'Irmã'
    case 'friend':
      return male ? 'Amigo' : 'Amiga'
    case 'partner':
      return male ? 'Namorado' : 'Namorada'
    case 'spouse':
      return male ? 'Marido' : 'Esposa'
    case 'child':
      return male ? 'Filho' : 'Filha'
  }
}
