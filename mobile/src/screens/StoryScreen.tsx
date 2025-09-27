import React, { useState, useEffect, useCallback } from 'react';import React from 'react';import React from 'react';import React from 'react';import React, { useEffect, useState, useCallback } from 'react';import React, { useEffect, useState, useCallback } from 'react';

import {

  View,import { View, Text, StyleSheet, ScrollView } from 'react-native';

  Text,

  StyleSheet,import {

  ScrollView,

  TouchableOpacity,const StoryScreen = () => {

  Alert,

  ActivityIndicator,  return (  View,import {

} from 'react-native';

import { useSessionContext } from '../contexts/SessionContext';    <ScrollView style={styles.container}>

import AsyncStorage from '@react-native-async-storage/async-storage';

      <View style={styles.header}>  Text,

interface Chapter {

  id: string;        <Text style={styles.title}>🌱 Farming Journey</Text>

  title: string;

  description: string;        <Text style={styles.subtitle}>Your sustainable farming story</Text>  StyleSheet,  View,import {import {

  completed: boolean;

  locked: boolean;      </View>

}

        ScrollView,

interface UserProgress {

  completedChapters: string[];      <View style={styles.content}>

  currentChapter?: string;

}        <Text style={styles.text}>Story content coming soon...</Text>  TouchableOpacity,  Text,



const StoryScreen: React.FC = () => {      </View>

  const { session } = useSessionContext();

  const [chapters, setChapters] = useState<Chapter[]>([]);    </ScrollView>} from 'react-native';

  const [loading, setLoading] = useState(true);

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);  );



  const sampleChapters: Chapter[] = [};  StyleSheet,  View,  View,

    {

      id: 'chapter1',

      title: 'The Beginning',

      description: 'Start your farming journey with basic knowledge',const styles = StyleSheet.create({interface Chapter {

      completed: true,

      locked: false,  container: {

    },

    {    flex: 1,  id: number;  ScrollView,

      id: 'chapter2',

      title: 'Soil Preparation',    backgroundColor: '#f8f9fa',

      description: 'Learn about soil health and preparation techniques',

      completed: false,  },  title: string;

      locked: false,

    },  header: {

    {

      id: 'chapter3',    backgroundColor: '#10B981',  completed: boolean;  TouchableOpacity,  Text,  Text,

      title: 'Seed Selection',

      description: 'Choose the right seeds for your crops',    padding: 24,

      completed: false,

      locked: true,    paddingTop: 60,  locked: boolean;

    },

    {  },

      id: 'chapter4',

      title: 'Planting Techniques',  title: {}} from 'react-native';

      description: 'Master different planting methods',

      completed: false,    fontSize: 28,

      locked: true,

    },    fontWeight: 'bold',

    {

      id: 'chapter5',    color: 'white',

      title: 'Irrigation Systems',

      description: 'Efficient water management for crops',    marginBottom: 8,const StoryScreen: React.FC = () => {  StyleSheet,  StyleSheet,

      completed: false,

      locked: true,  },

    },

  ];  subtitle: {  const chapters: Chapter[] = [



  const updateChapterStates = useCallback((progress: UserProgress) => {    fontSize: 16,

    const updatedChapters = sampleChapters.map((chapter, index) => {

      const completed = progress.completedChapters?.includes(chapter.id) || false;    color: '#d1fae5',    { id: 1, title: 'The Beginning', completed: true, locked: false },const StoryScreen: React.FC = () => {

      const locked = index === 0 ? false : !progress.completedChapters?.includes(sampleChapters[index - 1].id);

        },

      return {

        ...chapter,  content: {    { id: 2, title: 'Soil Preparation', completed: false, locked: false },

        completed,

        locked,    padding: 24,

      };

    });  },    { id: 3, title: 'Seed Selection', completed: false, locked: true },  const chapters = [  ScrollView,  ScrollView,

    

    setChapters(updatedChapters);  text: {

  }, []);

    fontSize: 16,    { id: 4, title: 'Planting', completed: false, locked: true },

  const loadStoryProgress = useCallback(async () => {

    try {    color: '#374151',

      setLoading(true);

        },    { id: 5, title: 'Growth Care', completed: false, locked: true },    { id: 1, title: 'The Beginning', completed: true, locked: false },

      if (session) {

        console.log('Loading story progress for user:', session.user.id);});

      }

  ];

      const localProgress = await AsyncStorage.getItem('storyProgress');

      if (localProgress) {export default StoryScreen;

        const progress: UserProgress = JSON.parse(localProgress);    { id: 2, title: 'Soil Preparation', completed: false, locked: false },  TouchableOpacity,  TouchableOpacity,

        setUserProgress(progress);

        updateChapterStates(progress);  const handleChapterPress = (chapter: Chapter) => {

      } else {

        setChapters(sampleChapters);    if (chapter.locked) return;    { id: 3, title: 'Seed Selection', completed: false, locked: true },

      }

    } catch (error) {    console.log('Chapter pressed:', chapter.title);

      console.error('Error loading story progress:', error);

      setChapters(sampleChapters);  };    { id: 4, title: 'Planting', completed: false, locked: true },  Alert,  Alert,

    } finally {

      setLoading(false);

    }

  }, [session, updateChapterStates]);  return (    { id: 5, title: 'Growth Care', completed: false, locked: true },



  useEffect(() => {    <ScrollView style={styles.container}>

    loadStoryProgress();

  }, [loadStoryProgress]);      <View style={styles.header}>  ];  ActivityIndicator,  ActivityIndicator,



  const handleChapterPress = async (chapter: Chapter) => {        <Text style={styles.title}>🌱 Farming Journey</Text>

    if (chapter.locked) {

      Alert.alert(        <Text style={styles.subtitle}>Your sustainable farming story</Text>

        'Chapter Locked',

        'Complete the previous chapter to unlock this one.',      </View>

        [{ text: 'OK' }]

      );  const handleChapterPress = (chapter: any) => {} from 'react-native';} from 'react-native';

      return;

    }      <View style={styles.chaptersContainer}>



    if (!chapter.completed) {        {chapters.map((chapter) => (    if (chapter.locked) return;

      const updatedProgress: UserProgress = {

        ...userProgress,          <TouchableOpacity

        completedChapters: [

          ...(userProgress?.completedChapters || []),            key={chapter.id}    console.log('Chapter pressed:', chapter.title);import { useSessionContext } from '../contexts/SessionContext';import { useSessionContext } from '../contexts/SessionContext';

          chapter.id,

        ],            style={[

      };

              styles.chapterCard,  };

      try {

        await AsyncStorage.setItem('storyProgress', JSON.stringify(updatedProgress));              chapter.completed && styles.completedCard,

        setUserProgress(updatedProgress);

        updateChapterStates(updatedProgress);              chapter.locked && styles.lockedCard,import AsyncStorage from '@react-native-async-storage/async-storage';import AsyncStorage from '@react-native-async-storage/async-storage';



        Alert.alert(            ]}

          'Chapter Completed!',

          `You've completed "${chapter.title}"`,            onPress={() => handleChapterPress(chapter)}  return (

          [{ text: 'Continue' }]

        );            disabled={chapter.locked}

      } catch (error) {

        console.error('Error saving progress:', error);          >    <ScrollView style={styles.container}>

      }

    }            <View style={styles.chapterContent}>

  };

              <Text style={styles.chapterNumber}>Chapter {chapter.id}</Text>      <View style={styles.header}>

  const getProgressPercentage = () => {

    const completedCount = chapters.filter(ch => ch.completed).length;              <Text style={[

    return Math.round((completedCount / chapters.length) * 100);

  };                styles.chapterTitle,        <Text style={styles.title}>🌱 Farming Journey</Text>interface Chapter {interface Chapter {



  if (loading) {                chapter.locked && styles.lockedText

    return (

      <View style={styles.loadingContainer}>              ]}>        <Text style={styles.subtitle}>Your sustainable farming story</Text>

        <ActivityIndicator size="large" color="#10B981" />

        <Text style={styles.loadingText}>Loading your story...</Text>                {chapter.title}

      </View>

    );              </Text>      </View>  id: string;  id: string;

  }

              

  return (

    <ScrollView style={styles.container}>              <View style={styles.statusContainer}>

      <View style={styles.header}>

        <Text style={styles.title}>🌱 Your Farming Journey</Text>                {chapter.completed && <Text style={styles.completedIcon}>✅</Text>}

        <Text style={styles.subtitle}>Learn sustainable farming step by step</Text>

                        {chapter.locked && <Text style={styles.lockedIcon}>🔒</Text>}      <View style={styles.chaptersContainer}>  title: string;  title: string;

        <View style={styles.progressContainer}>

          <View style={styles.progressBar}>                {!chapter.completed && !chapter.locked && <Text style={styles.availableIcon}>▶️</Text>}

            <View 

              style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]}               </View>        {chapters.map((chapter) => (

            />

          </View>            </View>

          <Text style={styles.progressText}>{getProgressPercentage()}% Complete</Text>

        </View>          </TouchableOpacity>          <TouchableOpacity  description: string;  description: string;

      </View>

        ))}

      <View style={styles.chaptersContainer}>

        {chapters.map((chapter, index) => (      </View>            key={chapter.id}

          <TouchableOpacity

            key={chapter.id}    </ScrollView>

            style={[

              styles.chapterCard,  );            style={[  completed: boolean;  completed: boolean;

              chapter.completed && styles.completedCard,

              chapter.locked && styles.lockedCard,};

            ]}

            onPress={() => handleChapterPress(chapter)}              styles.chapterCard,

            disabled={chapter.locked}

          >const styles = StyleSheet.create({

            <View style={styles.chapterContent}>

              <View style={styles.chapterHeader}>  container: {              chapter.completed && styles.completedCard,  locked: boolean;  locked: boolean;

                <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>

                <View style={styles.statusIcons}>    flex: 1,

                  {chapter.completed && <Text style={styles.completedIcon}>✅</Text>}

                  {chapter.locked && <Text style={styles.lockedIcon}>🔒</Text>}    backgroundColor: '#f8f9fa',              chapter.locked && styles.lockedCard,

                </View>

              </View>  },

              

              <Text style={[  header: {            ]}}}

                styles.chapterTitle,

                chapter.locked && styles.lockedText    backgroundColor: '#10B981',

              ]}>

                {chapter.title}    padding: 24,            onPress={() => handleChapterPress(chapter)}

              </Text>

                  paddingTop: 60,

              <Text style={[

                styles.chapterDescription,  },            disabled={chapter.locked}

                chapter.locked && styles.lockedText

              ]}>  title: {

                {chapter.description}

              </Text>    fontSize: 28,          >



              {!chapter.locked && (    fontWeight: 'bold',

                <Text style={styles.tapToStart}>

                  {chapter.completed ? 'Tap to review' : 'Tap to start'}    color: 'white',            <View style={styles.chapterContent}>interface UserProgress {interface UserProgress {

                </Text>

              )}    marginBottom: 8,

            </View>

          </TouchableOpacity>  },              <Text style={styles.chapterNumber}>Chapter {chapter.id}</Text>

        ))}

      </View>  subtitle: {



      <View style={styles.footer}>    fontSize: 16,              <Text style={[  completedChapters: string[];  completedChapters: string[];

        <Text style={styles.footerText}>

          Complete all chapters to become a sustainable farming expert! 🌾    color: '#d1fae5',

        </Text>

      </View>  },                styles.chapterTitle,

    </ScrollView>

  );  chaptersContainer: {

};

    padding: 16,                chapter.locked && styles.lockedText  currentChapter?: string;  currentChapter?: string;

const styles = StyleSheet.create({

  container: {  },

    flex: 1,

    backgroundColor: '#f8f9fa',  chapterCard: {              ]}>

  },

  loadingContainer: {    backgroundColor: 'white',

    flex: 1,

    justifyContent: 'center',    borderRadius: 12,                {chapter.title}}}

    alignItems: 'center',

    backgroundColor: '#f8f9fa',    padding: 20,

  },

  loadingText: {    marginBottom: 16,              </Text>

    marginTop: 16,

    fontSize: 16,    elevation: 3,

    color: '#6b7280',

  },    shadowColor: '#000',              

  header: {

    backgroundColor: '#10B981',    shadowOffset: { width: 0, height: 2 },

    padding: 24,

    paddingTop: 60,    shadowOpacity: 0.1,              <View style={styles.statusContainer}>

  },

  title: {    shadowRadius: 4,

    fontSize: 28,

    fontWeight: 'bold',    borderLeftWidth: 4,                {chapter.completed && <Text style={styles.completedIcon}>✅</Text>}const StoryScreen: React.FC = () => {const StoryScreen: React.FC = () => {

    color: 'white',

    marginBottom: 8,    borderLeftColor: '#10B981',

  },

  subtitle: {  },                {chapter.locked && <Text style={styles.lockedIcon}>🔒</Text>}

    fontSize: 16,

    color: '#d1fae5',  completedCard: {

    marginBottom: 24,

  },    borderLeftColor: '#059669',                {!chapter.completed && !chapter.locked && <Text style={styles.availableIcon}>▶️</Text>}  const { session } = useSessionContext();  const { session } = useSessionContext();

  progressContainer: {

    marginBottom: 8,    backgroundColor: '#f0f9f4',

  },

  progressBar: {  },              </View>

    height: 8,

    backgroundColor: '#065f46',  lockedCard: {

    borderRadius: 4,

    overflow: 'hidden',    borderLeftColor: '#d1d5db',            </View>  const [chapters, setChapters] = useState<Chapter[]>([]);  const [chapters, setChapters] = useState<Chapter[]>([]);

    marginBottom: 8,

  },    backgroundColor: '#f9fafb',

  progressFill: {

    height: '100%',    opacity: 0.6,          </TouchableOpacity>

    backgroundColor: '#34d399',

    borderRadius: 4,  },

  },

  progressText: {  chapterContent: {        ))}  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

    color: '#d1fae5',

    fontSize: 14,    flex: 1,

    fontWeight: '600',

  },  },      </View>

  chaptersContainer: {

    padding: 16,  chapterNumber: {

  },

  chapterCard: {    fontSize: 12,    </ScrollView>  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

    backgroundColor: 'white',

    borderRadius: 12,    color: '#6b7280',

    padding: 20,

    marginBottom: 16,    fontWeight: '600',  );

    elevation: 3,

    shadowColor: '#000',    textTransform: 'uppercase',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,    marginBottom: 4,};

    shadowRadius: 4,

    borderLeftWidth: 4,  },

    borderLeftColor: '#10B981',

  },  chapterTitle: {

  completedCard: {

    borderLeftColor: '#059669',    fontSize: 18,

    backgroundColor: '#f0f9f4',

  },    fontWeight: 'bold',const styles = StyleSheet.create({  const sampleChapters: Chapter[] = [  const sampleChapters: Chapter[] = [

  lockedCard: {

    borderLeftColor: '#d1d5db',    color: '#1f2937',

    backgroundColor: '#f9fafb',

    opacity: 0.6,    marginBottom: 12,  container: {

  },

  chapterContent: {  },

    flex: 1,

  },  lockedText: {    flex: 1,    {    {

  chapterHeader: {

    flexDirection: 'row',    color: '#9ca3af',

    justifyContent: 'space-between',

    alignItems: 'center',  },    backgroundColor: '#f8f9fa',

    marginBottom: 8,

  },  statusContainer: {

  chapterNumber: {

    fontSize: 12,    alignItems: 'flex-end',  },      id: 'chapter1',      id: 'chapter1',

    color: '#6b7280',

    fontWeight: '600',  },

    textTransform: 'uppercase',

  },  completedIcon: {  header: {

  statusIcons: {

    flexDirection: 'row',    fontSize: 20,

  },

  completedIcon: {  },    backgroundColor: '#10B981',      title: 'The Beginning',      title: 'The Beginning',

    fontSize: 16,

    marginLeft: 4,  lockedIcon: {

  },

  lockedIcon: {    fontSize: 16,    padding: 24,

    fontSize: 14,

    marginLeft: 4,  },

  },

  chapterTitle: {  availableIcon: {    paddingTop: 60,      description: 'Start your farming journey with basic knowledge',      description: 'Start your farming journey with basic knowledge',

    fontSize: 20,

    fontWeight: 'bold',    fontSize: 16,

    color: '#1f2937',

    marginBottom: 8,  },  },

  },

  chapterDescription: {});

    fontSize: 14,

    color: '#6b7280',  title: {      completed: true,      completed: true,

    lineHeight: 20,

    marginBottom: 12,export default StoryScreen;

  },    fontSize: 28,

  lockedText: {

    color: '#9ca3af',    fontWeight: 'bold',      locked: false,      locked: false,

  },

  tapToStart: {    color: 'white',

    fontSize: 12,

    color: '#10B981',    marginBottom: 8,    },    },

    fontWeight: '600',

    textTransform: 'uppercase',  },

  },

  footer: {  subtitle: {    {    {

    padding: 24,

    alignItems: 'center',    fontSize: 16,

  },

  footerText: {    color: '#d1fae5',      id: 'chapter2',      id: 'chapter2',

    fontSize: 16,

    color: '#6b7280',  },

    textAlign: 'center',

    lineHeight: 24,  chaptersContainer: {      title: 'Soil Preparation',      title: 'Soil Preparation',

  },

});    padding: 16,



export default StoryScreen;  },      description: 'Learn about soil health and preparation techniques',      description: 'Learn about soil health and preparation techniques',

  chapterCard: {

    backgroundColor: 'white',      completed: false,      completed: false,

    borderRadius: 12,

    padding: 20,      locked: false,      locked: false,

    marginBottom: 16,

    elevation: 3,    },    },

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },    {    {

    shadowOpacity: 0.1,

    shadowRadius: 4,      id: 'chapter3',      id: 'chapter3',

    borderLeftWidth: 4,

    borderLeftColor: '#10B981',      title: 'Seed Selection',      title: 'Seed Selection',

  },

  completedCard: {      description: 'Choose the right seeds for your crops',      description: 'Choose the right seeds for your crops',

    borderLeftColor: '#059669',

    backgroundColor: '#f0f9f4',      completed: false,      completed: false,

  },

  lockedCard: {      locked: true,      locked: true,

    borderLeftColor: '#d1d5db',

    backgroundColor: '#f9fafb',    },    },

    opacity: 0.6,

  },    {    {

  chapterContent: {

    flex: 1,      id: 'chapter4',      id: 'chapter4',

  },

  chapterNumber: {      title: 'Planting Techniques',      title: 'Planting Techniques',

    fontSize: 12,

    color: '#6b7280',      description: 'Master different planting methods',      description: 'Master different planting methods',

    fontWeight: '600',

    textTransform: 'uppercase',      completed: false,      completed: false,

    marginBottom: 4,

  },      locked: true,      locked: true,

  chapterTitle: {

    fontSize: 18,    },    },

    fontWeight: 'bold',

    color: '#1f2937',    {    {

    marginBottom: 12,

  },      id: 'chapter5',      id: 'chapter5',

  lockedText: {

    color: '#9ca3af',      title: 'Irrigation Systems',      title: 'Irrigation Systems',

  },

  statusContainer: {      description: 'Efficient water management for crops',      description: 'Efficient water management for crops',

    alignItems: 'flex-end',

  },      completed: false,      completed: false,

  completedIcon: {

    fontSize: 20,      locked: true,      locked: true,

  },

  lockedIcon: {    },    },

    fontSize: 16,

  },    {    {

  availableIcon: {

    fontSize: 16,      id: 'chapter6',      id: 'chapter6',

  },

});      title: 'Pest Management',      title: 'Pest Management',



export default StoryScreen;      description: 'Natural pest control methods',      description: 'Natural pest control methods',

      completed: false,      completed: false,

      locked: true,      locked: true,

    },    },

  ];  ];



  const updateChapterStates = useCallback((progress: UserProgress) => {  const updateChapterStates = useCallback((progress: UserProgress) => {

    const updatedChapters = sampleChapters.map((chapter, index) => {    const updatedChapters = sampleChapters.map((chapter, index) => {

      const completed = progress.completedChapters?.includes(chapter.id) || false;      const completed = progress.completedChapters?.includes(chapter.id) || false;

      const locked = index === 0 ? false : !progress.completedChapters?.includes(sampleChapters[index - 1].id);      const locked = index === 0 ? false : !progress.completedChapters?.includes(sampleChapters[index - 1].id);

            

      return {      return {

        ...chapter,        ...chapter,

        completed,        completed,

        locked,        locked,

      };      };

    });    });

        

    setChapters(updatedChapters);    setChapters(updatedChapters);

  }, []);  }, []);



  const loadStoryProgress = useCallback(async () => {  const loadStoryProgress = useCallback(async () => {

    try {    try {

      setLoading(true);      setLoading(true);

            

      if (session) {      if (session) {

        // Load from server (placeholder for future implementation)        // Load from server (placeholder for future implementation)

        console.log('Loading story progress for user:', session.user.id);        console.log('Loading story progress for user:', session.user.id);

      }      }



      // Load local progress      // Load local progress

      const localProgress = await AsyncStorage.getItem('storyProgress');      const localProgress = await AsyncStorage.getItem('storyProgress');

      if (localProgress) {      if (localProgress) {

        const progress: UserProgress = JSON.parse(localProgress);        const progress: UserProgress = JSON.parse(localProgress);

        setUserProgress(progress);        setUserProgress(progress);

        updateChapterStates(progress);        updateChapterStates(progress);

      } else {      } else {

        setChapters(sampleChapters);        setChapters(sampleChapters);

      }      }

    } catch (error) {    } catch (error) {

      console.error('Error loading story progress:', error);      console.error('Error loading story progress:', error);

      setChapters(sampleChapters);      setChapters(sampleChapters);

    } finally {    } finally {

      setLoading(false);      setLoading(false);

    }    }

  }, [session, updateChapterStates]);  }, [session, updateChapterStates]);



  useEffect(() => {  useEffect(() => {

    loadStoryProgress();    loadStoryProgress();

  }, [loadStoryProgress]);  }, [loadStoryProgress]);

    const updatedChapters = sampleChapters.map((chapter, index) => {

  const handleChapterPress = async (chapter: Chapter) => {      const completed = progress.completedChapters?.includes(chapter.id) || false;

    if (chapter.locked) {      const locked = index === 0 ? false : !progress.completedChapters?.includes(sampleChapters[index - 1].id);

      Alert.alert(      

        'Chapter Locked',      return {

        'Complete the previous chapter to unlock this one.',        ...chapter,

        [{ text: 'OK' }]        completed,

      );        locked,

      return;      };

    }    });

    

    if (!chapter.completed) {    setChapters(updatedChapters);

      // Mark chapter as completed  };

      const updatedProgress: UserProgress = {

        ...userProgress,  const handleChapterPress = async (chapter: Chapter) => {

        completedChapters: [    if (chapter.locked) {

          ...(userProgress?.completedChapters || []),      Alert.alert(

          chapter.id,        'Chapter Locked',

        ],        'Complete the previous chapter to unlock this one.',

      };        [{ text: 'OK' }]

      );

      try {      return;

        await AsyncStorage.setItem('storyProgress', JSON.stringify(updatedProgress));    }

        setUserProgress(updatedProgress);

        updateChapterStates(updatedProgress);    if (!chapter.completed) {

      // Mark chapter as completed

        Alert.alert(      const updatedProgress = {

          'Chapter Completed!',        ...userProgress,

          `You've completed "${chapter.title}"`,        completedChapters: [

          [{ text: 'Continue' }]          ...(userProgress?.completedChapters || []),

        );          chapter.id,

      } catch (error) {        ],

        console.error('Error saving progress:', error);      };

      }

    }      try {

  };        await AsyncStorage.setItem('storyProgress', JSON.stringify(updatedProgress));

        setUserProgress(updatedProgress);

  const getProgressPercentage = () => {        updateChapterStates(updatedProgress);

    const completedCount = chapters.filter(ch => ch.completed).length;

    return Math.round((completedCount / chapters.length) * 100);        Alert.alert(

  };          'Chapter Completed!',

          `You've completed "${chapter.title}"`,

  if (loading) {          [{ text: 'Continue' }]

    return (        );

      <View style={styles.loadingContainer}>      } catch (error) {

        <ActivityIndicator size="large" color="#10B981" />        console.error('Error saving progress:', error);

        <Text style={styles.loadingText}>Loading your story...</Text>      }

      </View>    }

    );  };

  }

  const getProgressPercentage = () => {

  return (    const completedCount = chapters.filter(ch => ch.completed).length;

    <ScrollView style={styles.container}>    return Math.round((completedCount / chapters.length) * 100);

      <View style={styles.header}>  };

        <Text style={styles.title}>🌱 Your Farming Journey</Text>

        <Text style={styles.subtitle}>Learn sustainable farming step by step</Text>  if (loading) {

            return (

        <View style={styles.progressContainer}>      <View style={styles.loadingContainer}>

          <View style={styles.progressBar}>        <ActivityIndicator size="large" color="#10B981" />

            <View         <Text style={styles.loadingText}>Loading your story...</Text>

              style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]}       </View>

            />    );

          </View>  }

          <Text style={styles.progressText}>{getProgressPercentage()}% Complete</Text>

        </View>  return (

      </View>    <ScrollView style={styles.container}>

      <View style={styles.header}>

      <View style={styles.chaptersContainer}>        <Text style={styles.title}>🌱 Your Farming Journey</Text>

        {chapters.map((chapter, index) => (        <Text style={styles.subtitle}>Learn sustainable farming step by step</Text>

          <TouchableOpacity        

            key={chapter.id}        <View style={styles.progressContainer}>

            style={[          <View style={styles.progressBar}>

              styles.chapterCard,            <View 

              chapter.completed && styles.completedCard,              style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 

              chapter.locked && styles.lockedCard,            />

            ]}          </View>

            onPress={() => handleChapterPress(chapter)}          <Text style={styles.progressText}>{getProgressPercentage()}% Complete</Text>

            disabled={chapter.locked}        </View>

          >      </View>

            <View style={styles.chapterContent}>

              <View style={styles.chapterHeader}>      <View style={styles.chaptersContainer}>

                <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>        {chapters.map((chapter, index) => (

                <View style={styles.statusIcons}>          <TouchableOpacity

                  {chapter.completed && <Text style={styles.completedIcon}>✅</Text>}            key={chapter.id}

                  {chapter.locked && <Text style={styles.lockedIcon}>🔒</Text>}            style={[

                </View>              styles.chapterCard,

              </View>              chapter.completed && styles.completedCard,

                            chapter.locked && styles.lockedCard,

              <Text style={[            ]}

                styles.chapterTitle,            onPress={() => handleChapterPress(chapter)}

                chapter.locked && styles.lockedText            disabled={chapter.locked}

              ]}>          >

                {chapter.title}            <View style={styles.chapterContent}>

              </Text>              <View style={styles.chapterHeader}>

                              <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>

              <Text style={[                <View style={styles.statusIcons}>

                styles.chapterDescription,                  {chapter.completed && <Text style={styles.completedIcon}>✅</Text>}

                chapter.locked && styles.lockedText                  {chapter.locked && <Text style={styles.lockedIcon}>🔒</Text>}

              ]}>                </View>

                {chapter.description}              </View>

              </Text>              

              <Text style={[

              {!chapter.locked && (                styles.chapterTitle,

                <Text style={styles.tapToStart}>                chapter.locked && styles.lockedText

                  {chapter.completed ? 'Tap to review' : 'Tap to start'}              ]}>

                </Text>                {chapter.title}

              )}              </Text>

            </View>              

          </TouchableOpacity>              <Text style={[

        ))}                styles.chapterDescription,

      </View>                chapter.locked && styles.lockedText

              ]}>

      <View style={styles.footer}>                {chapter.description}

        <Text style={styles.footerText}>              </Text>

          Complete all chapters to become a sustainable farming expert! 🌾

        </Text>              {!chapter.locked && (

      </View>                <Text style={styles.tapToStart}>

    </ScrollView>                  {chapter.completed ? 'Tap to review' : 'Tap to start'}

  );                </Text>

};              )}

            </View>

const styles = StyleSheet.create({          </TouchableOpacity>

  container: {        ))}

    flex: 1,      </View>

    backgroundColor: '#f8f9fa',

  },      <View style={styles.footer}>

  loadingContainer: {        <Text style={styles.footerText}>

    flex: 1,          Complete all chapters to become a sustainable farming expert! 🌾

    justifyContent: 'center',        </Text>

    alignItems: 'center',      </View>

    backgroundColor: '#f8f9fa',    </ScrollView>

  },  );

  loadingText: {};

    marginTop: 16,

    fontSize: 16,const styles = StyleSheet.create({

    color: '#6b7280',  container: {

  },    flex: 1,

  header: {    backgroundColor: '#f8f9fa',

    backgroundColor: '#10B981',  },

    padding: 24,  loadingContainer: {

    paddingTop: 60,    flex: 1,

  },    justifyContent: 'center',

  title: {    alignItems: 'center',

    fontSize: 28,    backgroundColor: '#f8f9fa',

    fontWeight: 'bold',  },

    color: 'white',  loadingText: {

    marginBottom: 8,    marginTop: 16,

  },    fontSize: 16,

  subtitle: {    color: '#6b7280',

    fontSize: 16,  },

    color: '#d1fae5',  header: {

    marginBottom: 24,    backgroundColor: '#10B981',

  },    padding: 24,

  progressContainer: {    paddingTop: 60,

    marginBottom: 8,  },

  },  title: {

  progressBar: {    fontSize: 28,

    height: 8,    fontWeight: 'bold',

    backgroundColor: '#065f46',    color: 'white',

    borderRadius: 4,    marginBottom: 8,

    overflow: 'hidden',  },

    marginBottom: 8,  subtitle: {

  },    fontSize: 16,

  progressFill: {    color: '#d1fae5',

    height: '100%',    marginBottom: 24,

    backgroundColor: '#34d399',  },

    borderRadius: 4,  progressContainer: {

  },    marginBottom: 8,

  progressText: {  },

    color: '#d1fae5',  progressBar: {

    fontSize: 14,    height: 8,

    fontWeight: '600',    backgroundColor: '#065f46',

  },    borderRadius: 4,

  chaptersContainer: {    overflow: 'hidden',

    padding: 16,    marginBottom: 8,

  },  },

  chapterCard: {  progressFill: {

    backgroundColor: 'white',    height: '100%',

    borderRadius: 12,    backgroundColor: '#34d399',

    padding: 20,    borderRadius: 4,

    marginBottom: 16,  },

    elevation: 3,  progressText: {

    shadowColor: '#000',    color: '#d1fae5',

    shadowOffset: { width: 0, height: 2 },    fontSize: 14,

    shadowOpacity: 0.1,    fontWeight: '600',

    shadowRadius: 4,  },

    borderLeftWidth: 4,  chaptersContainer: {

    borderLeftColor: '#10B981',    padding: 16,

  },  },

  completedCard: {  chapterCard: {

    borderLeftColor: '#059669',    backgroundColor: 'white',

    backgroundColor: '#f0f9f4',    borderRadius: 12,

  },    padding: 20,

  lockedCard: {    marginBottom: 16,

    borderLeftColor: '#d1d5db',    elevation: 3,

    backgroundColor: '#f9fafb',    shadowColor: '#000',

    opacity: 0.6,    shadowOffset: { width: 0, height: 2 },

  },    shadowOpacity: 0.1,

  chapterContent: {    shadowRadius: 4,

    flex: 1,    borderLeftWidth: 4,

  },    borderLeftColor: '#10B981',

  chapterHeader: {  },

    flexDirection: 'row',  completedCard: {

    justifyContent: 'space-between',    borderLeftColor: '#059669',

    alignItems: 'center',    backgroundColor: '#f0f9f4',

    marginBottom: 8,  },

  },  lockedCard: {

  chapterNumber: {    borderLeftColor: '#d1d5db',

    fontSize: 12,    backgroundColor: '#f9fafb',

    color: '#6b7280',    opacity: 0.6,

    fontWeight: '600',  },

    textTransform: 'uppercase',  chapterContent: {

  },    flex: 1,

  statusIcons: {  },

    flexDirection: 'row',  chapterHeader: {

  },    flexDirection: 'row',

  completedIcon: {    justifyContent: 'space-between',

    fontSize: 16,    alignItems: 'center',

    marginLeft: 4,    marginBottom: 8,

  },  },

  lockedIcon: {  chapterNumber: {

    fontSize: 14,    fontSize: 12,

    marginLeft: 4,    color: '#6b7280',

  },    fontWeight: '600',

  chapterTitle: {    textTransform: 'uppercase',

    fontSize: 20,  },

    fontWeight: 'bold',  statusIcons: {

    color: '#1f2937',    flexDirection: 'row',

    marginBottom: 8,  },

  },  completedIcon: {

  chapterDescription: {    fontSize: 16,

    fontSize: 14,    marginLeft: 4,

    color: '#6b7280',  },

    lineHeight: 20,  lockedIcon: {

    marginBottom: 12,    fontSize: 14,

  },    marginLeft: 4,

  lockedText: {  },

    color: '#9ca3af',  chapterTitle: {

  },    fontSize: 20,

  tapToStart: {    fontWeight: 'bold',

    fontSize: 12,    color: '#1f2937',

    color: '#10B981',    marginBottom: 8,

    fontWeight: '600',  },

    textTransform: 'uppercase',  chapterDescription: {

  },    fontSize: 14,

  footer: {    color: '#6b7280',

    padding: 24,    lineHeight: 20,

    alignItems: 'center',    marginBottom: 12,

  },  },

  footerText: {  lockedText: {

    fontSize: 16,    color: '#9ca3af',

    color: '#6b7280',  },

    textAlign: 'center',  tapToStart: {

    lineHeight: 24,    fontSize: 12,

  },    color: '#10B981',

});    fontWeight: '600',

    textTransform: 'uppercase',

export default StoryScreen;  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StoryScreen;