import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

import type { Json } from '@/integrations/supabase/types'

export interface StoryChapter {
  id: string
  chapter_number: number
  title: string
  description: string
  duration: string
  status: string
  icon_type?: string
  content?: {
    heading: string
    sections: Array<{ title: string; text: string }>
  }
  nasa_data_integration?: Json
  created_at: string
  updated_at?: string
}

export interface CreateStoryChapter {
  chapter_number: number
  title: string
  description: string
  duration: string
  status?: string
  icon_type?: string
  content?: {
    heading: string
    sections: Array<{ title: string; text: string }>
  }
  nasa_data_integration?: Json
}

export const useStoryAdmin = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchStoryChapters = async (): Promise<StoryChapter[]> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .select('*')
        .order('chapter_number', { ascending: true })

      if (error) throw error
      return (data || []) as StoryChapter[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch story chapters'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  const createStoryChapter = async (chapter: CreateStoryChapter): Promise<StoryChapter | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .insert([chapter])
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Story chapter created successfully',
      })

      return data as StoryChapter
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create story chapter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateStoryChapter = async (
    id: string,
    updates: Partial<CreateStoryChapter>
  ): Promise<StoryChapter | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Story chapter updated successfully',
      })

      return data as StoryChapter
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update story chapter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteStoryChapter = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('story_chapters')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Story chapter deleted successfully',
      })

      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete story chapter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const getStoryChapter = async (id: string): Promise<StoryChapter | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch story chapter'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    fetchStoryChapters,
    createStoryChapter,
    updateStoryChapter,
    deleteStoryChapter,
    getStoryChapter,
  }
}
