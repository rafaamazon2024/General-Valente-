export interface ExercicioSeed {
  nome: string;
  grupo_muscular: string;
  link_video: string;
}

// Pré-cadastro inicial da Biblioteca de Exercícios. Usado só uma vez, na primeira vez que o
// usuário abre a Biblioteca com a coleção "exercicios" vazia (ver src/hooks/useExercicios.ts).
export const EXERCICIOS_SEED: ExercicioSeed[] = [
  { nome: 'Puxada Alta', grupo_muscular: 'Costas', link_video: 'https://www.youtube.com/watch?v=vdtCzAGo6tY' },
  { nome: 'Remada / Costas', grupo_muscular: 'Costas', link_video: 'https://www.youtube.com/watch?v=sRv1gDAeKcw' },
  { nome: 'Treino de Costas (geral)', grupo_muscular: 'Costas', link_video: 'https://www.youtube.com/watch?v=y7CrALaIi6E' },

  { nome: 'Cadeira Extensora', grupo_muscular: 'Pernas', link_video: 'https://www.youtube.com/watch?v=I_uBK4DDflU' },
  { nome: 'Cadeira Extensora (erros comuns)', grupo_muscular: 'Pernas', link_video: 'https://www.youtube.com/watch?v=4A4WITt6XDc' },

  { nome: 'Ombros (ranking de exercícios)', grupo_muscular: 'Ombros/Braços', link_video: 'https://www.youtube.com/watch?v=txqwxKaHYWY' },
  { nome: 'Tríceps Corda', grupo_muscular: 'Ombros/Braços', link_video: 'https://www.youtube.com/watch?v=KhK5HWJfsrQ' },
  { nome: 'Rosca Martelo', grupo_muscular: 'Ombros/Braços', link_video: '' },

  { nome: 'Supino (nome provisório)', grupo_muscular: 'Peito', link_video: '' },
];
