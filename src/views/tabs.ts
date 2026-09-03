export type TabKey = 'life' | 'actions' | 'relations' | 'assets' | 'profile'

export const TABS: readonly { key: TabKey; label: string; glyph: string }[] = [
  { key: 'life', label: 'Vida', glyph: '§' },
  { key: 'actions', label: 'Ações', glyph: '✳' },
  { key: 'relations', label: 'Relações', glyph: '¶' },
  { key: 'assets', label: 'Bens', glyph: '¤' },
  { key: 'profile', label: 'Perfil', glyph: '☰' },
]
