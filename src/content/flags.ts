// Rótulos pt-BR das flags usadas pelo conteúdo. Flag sem rótulo aqui
// simplesmente não aparece no Perfil — nenhuma regra depende disso.

import { COURSE_FLAG_LABELS } from './education'

const HAND_WRITTEN: Record<string, string> = {
  had_pet: 'Teve um cachorro',
  was_bullied: 'Sofreu bullying',
  caught_cheating: 'Pego colando',
  had_first_gig: 'Primeiro emprego informal',
  plays_music: 'Toca em banda',
  exam_prepped: 'Preparou-se para o vestibular',
  lives_alone: 'Saiu da casa dos pais',
  married: 'Casado',
  trains_regularly: 'Treina com regularidade',
  chronic_condition: 'Condição crônica',
  has_child: 'Tem filho',
  chose_no_children: 'Optou por não ter filhos',
  retired: 'Aposentado',
  wrote_memoir: 'Escreveu suas memórias',
  criminal_record: 'Ficha suja',
  underworld_ties: 'Contatos no crime',
  owes_favors: 'Deve favores políticos',
  philanthropist: 'Filantropo',
  public_scandal: 'Envolvido em escândalo público',
  snitched_inside: 'Entregou alguém na cadeia',
}

/** Rótulos de curso saem do próprio catálogo, para não sair de sincronia. */
export const FLAG_LABELS: Record<string, string> = {
  ...HAND_WRITTEN,
  ...COURSE_FLAG_LABELS,
}
