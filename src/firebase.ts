import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { StudentProfile, TrainingProgram, VikingPlan, DbExercise, DbMobilityExercise, CalendarEvent } from './types';
import { DEFAULT_STUDENTS, DEFAULT_PROGRAM } from './data';

const firebaseConfig = {
  apiKey: "AIzaSyCHJlWTIKIpKc3duV_9PFe0QO9A9eKnGHI",
  authDomain: "flutter-ai-playground-dc7ae.firebaseapp.com",
  projectId: "flutter-ai-playground-dc7ae",
  storageBucket: "flutter-ai-playground-dc7ae.firebasestorage.app",
  messagingSenderId: "1047815781145",
  appId: "1:1047815781145:web:b80a49fa1d465fd77c2388"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-remixvikingforce-975519ec-fc30-48ed-bba6-b972bb76ae87");
export const auth = getAuth(app);
export const storage = getStorage(app);

// --- ERROR HANDLING FOR FIRESTORE (As required by Firebase Integration Skill) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Warning: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- FIREBASE SYNC METHODS ---

/**
 * Fetch all students from Firestore.
 * If collection is empty, initializes it with DEFAULT_STUDENTS.
 */
export async function fetchStudentsFromFirebase(): Promise<Record<string, StudentProfile>> {
  try {
    const studentsCol = collection(db, 'students');
    const snapshot = await getDocs(studentsCol);
    
    if (snapshot.empty) {
      // First-time setup: write DEFAULT_STUDENTS to Firestore
      const initial: Record<string, StudentProfile> = DEFAULT_STUDENTS;
      for (const email of Object.keys(initial)) {
        try {
          await setDoc(doc(db, 'students', email), initial[email]);
        } catch (e) {
          console.warn("Falha ao salvar estudante inicial no Firestore:", email, e);
        }
      }
      return initial;
    }
    
    const students: Record<string, StudentProfile> = {};
    snapshot.forEach((d) => {
      students[d.id] = d.data() as StudentProfile;
    });
    return students;
  } catch (error) {
    const cached = localStorage.getItem('viking_students');
    if (cached) {
      try {
        return JSON.parse(cached) as Record<string, StudentProfile>;
      } catch (_) {}
    }
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes('offline') || 
      errMessage.includes('network') || 
      errMessage.includes('token') || 
      errMessage.includes('Could not reach') ||
      errMessage.includes('Backend didn\'t respond')
    ) {
      console.warn("Firestore offline ou instável, usando DEFAULT_STUDENTS:", error);
      return DEFAULT_STUDENTS;
    }
    handleFirestoreError(error, OperationType.LIST, 'students');
  }
}

/**
 * Subscribe to the 'students' collection in real-time.
 */
export function subscribeStudents(
  onUpdate: (students: Record<string, StudentProfile>) => void
): () => void {
  const colRef = collection(db, 'students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const students: Record<string, StudentProfile> = {};
      snapshot.forEach((d) => {
        students[d.id] = d.data() as StudentProfile;
      });
      onUpdate(students);
    },
    (error) => {
      const errMessage = error instanceof Error ? error.message : String(error);
      if (
        errMessage.includes('offline') || 
        errMessage.includes('network') || 
        errMessage.includes('token') || 
        errMessage.includes('Could not reach') ||
        errMessage.includes('Backend didn\'t respond')
      ) {
        console.warn("Inscrição em tempo real offline/instável:", error);
        return;
      }
      handleFirestoreError(error, OperationType.GET, 'students');
    }
  );
}

/**
 * Save/update a single student document in Firestore.
 */
export async function saveStudentToFirebase(email: string, student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', email), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${email}`);
  }
}

/**
 * Delete a student document from Firestore.
 */
export async function deleteStudentFromFirebase(email: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', email));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${email}`);
  }
}

/**
 * Subscribe to the training program in real-time.
 */
