import { TrainingProgram, StudentProfile } from './types';

export const DEFAULT_PROGRAM: TrainingProgram = {
  weeks: {
    1: {
      A: [
        {
          id: 'squat_w1a',
          name: 'Agachamento Livre',
          sets: 4,
          reps: 8,
          intensity: 0.80,
          targetRPE: 8,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.60, reps: 3 },
            { percent: 0.70, reps: 2 }
          ],
          techniqueTips: 'Mantenha o peito elevado, force os joelhos para fora na descida e garanta a profundidade abaixo do paralelo.',
          videoUrl: 'https://www.youtube.com/watch?v=F3SByb9LdNo'
        },
        {
          id: 'bench_w1a',
          name: 'Supino Reto',
          sets: 4,
          reps: 8,
          intensity: 0.75,
          targetRPE: 7.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.60, reps: 3 },
            { percent: 0.70, reps: 2 }
          ],
          techniqueTips: 'Pressione firmemente os calcanhares no chão (leg drive), faça a adução de escápulas e mantenha os cotovelos sob os punhos.',
          videoUrl: 'https://www.youtube.com/watch?v=vPctD92mGZ8'
        },
        {
          id: 'deadlift_w1a',
          name: 'Levantamento Terra',
          sets: 3,
          reps: 5,
          intensity: 0.85,
          targetRPE: 8.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.60, reps: 3 },
            { percent: 0.70, reps: 2 }
          ],
          techniqueTips: 'Remova a folga da barra (slack), contraia fortemente os dorsais e empurre o chão como se estivesse fazendo um leg press.',
          videoUrl: 'https://www.youtube.com/watch?v=AweC3UaM14o'
        },
        {
          id: 'row_w1a',
          name: 'Remada Curvada',
          sets: 3,
          reps: 10,
          intensity: 'Carga Livre',
          targetRPE: 7,
          main: false,
          warmup: []
        }
      ],
      B: [
        {
          id: 'squat_w1b',
          name: 'Agachamento com Pausa',
          sets: 4,
          reps: 6,
          intensity: 0.75,
          targetRPE: 8,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 3 },
            { percent: 0.65, reps: 2 }
          ]
        },
        {
          id: 'bench_w1b',
          name: 'Supino com Pausa',
          sets: 4,
          reps: 6,
          intensity: 0.70,
          targetRPE: 7.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 3 },
            { percent: 0.65, reps: 2 }
          ]
        },
        {
          id: 'deadlift_w1b',
          name: 'Terra com Déficit',
          sets: 3,
          reps: 4,
          intensity: 0.80,
          targetRPE: 8,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 3 },
            { percent: 0.65, reps: 2 }
          ]
        }
      ],
      C: [
        {
          id: 'squat_w1c',
          name: 'Agachamento Frontal',
          sets: 3,
          reps: 10,
          intensity: 0.65,
          targetRPE: 7,
          main: false,
          warmup: []
        },
        {
          id: 'bench_w1c',
          name: 'Supino Inclinado com Halteres',
          sets: 3,
          reps: 10,
          intensity: 0.65,
          targetRPE: 7,
          main: false,
          warmup: []
        },
        {
          id: 'row_w1c',
          name: 'Puxada Aberta na Polia',
          sets: 3,
          reps: 12,
          intensity: 'Carga Livre',
          targetRPE: 7,
          main: false,
          warmup: []
        }
      ]
    },
    2: {
      A: [
        {
          id: 'squat_w2a',
          name: 'Agachamento Livre',
          sets: 4,
          reps: 6,
          intensity: 0.825,
          targetRPE: 8,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 4 },
            { percent: 0.65, reps: 3 },
            { percent: 0.75, reps: 1 }
          ]
        },
        {
          id: 'bench_w2a',
          name: 'Supino Reto',
          sets: 4,
          reps: 6,
          intensity: 0.775,
          targetRPE: 7.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 4 },
            { percent: 0.65, reps: 3 },
            { percent: 0.75, reps: 1 }
          ]
        },
        {
          id: 'deadlift_w2a',
          name: 'Levantamento Terra',
          sets: 3,
          reps: 4,
          intensity: 0.875,
          targetRPE: 8.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.55, reps: 4 },
            { percent: 0.65, reps: 3 },
            { percent: 0.75, reps: 1 }
          ]
        }
      ],
      B: [],
      C: []
    },
    3: {
      A: [
        {
          id: 'squat_w3a',
          name: 'Agachamento Livre',
          sets: 5,
          reps: 4,
          intensity: 0.85,
          targetRPE: 8.5,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.65, reps: 2 },
            { percent: 0.75, reps: 1 }
          ]
        },
        {
          id: 'bench_w3a',
          name: 'Supino Reto',
          sets: 5,
          reps: 4,
          intensity: 0.80,
          targetRPE: 8,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.65, reps: 2 },
            { percent: 0.75, reps: 1 }
          ]
        },
        {
          id: 'deadlift_w3a',
          name: 'Levantamento Terra',
          sets: 4,
          reps: 3,
          intensity: 0.90,
          targetRPE: 9,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 4 },
            { percent: 0.65, reps: 2 },
            { percent: 0.75, reps: 1 }
          ]
        }
      ],
      B: [],
      C: []
    },
    4: {
      A: [
        {
          id: 'squat_w4a',
          name: 'Agachamento Livre',
          sets: 3,
          reps: 5,
          intensity: 0.60,
          targetRPE: 6,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 3 }
          ]
        },
        {
          id: 'bench_w4a',
          name: 'Supino Reto',
          sets: 3,
          reps: 5,
          intensity: 0.60,
          targetRPE: 6,
          main: true,
          warmup: [
            { percent: 0.40, reps: 5 },
            { percent: 0.50, reps: 3 }
          ]
        }
      ],
      B: [],
      C: []
    }
  }
};

export const DEFAULT_STUDENTS: Record<string, StudentProfile> = {};
