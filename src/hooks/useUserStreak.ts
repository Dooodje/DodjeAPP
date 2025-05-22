import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useUserStreak = () => {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setStreak(userDoc.data().streak || 0);
        }
      } catch (error) {
        console.error('Error fetching user streak:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [user]);

  return { streak, loading };
}; 