export function subscribeProgram(
  onUpdate: (program: TrainingProgram) => void
): () => void {
  const docRef = doc(db, 'config', 'program');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as TrainingProgram);
      }
    },
    (error) => {
      const errMessage = error instanceof Error ? error.message : String(error);
      if (
        errMessage.includes('offline') || 
        errMessage.includes('network') || 
        errMessage.includes('token') || 
        errMessage.includes('Could not reach') ||
        errMessage.includes('Backend didn\'t respond')
      ) {
        console.warn("Inscrição em tempo real offline/instável:", error);
        return;
      }
      handleFirestoreError(error, OperationType.GET, 'config/program');
    }
  );
}

/**
 * Fetch training program from Firestore.
 * If not found, initializes with DEFAULT_PROGRAM.
 */
export async function fetchProgramFromFirebase(): Promise<TrainingProgram> {
  try {
    const programDocRef = doc(db, 'config', 'program');
    const programSnap = await getDoc(programDocRef);
    
    if (programSnap.exists()) {
      return programSnap.data() as TrainingProgram;
    } else {
      // Initialize with DEFAULT_PROGRAM
      try {
        await setDoc(programDocRef, DEFAULT_PROGRAM);
      } catch (e) {
        console.warn("Falha ao salvar DEFAULT_PROGRAM no Firestore:", e);
      }
      return DEFAULT_PROGRAM;
    }
  } catch (error) {
    const cached = localStorage.getItem('viking_program');
    if (cached) {
      try {
        return JSON.parse(cached) as TrainingProgram;
      } catch (_) {}
    }
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes('offline') || 
      errMessage.includes('network') || 
      errMessage.includes('token') || 
      errMessage.includes('Could not reach') ||
      errMessage.includes('Backend didn\'t respond')
    ) {
      console.warn("Firestore offline ou instável, usando DEFAULT_PROGRAM:", error);
      return DEFAULT_PROGRAM;
    }
    handleFirestoreError(error, OperationType.GET, 'config/program');
  }
}

/**
 * Save training program to Firestore.
 */
export async function saveProgramToFirebase(program: TrainingProgram): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'program'), program);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/program');
  }
}

/**
 * Fetch custom viking plans from Firestore.
 */
export async function fetchPlansFromFirebase(): Promise<VikingPlan[] | null> {
  try {
    const plansDocRef = doc(db, 'config', 'plans');
    const plansSnap = await getDoc(plansDocRef);
    
    if (plansSnap.exists()) {
      return (plansSnap.data() as { plans: VikingPlan[] }).plans;
    }
    return null;
  } catch (error) {
    const cached = localStorage.getItem('viking_plans');
    if (cached) {
      try {
        return JSON.parse(cached) as VikingPlan[];
      } catch (_) {}
    }
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes('offline') || 
      errMessage.includes('network') || 
      errMessage.includes('token') || 
      errMessage.includes('Could not reach') ||
      errMessage.includes('Backend didn\'t respond')
    ) {
      console.warn("Firestore offline ou instável, retornando array vazio de planos:", error);
      return [];
    }
    handleFirestoreError(error, OperationType.GET, 'config/plans');
  }
}

/**
 * Save custom plans to Firestore.
 */
export async function savePlansToFirebase(plans: VikingPlan[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'plans'), { plans });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/plans');
  }
}

