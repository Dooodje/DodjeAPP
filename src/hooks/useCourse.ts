import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { courseService } from '../services/course';
import {
  setCurrentCourse,
  setCurrentContent,
  setProgress,
  setLoading,
  setError,
  setPlaying,
  setCurrentTime,
  setDuration,
  updateContentProgress,
  resetCourse,
} from '../store/slices/courseSlice';
import { useAuth } from './useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Course, CourseContent, CourseProgress } from '../types/course';

export const useCourse = (providedCourseId?: string) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string }>();
  const courseId = providedCourseId || params.id;
  const router = useRouter();
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const {
    currentCourse,
    currentContent,
    progress,
    isLoading,
    error,
    isPlaying,
    currentTime,
    duration,
  } = useAppSelector(state => state.course);

  // Logs pour débogage
  useEffect(() => {
    console.log('useCourse - courseId:', courseId);
    console.log('useCourse - user:', user ? 'logged in' : 'not logged in');
    console.log('useCourse - params:', JSON.stringify(params));
  }, [courseId, user, params]);

  // Charger les données du parcours
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) {
        console.error('Utilisateur non connecté');
        dispatch(setError('Vous devez être connecté pour accéder à ce cours'));
        return;
      }
      
      if (!courseId) {
        console.error('ID du cours manquant');
        dispatch(setError('Identifiant du cours manquant'));
        return;
      }

      setFetchAttempted(true);
      
      try {
        console.log('Chargement du cours avec ID:', courseId);
        dispatch(setLoading(true));
        dispatch(setError(null));

        // Récupérer le parcours
        const course = await courseService.getCourse(courseId);
        
        if (!course) {
          dispatch(setError(`Cours non trouvé (ID: ${courseId})`));
          return;
        }
        
        if (!Array.isArray(course.contents) || course.contents.length === 0) {
          dispatch(setError('Le cours ne contient pas de contenus valides'));
          return;
        }
        
        dispatch(setCurrentCourse(course));
        console.log('Cours chargé avec succès:', course.title);

        // Récupérer la progression
        const courseProgress = await courseService.getCourseProgress(user.uid, courseId);
        if (courseProgress) {
          dispatch(setProgress(courseProgress));
          // Définir le contenu actuel en fonction de la progression
          const contentIndex = Math.min(courseProgress.currentContentIndex, course.contents.length - 1);
          const currentContent = course.contents[contentIndex];
          if (currentContent) {
            dispatch(setCurrentContent(currentContent));
            console.log('Progression chargée, contenu actuel:', currentContent.title);
          } else {
            // Si le contenu n'existe pas, commencer par le premier
            dispatch(setCurrentContent(course.contents[0]));
            console.log('Contenu de progression invalide, utilisation du premier contenu');
          }
        } else {
          // Si pas de progression, commencer par le premier contenu
          dispatch(setCurrentContent(course.contents[0]));
          console.log('Aucune progression, utilisation du premier contenu');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (user && courseId && (!fetchAttempted || !currentCourse)) {
      fetchCourseData();
    }

    return () => {
      if (courseId !== params.id) {
        // Si l'ID du cours change, réinitialiser l'état
        dispatch(resetCourse());
        setFetchAttempted(false);
      }
    };
  }, [user, courseId, dispatch, fetchAttempted, currentCourse, params.id]);

  // Gérer la progression du contenu
  const handleContentProgress = useCallback(
    async (contentId: string, isCompleted: boolean) => {
      if (!user || !courseId) {
        console.error('Impossible de mettre à jour la progression: utilisateur ou ID du cours manquant');
        return;
      }

      try {
        await courseService.updateCourseProgress(user.uid, courseId, contentId, isCompleted);
        dispatch(updateContentProgress({ contentId, isCompleted }));
        console.log(`Progression mise à jour pour le contenu ${contentId}: ${isCompleted ? 'complété' : 'non complété'}`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error);
      }
    },
    [user, courseId, dispatch]
  );

  // Gérer la navigation vers le contenu suivant
  const handleNextContent = useCallback(() => {
    if (!currentCourse || !currentContent) {
      console.error('Impossible de naviguer: cours ou contenu actuel manquant');
      return;
    }

    // Vérifier que contents est un tableau valide
    if (!Array.isArray(currentCourse.contents) || currentCourse.contents.length === 0) {
      console.error('Impossible de naviguer: structure du cours invalide');
      return;
    }

    try {
      const currentIndex = currentCourse.contents.findIndex(c => c && c.id === currentContent.id);
      
      if (currentIndex === -1) {
        console.error('Contenu actuel non trouvé dans le cours');
        return;
      }
      
      if (currentIndex < currentCourse.contents.length - 1) {
        const nextContent = currentCourse.contents[currentIndex + 1];
        if (!nextContent) {
          console.error('Contenu suivant invalide');
          return;
        }
        
        dispatch(setCurrentContent(nextContent));
        dispatch(setCurrentTime(0));
        dispatch(setDuration(0));
        dispatch(setPlaying(false));
        console.log('Navigation vers le contenu suivant:', nextContent.title);
      } else {
        // Si c'est le dernier contenu, vérifier s'il y a un parcours suivant
        courseService.getNextCourse(currentCourse.id).then(nextCourse => {
          if (nextCourse) {
            console.log('Navigation vers le cours suivant:', nextCourse.title);
            router.push(`/course/${nextCourse.id}`);
          } else {
            console.log('Aucun cours suivant disponible');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la navigation vers le contenu suivant:', error);
    }
  }, [currentCourse, currentContent, dispatch, router]);

  // Gérer la navigation vers le contenu précédent
  const handlePreviousContent = useCallback(() => {
    if (!currentCourse || !currentContent) {
      console.error('Impossible de naviguer: cours ou contenu actuel manquant');
      return;
    }

    // Vérifier que contents est un tableau valide
    if (!Array.isArray(currentCourse.contents) || currentCourse.contents.length === 0) {
      console.error('Impossible de naviguer: structure du cours invalide');
      return;
    }

    try {
      const currentIndex = currentCourse.contents.findIndex(c => c && c.id === currentContent.id);
      
      if (currentIndex === -1) {
        console.error('Contenu actuel non trouvé dans le cours');
        return;
      }
      
      if (currentIndex > 0) {
        const prevContent = currentCourse.contents[currentIndex - 1];
        if (!prevContent) {
          console.error('Contenu précédent invalide');
          return;
        }
        
        dispatch(setCurrentContent(prevContent));
        dispatch(setCurrentTime(0));
        dispatch(setDuration(0));
        dispatch(setPlaying(false));
        console.log('Navigation vers le contenu précédent:', prevContent.title);
      } else {
        // Si c'est le premier contenu, vérifier s'il y a un parcours précédent
        courseService.getPreviousCourse(currentCourse.id).then(previousCourse => {
          if (previousCourse) {
            console.log('Navigation vers le cours précédent:', previousCourse.title);
            router.push(`/course/${previousCourse.id}`);
          } else {
            console.log('Aucun cours précédent disponible');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la navigation vers le contenu précédent:', error);
    }
  }, [currentCourse, currentContent, dispatch, router]);

  return {
    currentCourse,
    currentContent,
    progress,
    isLoading,
    error,
    isPlaying,
    currentTime,
    duration,
    handleContentProgress,
    handleNextContent,
    handlePreviousContent,
    setPlaying: (playing: boolean) => dispatch(setPlaying(playing)),
    setCurrentTime: (time: number) => dispatch(setCurrentTime(time)),
    setDuration: (duration: number) => dispatch(setDuration(duration)),
  };
}; 