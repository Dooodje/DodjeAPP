import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Section, Level, TreeData, Course, HomeDesign } from '../../types/home';

// Valeurs par défaut
const DEFAULT_SECTION: Section = 'Bourse';
const DEFAULT_LEVEL: Level = 'Débutant';

// Cours de test
const TEST_COURSE: Course = {
  id: 'test-course-1',
  title: 'Cours de test',
  description: 'Un cours créé manuellement pour éviter les erreurs indexOf',
  level: 'Débutant',
  section: 'Bourse',
  position: { x: 0.5, y: 0.5 },
  status: 'deblocked',
  progress: 0,
  dodjiCost: 100,
  imageUrl: '',
  lockIcon: 'lock',
  checkIcon: 'check',
  ringIcon: 'circle-outline',
  ordre: 1,
  videoIds: [],
  quizId: null,
  isAnnex: false
};

// TreeData par défaut
const DEFAULT_TREE_DATA: TreeData = {
  section: DEFAULT_SECTION,
  level: DEFAULT_LEVEL,
  treeImageUrl: '',
  courses: [TEST_COURSE]
};

// HomeDesign par défaut
const DEFAULT_HOME_DESIGN: HomeDesign = {
  domaine: DEFAULT_SECTION,
  niveau: DEFAULT_LEVEL,
  imageUrl: '',
  positions: {}
};

export interface HomeState {
  currentSection: Section;
  currentLevel: Level;
  treeData: TreeData | null;
  homeDesign: HomeDesign | null;
  isLoading: boolean;
  error: string | null;
  streak: number;
  dodji: number;
  lastViewedCourse: string | null;
}

const initialState: HomeState = {
  currentSection: DEFAULT_SECTION,
  currentLevel: DEFAULT_LEVEL,
  treeData: DEFAULT_TREE_DATA,
  homeDesign: DEFAULT_HOME_DESIGN,
  isLoading: false,
  error: null,
  streak: 0,
  dodji: 0,
  lastViewedCourse: null
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setCurrentSection: (state, action: PayloadAction<Section>) => {
      state.currentSection = action.payload;
    },
    setCurrentLevel: (state, action: PayloadAction<Level>) => {
      state.currentLevel = action.payload;
    },
    setTreeData: (state, action: PayloadAction<TreeData>) => {
      // Vérifier que les données sont valides ou utiliser des valeurs par défaut
      state.treeData = {
        section: action.payload.section || DEFAULT_SECTION,
        level: action.payload.level || DEFAULT_LEVEL,
        treeImageUrl: action.payload.treeImageUrl || '',
        courses: action.payload.courses || [TEST_COURSE]
      };
    },
    setHomeDesign: (state, action: PayloadAction<HomeDesign>) => {
      // Vérifier que les données sont valides ou utiliser des valeurs par défaut
      state.homeDesign = {
        domaine: action.payload.domaine || DEFAULT_SECTION,
        niveau: action.payload.niveau || DEFAULT_LEVEL,
        imageUrl: action.payload.imageUrl || '',
        positions: action.payload.positions || {}
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStreak: (state, action: PayloadAction<number>) => {
      state.streak = action.payload;
    },
    setDodji: (state, action: PayloadAction<number>) => {
      state.dodji = action.payload;
    },
    setLastViewedCourse: (state, action: PayloadAction<string>) => {
      state.lastViewedCourse = action.payload;
    },
    updateCourseStatus: (state, action: PayloadAction<{ courseId: string, status: 'blocked' | 'completed' | 'deblocked' }>) => {
      if (state.treeData && Array.isArray(state.treeData.courses)) {
        // Trouver le cours et mettre à jour son statut
        const course = state.treeData.courses.find(c => c.id === action.payload.courseId);
        if (course) {
          course.status = action.payload.status;
        }
      }
    },
    updateCourseProgress: (state, action: PayloadAction<{ courseId: string, progress: number }>) => {
      if (state.treeData && Array.isArray(state.treeData.courses)) {
        // Trouver le cours et mettre à jour sa progression
        const course = state.treeData.courses.find(c => c.id === action.payload.courseId);
        if (course) {
          course.progress = action.payload.progress;
        }
      }
    },
    unlockCourseWithDodji: (state, action: PayloadAction<string>) => {
      // Trouver le cours et le débloquer
      if (state.treeData && Array.isArray(state.treeData.courses)) {
        const course = state.treeData.courses.find(c => c.id === action.payload);
        if (course) {
          course.status = 'deblocked';
          // Déduire les dodjis du montant du cours
          state.dodji = Math.max(0, state.dodji - (course.dodjiCost || 100));
        }
      }
    }
  },
});

export const {
  setCurrentSection,
  setCurrentLevel,
  setTreeData,
  setHomeDesign,
  setLoading,
  setError,
  setStreak,
  setDodji,
  setLastViewedCourse,
  updateCourseStatus,
  updateCourseProgress,
  unlockCourseWithDodji
} = homeSlice.actions;

export default homeSlice.reducer; 