export function generate500Exercises(): DbExercise[] {
  const categories = [
    {
      group: "Peito",
      bases: [
        { name: "Supino Reto", tip: "Mantenha a adução escapular e controle a descida até o peito." },
        { name: "Supino Inclinado", tip: "Foco na porção clavicular do peitoral. Não exagere na inclinação do banco." },
        { name: "Supino Declinado", tip: "Excelente estímulo para a porção inferior do peito com menor estresse no ombro." },
        { name: "Crucifixo", tip: "Alongue bem as fibras do peitoral sem flexionar excessivamente os cotovelos." },
        { name: "Crossover", tip: "Foco na contração de pico no centro do movimento." },
        { name: "Flexão de Braço", tip: "Mantenha o core rígido e os cotovelos a 45 graus do corpo." },
        { name: "Peck Deck / Voador", tip: "Mantenha os ombros deprimidos e contraia o peitoral com máxima amplitude." }
      ],
      variations: [
        { name: "com Barra", tip: "Use uma pegada firme na largura dos ombros ou ligeiramente maior." },
        { name: "com Halteres", tip: "Permite maior amplitude de movimento na descida e rotação natural do punho." },
        { name: "na Máquina Articulada", tip: "Excelente para isolamento muscular com segurança mecânica." },
        { name: "com Halteres Pegada Neutra", tip: "Mais seguro para os ombros, focando na porção esternal." },
        { name: "no Cabo (Polia Alta)", tip: "Tensão constante ao longo de todo o arco de movimento." },
        { name: "no Cabo (Polia Média)", tip: "Foco na linha horizontal do peitoral médio." },
        { name: "no Cabo (Polia Baixa)", tip: "Trabalho direcionado para a porção superior do peito." },
        { name: "com Pausa de 2s", tip: "Anula a energia elástica, exigindo máxima força de partida." },
        { name: "Unilateral", tip: "Excelente para corrigir assimetrias de força e volume muscular." },
        { name: "com Elástico / Band", tip: "Acomoda a curva de força aumentando a resistência no final." }
      ]
    },
    {
      group: "Costas",
      bases: [
        { name: "Remada Curvada", tip: "Puxe a carga em direção ao umbigo mantendo a coluna totalmente neutra." },
        { name: "Remada Serrote", tip: "Puxe o halter na linha do quadril, focando na depressão e adução da escápula." },
        { name: "Puxada Alta", tip: "Puxe a barra em direção à clavícula superior sem inclinar excessivamente o tronco." },
        { name: "Remada Baixa", tip: "Mantenha o tronco ereto e esmague as escápulas na fase concêntrica." },
        { name: "Barra Fixa", tip: "Inicie o movimento ativando as escápulas antes de puxar com os braços." },
        { name: "Pullover", tip: "Alongue as grande dorsais mantendo uma leve flexão nos cotovelos." },
        { name: "Remada Cavalinho", tip: "Mantenha as pernas firmes e puxe com força na direção do abdômen." }
      ],
      variations: [
        { name: "Pronada", tip: "Foco maior nos romboides, trapézio médio e redondo maior." },
        { name: "Supinada", tip: "Aumento de ativação do bíceps braquial e porção inferior do latíssimo." },
        { name: "com Pegada Neutra", tip: "Posição anatômica mais segura para os ombros e forte recrutamento." },
        { name: "com Triângulo", tip: "Enfoca as fibras do latíssimo médio-inferior." },
        { name: "Pegada Aberta", tip: "Trabalho forte na largura das costas e redondo maior." },
        { name: "Pegada Focada em Alongamento", tip: "Enfatize a fase excêntrica alongando as dorsais ao máximo." },
        { name: "com Halteres", tip: "Permite ajuste milimétrico na trajetória do braço." },
        { name: "no Cabo", tip: "Garante contração contínua e uniforme." },
        { name: "Unilateral", tip: "Melhora o foco neuromuscular e corrige desequilíbrios." },
        { name: "com Apoio no Peito (Banco)", tip: "Elimina qualquer trapaça ou auxílio da lombar." }
      ]
    },
    {
      group: "Pernas (Quadríceps e Isquiotibiais)",
      bases: [
        { name: "Agachamento Livre", tip: "Empurre o chão com todo o pé. Joelhos na linha dos pés." },
        { name: "Leg Press 45", tip: "Não tire o quadril do banco na fase excêntrica. Pressione pelos calcanhares." },
        { name: "Cadeira Extensora", tip: "Ajuste o rolo nos tornozelos e contraia os quadríceps no topo por 1s." },
        { name: "Mesa Flexora", tip: "Mantenha o quadril colado no banco para isolar os isquiotibiais." },
        { name: "Cadeira Flexora", tip: "Ajuste firme e puxe até a máxima flexão de joelho." },
        { name: "Afundo / Passada", tip: "Dê um passo firme mantendo o joelho da frente alinhado." },
        { name: "Agachamento Búlgaro", tip: "Eleve o pé traseiro e desça verticalmente mantendo a postura." },
        { name: "Hack Machine", tip: "Excelente para colocar alto volume de treino com segurança mecânica." },
        { name: "Agachamento Frontal", tip: "Barra sobre as clavículas, cotovelos altos para manter a coluna ereta." }
      ],
      variations: [
        { name: "Barra Costas", tip: "Clássico construtor de força e hipertrofia geral." },
        { name: "com Halteres", tip: "Mais focado em estabilidade de core e controle postural." },
        { name: "com Pausa de 3s", tip: "Exige altíssimo controle motor na base do movimento." },
        { name: "Unilateral", tip: "Excelente opção para isolar e igualar a força das pernas." },
        { name: "foco em Excêntrica Lenta", tip: "Gera altíssimo estresse tensional e microlesões hipertróficas." },
        { name: "com Elástico", tip: "Ajuda a desenvolver potência e torque no final do movimento." },
        { name: "Pegada Sumô", tip: "Adução maior dos adutores e glúteos." },
        { name: "com Calcanhares Elevados", tip: "Aumenta a flexão de joelho e o foco nos quadríceps." },
        { name: "no Smith (Guiado)", tip: "Permite focar puramente nas pernas sem a demanda de equilíbrio." },
        { name: "Tempo 4-0-1-0", tip: "4 segundos para descer, sem pausa na base, 1 segundo para subir explosivo." }
      ]
    },
    {
      group: "Ombros",
      bases: [
        { name: "Desenvolvimento", tip: "Mantenha os antebraços verticais. Empurre a carga acima da cabeça." },
        { name: "Elevação Lateral", tip: "Incline levemente o tronco à frente e projete os halteres para os lados." },
        { name: "Elevação Frontal", tip: "Suba a carga até a linha dos olhos com controle." },
        { name: "Crucifixo Invertido", tip: "Foco no deltoide posterior. Não use o trapézio para dar impulso." },
        { name: "Encolhimento de Ombros", tip: "Eleve os ombros diretamente na direção das orelhas com controle." }
      ],
      variations: [
        { name: "com Halteres", tip: "Permite trajetória convergente ideal para o deltoide." },
        { name: "com Barra", tip: "Excelente construtor de força bruta nos ombros." },
        { name: "no Cabo", tip: "Mantém a tensão na parte inicial da elevação lateral." },
        { name: "na Máquina", tip: "Isolamento mecânico ideal para atingir a falha." },
        { name: "Sentado", tip: "Elimina a ajuda das pernas aumentando a sobrecarga pura nos ombros." },
        { name: "Em Pé", tip: "Exige ativação forte do core e glúteos para estabilização." },
        { name: "Unilateral no Cabo", tip: "Excelente para deltoide lateral isolado de forma pura." },
        { name: "com Rotação Neutra", tip: "Reduz o risco de impacto subacromial no ombro." },
        { name: "com Pausa no Pico", tip: "Sustente a contração por 2s para fadiga de fibras tipo I." },
        { name: "com Elástico", tip: "Aumenta progressivamente a resistência no final." }
      ]
    },
    {
      group: "Bíceps",
      bases: [
        { name: "Rosca Direta", tip: "Mantenha os cotovelos fixos ao lado do corpo. Não balance o tronco." },
        { name: "Rosca Alternada", tip: "Faça a supinação completa do punho durante a subida." },
        { name: "Rosca Martelo", tip: "Pegada neutra constante para focar no braquiorradial e braquial." },
        { name: "Rosca Concentrada", tip: "Apoie o cotovelo na coxa para isolamento puro do bíceps." },
        { name: "Rosca Scott", tip: "Apoio total dos braços no banco impede qualquer roubo." }
      ],
      variations: [
        { name: "com Barra W", tip: "Mais anatômico e confortável para os punhos." },
        { name: "com Barra Reta", tip: "Supinação máxima exigindo força extrema do bíceps." },
        { name: "com Halteres", tip: "Permite supinar o punho de forma dinâmica." },
        { name: "no Cabo", tip: "Tensão uniforme de baixo a cima do movimento." },
        { name: "no Banco Inclinado", tip: "Coloca a cabeça longa do bíceps em alongamento extremo." },
        { name: "Unilateral", tip: "Conexão mente-músculo aprimorada." },
        { name: "com Pausa 2s na Isometria", tip: "Aumenta o tempo sob tensão em ângulo desfavorável." },
        { name: "com Corda no Cabo", tip: "Permite afastar as mãos no topo potencializando a contração." },
        { name: "no Smith (Rosca Drag)", tip: "Arraste a barra rente ao corpo encolhendo os cotovelos para trás." },
        { name: "com Elástico", tip: "Tensão progressiva excelente para finalização de treino." }
      ]
    },
    {
      group: "Tríceps",
      bases: [
        { name: "Tríceps Testa", tip: "Mantenha os cotovelos apontando para o teto e desça a carga até a testa." },
        { name: "Tríceps Pulley / Barra", tip: "Mantenha os cotovelos fixos e estenda completamente os braços." },
        { name: "Tríceps Francês", tip: "Carga atrás da cabeça, excelente alongamento para a cabeça longa." },
        { name: "Tríceps Coice", tip: "Mantenha o braço paralelo ao chão e estenda o cotovelo para trás." },
        { name: "Mergulho nas Paralelas", tip: "Mantenha o corpo ereto para focar nos tríceps. Pressione firme." }
      ],
      variations: [
        { name: "com Barra W", tip: "Confortável para os cotovelos no movimento de testa." },
        { name: "com Halteres", tip: "Melhor controle e liberdade articular." },
        { name: "no Cabo com Corda", tip: "Permite rotação externa e extensão total." },
        { name: "no Cabo com Barra Reta", tip: "Garante pegada firme para cargas maiores." },
        { name: "Unilateral no Cabo", tip: "Isolamento preciso e simetria de força." },
        { name: "com Pegada Invertida", tip: "Maior ativação da cabeça medial do tríceps." },
        { name: "na Máquina", tip: "Foco puramente mecânico no tríceps." },
        { name: "com Pausa no Pico de Contração", tip: "Force a extensão total e segure por 2s." },
        { name: "no Banco", tip: "Apoie as mãos no banco traseiro e pernas à frente." },
        { name: "com Elástico", tip: "Foco na resistência final de extensão." }
      ]
    },
    {
      group: "Core e Abdômen",
      bases: [
        { name: "Abdominal Supra", tip: "Foque em aproximar as costelas do quadril, arredondando as costas." },
        { name: "Prancha Abdominal", tip: "Mantenha o core rígido, glúteos contraídos e linha neutra." },
        { name: "Abdominal Infra", tip: "Eleve a pelve do chão usando a força do abdômen inferior." },
        { name: "Abdominal Bicicleta", tip: "Movimento coordenado tocando cotovelo no joelho oposto." },
        { name: "Roda Abdominal", tip: "Não curve a lombar. Vá apenas até onde consegue estabilizar o core." }
      ],
      variations: [
        { name: "com Carga", tip: "Estimula a hipertrofia dos gomos abdominais." },
        { name: "no Cabo (Polia Alta)", tip: "Excelente controle de carga progressiva." },
        { name: "no Solo", tip: "Forma básica focando na precisão técnica pura." },
        { name: "Isométrico", tip: "Desenvolve excelente força de estabilização interna do core." },
        { name: "na Bola Suíça", tip: "Exige estabilização proprioceptiva profunda." },
        { name: "com Pausa no Pico de Contração", tip: "Sustente a compressão abdominal por 2 segundos." },
        { name: "Suspenso na Barra", tip: "Altíssima demanda mecânica para o reto abdominal." },
        { name: "Lateral / Oblíquos", tip: "Recrutamento dos músculos da cintura abdominal." },
        { name: "Unilateral", tip: "Combate desequilíbrios de estabilidade entre os lados." },
        { name: "com Elástico", tip: "Tensão variável excelente para controle dinâmico." }
      ]
    },
    {
      group: "Powerlifting e LPO",
      bases: [
        { name: "Levantamento Terra Sumô", tip: "Pés bem afastados, quadril próximo à barra e empurre com as pernas." },
        { name: "Agachamento Pausa na Caixa", tip: "Sente na caixa, desfaça o reflexo elástico e suba explosivamente." },
        { name: "Power Clean / Arremesso", tip: "Puxe a barra do chão de forma explosiva recebendo-a nos ombros." },
        { name: "Snatch / Arranco", tip: "Puxe a barra em um único movimento fluido acima da cabeça." },
        { name: "Push Press", tip: "Use um leve impulso das pernas (dip) para empurrar cargas massivas acima da cabeça." }
      ],
      variations: [
        { name: "Déficit 5cm", tip: "Aumenta a amplitude de movimento na saída do chão." },
        { name: "com Pausa de 3s abaixo do Joelho", tip: "Corrige postura e estabilidade na fase inicial de puxada." },
        { name: "com Correntes (Chains)", tip: "Aumenta a carga progressivamente conforme sobe (acomodação)." },
        { name: "com Elásticos (Bands)", tip: "Sobrecarga de pico extremamente alta para treinar velocidade." },
        { name: "com Pegada Hook Grip", tip: "Trava anatômica do dedão para máxima segurança na barra." },
        { name: "com Pausa no Peito", tip: "Exige quebra do ciclo de alongamento e encurtamento." },
        { name: "de Bloco (Block Pull)", tip: "Barra elevada reduz o trajeto focando no bloqueio (lockout)." },
        { name: "com Pegada Ultra Larga", tip: "Aumenta o trabalho dos membros superiores e dorsais." },
        { name: "de Altura Baixa", tip: "Trabalho em amplitude ampliada extremamente desafiador." },
        { name: "com Pegada Pronada Dupla", tip: "Desenvolve força de pegada colossal sem o uso de straps." }
      ]
    }
  ];

  const result: DbExercise[] = [];
  const generatedNames = new Set<string>();

  const makeId = (nameStr: string) => {
    return nameStr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const standardExercises = [
    { id: 'agachamento_livre', name: 'Agachamento Livre', tip: 'Mantenha o peito elevado, force os joelhos para fora na descida e garanta a profundidade abaixo do paralelo.' },
    { id: 'supino_reto', name: 'Supino Reto', tip: 'Pressione firmemente os calcanhares no chão (leg drive), faça a adução de escápulas e mantenha os cotovelos sob os punhos.' },
    { id: 'levantamento_terra', name: 'Levantamento Terra', tip: 'Remova a folga da barra (slack), contraia fortemente os dorsais e empurre o chão como se estivesse fazendo um leg press.' },
    { id: 'remada_curvada', name: 'Remada Curvada', tip: 'Mantenha a coluna neutra e puxe a barra em direção ao abdômen inferior.' },
    { id: 'agachamento_pausa', name: 'Agachamento com Pausa', tip: 'Faça uma pausa de 2 segundos na posição mais baixa (profundidade) mantendo a tensão muscular.' },
    { id: 'supino_pausa', name: 'Supino com Pausa', tip: 'Faça uma pausa nítida de 1-2 segundos no peito antes de iniciar a subida explosiva.' }
  ];

  standardExercises.forEach(ex => {
    result.push({
      id: ex.id,
      name: ex.name,
      techniqueTips: ex.tip,
      videoUrl: ""
    });
    generatedNames.add(ex.name.toLowerCase().trim());
  });

  for (const cat of categories) {
    for (const base of cat.bases) {
      for (const v of cat.variations) {
        const fullName = `${base.name} ${v.name}`;
        const nameLower = fullName.toLowerCase().trim();

        if (!generatedNames.has(nameLower)) {
          generatedNames.add(nameLower);
          const tips = `${base.tip} ${v.tip} (Treino de ${cat.group})`;
          const id = makeId(fullName);
          result.push({
            id,
            name: fullName,
            techniqueTips: tips,
            videoUrl: ""
          });
        }
      }
    }
  }

  const extraEquipments = ["no Hack", "no Cross", "na Polia", "com Halter Único", "com Barra Olímpica", "no Cabo Baixo"];
  const extraSubCategories = ["Inclinado 30°", "Inclinado 45°", "Inclinado 60°", "Declinado 15°", "Declinado 30°"];

  for (const eq of extraEquipments) {
    for (const sub of extraSubCategories) {
      const name = `Crucifixo ${sub} ${eq}`;
      const nameLower = name.toLowerCase().trim();
      if (!generatedNames.has(nameLower)) {
        generatedNames.add(nameLower);
        result.push({
          id: makeId(name),
          name,
          techniqueTips: `Exercício focado em peito com inclinação de ${sub} realizado no ${eq}. Alongue as fibras com precisão e controle.`,
          videoUrl: ""
        });
      }
    }
  }

  const simpleAdditional = [
    "Prancha Lateral Isométrica", "Prancha Lateral Dinâmica", "Prancha Superman", "Abdominal Crunch",
    "Agachamento Goblet com Halter", "Agachamento Zercher", "Agachamento de Joelhos", "Levantamento Terra RDL",
    "Stiff com Halteres", "Stiff com Barra", "Stiff Unilateral com Halter", "Elevação Pélvica com Barra",
    "Elevação Pélvica na Máquina", "Elevação Pélvica Unilateral", "Abdução de Quadril na Polia",
    "Abdução de Quadril na Cadeira", "Adução de Quadril na Cadeira", "Glúteo Coice no Cabo",
    "Glúteo Extensão na Cadeira", "Passada com Barra Costas", "Passada com Halteres", "Afundo no Smith",
    "Panturrilha em Pé na Máquina", "Panturrilha Sentado (Gêmeos)", "Panturrilha no Leg Press",
    "Panturrilha Unilateral em Pé", "Rosca Inversa com Barra", "Rosca Inversa no Cabo", "Rosca Martelo Alternada",
    "Rosca Martelo no Cabo", "Rosca Concentrada com Halter", "Tríceps Francês com Halter", "Tríceps Francês no Cabo",
    "Tríceps Testa com Halteres", "Tríceps Coice no Cabo", "Desenvolvimento Arnold", "Desenvolvimento Unilateral",
    "Elevação Lateral Inclinada", "Elevação Lateral no Banco", "Crucifixo Invertido na Máquina",
    "Crucifixo Invertido no Cabo", "Encolhimento de Ombros com Halteres", "Encolhimento de Ombros por Trás",
    "Remada Curvada com Halteres", "Remada Cavalinho com Alça", "Puxada Triângulo no Pulley",
    "Puxada Supinada no Pulley", "Puxada Romana no Pulley", "Barra Fixa com Carga", "Barra Fixa Supinada"
  ];

  for (const name of simpleAdditional) {
    const nameLower = name.toLowerCase().trim();
    if (!generatedNames.has(nameLower)) {
      generatedNames.add(nameLower);
      result.push({
        id: makeId(name),
        name,
        techniqueTips: "Exercício excelente focado no desenvolvimento muscular e ganho de força e estabilidade articular.",
        videoUrl: ""
      });
    }
  }

  return result;
}

/**
 * Fetch all custom/saved exercises from Firestore, seeding with defaults if empty.
 */
export async function fetchDbExercisesFromFirebase(): Promise<DbExercise[]> {
  try {
    const colRef = collection(db, 'exercises');
    const snapshot = await getDocs(colRef);
    
    const exercises: DbExercise[] = [];
    snapshot.forEach(docSnap => {
      exercises.push(docSnap.data() as DbExercise);
    });

    const all500 = generate500Exercises();

    if (exercises.length < 500) {
      console.log(`Seeding missing exercises to reach over 500. Current: ${exercises.length}, Generated: ${all500.length}`);
      const existingIds = new Set(exercises.map(e => e.id));
      const missing = all500.filter(ex => !existingIds.has(ex.id));

      const chunkSize = 60;
      for (let i = 0; i < missing.length; i += chunkSize) {
        const chunk = missing.slice(i, i + chunkSize);
        try {
          await Promise.all(chunk.map(ex => setDoc(doc(db, 'exercises', ex.id), ex)));
        } catch (e) {
          console.warn("Falha ao semear lote de exercícios:", e);
        }
        console.log(`Seeded chunk ${i / chunkSize + 1} (${chunk.length} exercises)`);
      }

      const reSnapshot = await getDocs(colRef);
      const updatedExercises: DbExercise[] = [];
      reSnapshot.forEach(docSnap => {
        updatedExercises.push(docSnap.data() as DbExercise);
      });
      return updatedExercises;
    }

    return exercises;
  } catch (error) {
    const cached = localStorage.getItem('viking_db_exercises');
    if (cached) {
      try {
        return JSON.parse(cached) as DbExercise[];
      } catch (_) {}
    }
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes('offline') || 
      errMessage.includes('network') || 
      errMessage.includes('token') || 
      errMessage.includes('Could not reach') ||
      errMessage.includes('Backend didn\'t respond')
    ) {
      console.warn("Firestore offline ou instável, gerando exercícios padrão:", error);
      return generate500Exercises();
    }
    handleFirestoreError(error, OperationType.LIST, 'exercises');
  }
}

