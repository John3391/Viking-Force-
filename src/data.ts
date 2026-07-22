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

export const DEFAULT_STUDENTS: Record<string, StudentProfile> = {
  'erik@viking.com': {
    name: 'Erik',
    plan: 'Mensal',
    status: 'Pago',
    prs: { squat: 150, bench: 110, deadlift: 190 },
    prevPrs: { squat: 140, bench: 105, deadlift: 185 },
    preferredTime: '18:00',
    age: 28,
    bodyWeight: 82.5,
    gender: 'male',
    chatHistory: [
      { id: '1', sender: 'trainer', text: 'Excelente progresso nas cargas de agachamento esta semana, Erik! Continue focado na profundidade.', timestamp: '08/07/2026, 19:30' },
      { id: '2', sender: 'student', text: 'Obrigado, mestre! Senti que a dica de forçar os joelhos para fora me deu muita estabilidade no buraco.', timestamp: '08/07/2026, 20:15' }
    ],
    sessions: [
      {
        date: '08/07/2026',
        sessionName: 'Treino A',
        exercises: [
          { name: 'Agachamento Livre', rpe: 8 },
          { name: 'Supino Reto', rpe: 7.5 },
          { name: 'Levantamento Terra', rpe: 8.5 },
          { name: 'Remada Curvada', rpe: 7 }
        ],
        avgRPE: 7.8,
        note: 'Semana pesada, mas técnica se manteve estável.'
      },
      {
        date: '01/07/2026',
        sessionName: 'Treino A',
        exercises: [
          { name: 'Agachamento Livre', rpe: 6 },
          { name: 'Supino Reto', rpe: 6 },
          { name: 'Levantamento Terra', rpe: 6 }
        ],
        avgRPE: 6.0,
        note: 'Deload concluído com sucesso, pronto para o novo ciclo.'
      }
    ]
  },
  'bjorn@viking.com': {
    name: 'Bjorn',
    plan: 'Trimestral',
    status: 'Pago',
    accessBlocked: false,
    prs: { squat: 160, bench: 120, deadlift: 200 },
    prevPrs: { squat: 150, bench: 115, deadlift: 190 },
    preferredTime: '20:00',
    age: 32,
    bodyWeight: 105.0,
    gender: 'male',
    chatHistory: [
      { id: '1', sender: 'trainer', text: 'Cuidado com o RPE alto no Levantamento Terra, Bjorn. Se chegar a 9.5 frequentemente, podemos ajustar a porcentagem de intensidade.', timestamp: '07/07/2026, 21:00' },
      { id: '2', sender: 'student', text: 'Entendido, vou tentar regular melhor a força inicial na próxima sessão.', timestamp: '07/07/2026, 21:30' }
    ],
    sessions: [
      {
        date: '07/07/2026',
        sessionName: 'Treino A',
        exercises: [
          { name: 'Agachamento Livre', rpe: 9 },
          { name: 'Supino Reto', rpe: 9 },
          { name: 'Levantamento Terra', rpe: 9.5 },
          { name: 'Remada Curvada', rpe: 9.5 }
        ],
        avgRPE: 9.3,
        note: 'Terra muito pesado hoje, quase falhei na última série.'
      }
    ]
  },
  'freya@viking.com': {
    name: 'Freya',
    plan: 'Anual',
    status: 'Pago',
    accessBlocked: false,
    prs: { squat: 130, bench: 90, deadlift: 160 },
    prevPrs: { squat: 120, bench: 85, deadlift: 150 },
    preferredTime: '07:00',
    age: 25,
    bodyWeight: 63.0,
    gender: 'female',
    chatHistory: [
      { id: '1', sender: 'trainer', text: 'Treino muito sólido hoje, Freya! RPE de 6.6 médio é ideal para esta semana de acumulação.', timestamp: '06/07/2026, 09:00' }
    ],
    sessions: [
      {
        date: '06/07/2026',
        sessionName: 'Treino A',
        exercises: [
          { name: 'Agachamento Livre', rpe: 7 },
          { name: 'Supino Reto', rpe: 6.5 },
          { name: 'Levantamento Terra', rpe: 6.5 },
          { name: 'Remada Curvada', rpe: 6.5 }
        ],
        avgRPE: 6.6,
        note: 'Treino tranquilo, sobrou bastante em todas as séries.'
      }
    ]
  }
};
