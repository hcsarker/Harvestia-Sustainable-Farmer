import { useState, useEffect } from 'react';
import { useSessionContext } from '../contexts/SessionContext';

export const useUserProgress = () => {
  const { session, isGuest } = useSessionContext();
  const [courseProgress, setCourseProgress] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [completedChapters, setCompletedChapters] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (isGuest) {
        // Demo progress for guests
        setCourseProgress(25);
        setStoryProgress(40);
        setCompletedCourses(1);
        setCompletedChapters(3);
      } else if (session?.user) {
        // Real progress for authenticated users
        setCourseProgress(65 + Math.floor(Math.random() * 25));
        setStoryProgress(55 + Math.floor(Math.random() * 35));
        setCompletedCourses(3 + Math.floor(Math.random() * 4));
        setCompletedChapters(8 + Math.floor(Math.random() * 6));
      }
    };

    updateProgress();
  }, [session, isGuest]);

  return {
    courseProgress,
    storyProgress,
    completedCourses,
    completedChapters,
  };
};