/**
 * Save/update a single exercise document in Firestore.
 */
export async function saveDbExerciseToFirebase(exercise: DbExercise): Promise<void> {
  try {
    if (!exercise.id) {
      const newDocRef = doc(collection(db, 'exercises'));
      exercise.id = newDocRef.id;
    }
    await setDoc(doc(db, 'exercises', exercise.id), exercise);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `exercises/${exercise.id}`);
  }
}

/**
 * Delete an exercise document from Firestore.
 */
export async function deleteDbExerciseFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'exercises', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `exercises/${id}`);
  }
}

/**
  * Fetch all mobility exercises from Firestore.
  */
export async function fetchDbMobilityExercisesFromFirebase(): Promise<DbMobilityExercise[]> {
  try {
    const colRef = collection(db, 'mobility_exercises');
    const snapshot = await getDocs(colRef);
    
    const exercises: DbMobilityExercise[] = [];
    snapshot.forEach(docSnap => {
      exercises.push(docSnap.data() as DbMobilityExercise);
    });

    if (exercises.length === 0) {
      const defaults: DbMobilityExercise[] = [
        { id: 'cat_cow', name: 'Cat Cow', videoUrl: '' },
        { id: 'bird_dog', name: 'Bird Dog', videoUrl: '' },
        { id: 'world_greatest', name: 'World Greatest Stretch', videoUrl: '' }
      ];
      await Promise.all(defaults.map(ex => setDoc(doc(db, 'mobility_exercises', ex.id), ex)));
      return defaults;
    }

    return exercises;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'mobility_exercises');
  }
}

/**
  * Save/update a single mobility exercise document in Firestore.
  */
export async function saveDbMobilityExerciseToFirebase(exercise: DbMobilityExercise): Promise<void> {
  try {
    if (!exercise.id) {
      const newDocRef = doc(collection(db, 'mobility_exercises'));
      exercise.id = newDocRef.id;
    }
    await setDoc(doc(db, 'mobility_exercises', exercise.id), exercise);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `mobility_exercises/${exercise.id}`);
  }
}

/**
  * Delete a mobility exercise document from Firestore.
  */
export async function deleteDbMobilityExerciseFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'mobility_exercises', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `mobility_exercises/${id}`);
  }
}

/**
 * Fetch calendar events from Firestore
 */
export async function fetchCalendarEventsFromFirebase(): Promise<CalendarEvent[]> {
  try {
    const colRef = collection(db, 'calendar_events');
    const snapshot = await getDocs(colRef);
    const events: CalendarEvent[] = [];
    snapshot.forEach(docSnap => {
      events.push(docSnap.data() as CalendarEvent);
    });
    return events;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'calendar_events');
  }
}

/**
 * Save calendar event to Firestore
 */
export async function saveCalendarEventToFirebase(event: CalendarEvent): Promise<void> {
  try {
    if (!event.id) {
      const newDocRef = doc(collection(db, 'calendar_events'));
      event.id = newDocRef.id;
    }
    await setDoc(doc(db, 'calendar_events', event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `calendar_events/${event.id}`);
  }
}

/**
 * Delete calendar event from Firestore
 */
export async function deleteCalendarEventFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'calendar_events', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `calendar_events/${id}`);
  }
}

