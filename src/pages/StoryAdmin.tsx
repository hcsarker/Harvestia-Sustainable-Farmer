/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, List, Eye, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']
const ICON_OPTIONS = ['Sprout', 'Droplets', 'Sun', 'Trophy', 'MapPin', 'Star']

interface StoryChapter {
  id: string
  story_id: string
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
}

interface Story {
  id: string
  title: string
  description: string
  image_url?: string
  difficulty: string
  estimated_time: string
  chapters_count: number
  is_published: boolean
}

export default function StoryAdmin() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('stories')
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  
  // Story dialog state
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [storyFormData, setStoryFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    difficulty: 'Beginner',
    estimated_time: '2 hours',
    is_published: false
  })

  // Chapter dialog state
  const [chapters, setChapters] = useState<StoryChapter[]>([])
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<StoryChapter | null>(null)
  const [chapterFormData, setChapterFormData] = useState({
    chapter_number: 1,
    title: '',
    description: '',
    duration: '5 min',
    status: 'locked',
    icon_type: 'Sprout',
    content: {
      heading: '',
      sections: [{ title: '', text: '' }]
    }
  })
  
  const loadStories = React.useCallback(async () => {
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('stories')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load stories', variant: 'destructive' })
    } else if (data) {
      setStories(data as any)
      if (data.length > 0 && !selectedStoryId) {
        setSelectedStoryId(data[0].id)
      }
    }
    setLoading(false)
  }, [toast, selectedStoryId])

  const loadChapters = React.useCallback(async () => {
    if (!selectedStoryId) return
    
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('story_chapters')
      .select('*')
      .eq('story_id', selectedStoryId)
      .order('chapter_number')
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load chapters', variant: 'destructive' })
    } else if (data) {
      setChapters(data as any)
    }
    setLoading(false)
  }, [selectedStoryId, toast])

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (isGuest) {
        navigate('/auth')
        return
      }

      if (!user) {
        setCheckingAdmin(false)
        return
      }

      try {
        // Check admin via email or user metadata
        const adminEmails = [
          'hcsarker2002@gmail.com', 'hridoy.pstu.cse19@gmail.com', 'harvestia06@gmail.com'
          // Add more admin emails here
        ]
        
        const userIsAdmin = user.email && adminEmails.includes(user.email.toLowerCase())
        setIsAdmin(userIsAdmin)

        if (!userIsAdmin) {
          toast({
            title: 'Access Denied',
            description: 'Only administrators can access this page',
            variant: 'destructive'
          })
          navigate('/story')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        toast({
          title: 'Error',
          description: 'Failed to verify admin access',
          variant: 'destructive'
        })
        navigate('/')
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdmin()
  }, [user, isGuest, navigate, toast])

  useEffect(() => {
    if (isAdmin && !isGuest) {
      loadStories()
    }
  }, [isAdmin, isGuest, loadStories])

  useEffect(() => {
    if (selectedStoryId) {
      loadChapters()
    }
  }, [selectedStoryId, loadChapters])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `public/${fileName}` // Add public folder

      console.log('Uploading image:', { fileName, filePath, fileSize: file.size, fileType: file.type })

      // Try upload with different options
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Allow overwrite
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        
        // If RLS error, try creating public URL from file directly
        if (uploadError.message.includes('policy')) {
          toast({ 
            title: 'RLS Error', 
            description: 'Storage permissions issue. Please disable RLS on storage.objects table or add proper policies.',
            variant: 'destructive' 
          })
          
          // Return a placeholder or use the preview
          return imagePreview || storyFormData.image_url
        }
        
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      const { data } = supabase.storage
        .from('story-images')
        .getPublicUrl(filePath)

      console.log('Public URL:', data.publicUrl)
      
      toast({ 
        title: 'Success', 
        description: 'Image uploaded successfully',
        variant: 'default'
      })

      return data.publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({ 
        title: 'Upload Failed', 
        description: error?.message || 'Storage bucket issue. Using preview URL instead.',
        variant: 'destructive' 
      })
      
      // Fallback: return the preview URL or existing URL
      return imagePreview || storyFormData.image_url || null
    }
  }

  const handleOpenStoryDialog = (story?: Story) => {
    if (story) {
      setEditingStory(story)
      setStoryFormData({
        title: story.title,
        description: story.description,
        image_url: story.image_url || '',
        difficulty: story.difficulty,
        estimated_time: story.estimated_time,
        is_published: story.is_published
      })
      setImagePreview(story.image_url || '')
    } else {
      setEditingStory(null)
      setStoryFormData({
        title: '',
        description: '',
        image_url: '',
        difficulty: 'Beginner',
        estimated_time: '2 hours',
        is_published: false
      })
      setImagePreview('')
    }
    setImageFile(null)
    setIsStoryDialogOpen(true)
  }

  const handleOpenChapterDialog = (chapter?: StoryChapter) => {
    if (chapter) {
      setEditingChapter(chapter)
      setChapterFormData({
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        description: chapter.description,
        duration: chapter.duration,
        status: chapter.status,
        icon_type: chapter.icon_type || 'Sprout',
        content: chapter.content || {
          heading: '',
          sections: [{ title: '', text: '' }]
        }
      })
    } else {
      setEditingChapter(null)
      const nextNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1
      setChapterFormData({
        chapter_number: nextNumber,
        title: '',
        description: '',
        duration: '5 min',
        status: 'locked',
        icon_type: 'Sprout',
        content: {
          heading: '',
          sections: [{ title: '', text: '' }]
        }
      })
    }
    setIsChapterDialogOpen(true)
  }

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let imageUrl = storyFormData.image_url

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const dataToSave = { ...storyFormData, image_url: imageUrl }

      if (editingStory) {
        const { error } = await (supabase as any)
          .from('stories')
          .update(dataToSave)
          .eq('id', editingStory.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Story updated successfully' })
      } else {
        const { error } = await (supabase as any)
          .from('stories')
          .insert([dataToSave])
        
        if (error) throw error
        toast({ title: 'Success', description: 'Story created successfully' })
      }
      
      setIsStoryDialogOpen(false)
      setImageFile(null)
      setImagePreview('')
      loadStories()
    } catch (error) {
      console.error(error)
      toast({ title: 'Error', description: 'Failed to save story', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStoryId) return
    
    setLoading(true)
    try {
      const dataToSave = { ...chapterFormData, story_id: selectedStoryId }

      if (editingChapter) {
        const { error } = await supabase
          .from('story_chapters')
          .update(dataToSave)
          .eq('id', editingChapter.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Chapter updated successfully' })
      } else {
        const { error } = await supabase
          .from('story_chapters')
          .insert([dataToSave])
        
        if (error) throw error
        toast({ title: 'Success', description: 'Chapter created successfully' })
      }
      
      setIsChapterDialogOpen(false)
      loadChapters()
      loadStories() // Refresh to update chapter count
    } catch (error) {
      console.error(error)
      toast({ title: 'Error', description: 'Failed to save chapter', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure? This will delete the story and all its chapters!')) return
    
    setLoading(true)
    const { error } = await (supabase as any)
      .from('stories')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete story', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Story deleted successfully' })
      loadStories()
    }
    setLoading(false)
  }

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return
    
    setLoading(true)
    const { error } = await supabase
      .from('story_chapters')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete chapter', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Chapter deleted successfully' })
      loadChapters()
      loadStories() // Refresh to update chapter count
    }
    setLoading(false)
  }

  const addSection = () => {
    setChapterFormData({
      ...chapterFormData,
      content: {
        ...chapterFormData.content,
        sections: [...chapterFormData.content.sections, { title: '', text: '' }]
      }
    })
  }

  const removeSection = (index: number) => {
    const newSections = chapterFormData.content.sections.filter((_, i) => i !== index)
    setChapterFormData({
      ...chapterFormData,
      content: {
        ...chapterFormData.content,
        sections: newSections
      }
    })
  }

  const updateSection = (index: number, field: 'title' | 'text', value: string) => {
    const newSections = [...chapterFormData.content.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setChapterFormData({
      ...chapterFormData,
      content: {
        ...chapterFormData.content,
        sections: newSections
      }
    })
  }

  if (checkingAdmin) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Story Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage stories and their chapters
          </p>
        </div>
        <Button onClick={() => handleOpenStoryDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Story
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stories">
            <BookOpen className="h-4 w-4 mr-2" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="chapters">
            <List className="h-4 w-4 mr-2" />
            Chapters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : stories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stories found. Create your first story to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Chapters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">{story.title}</TableCell>
                      <TableCell className="max-w-md truncate">{story.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{story.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{story.estimated_time}</TableCell>
                      <TableCell>{story.chapters_count}</TableCell>
                      <TableCell>
                        <Badge variant={story.is_published ? 'default' : 'secondary'}>
                          {story.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/story/${story.id}`)}
                            title="View story"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenStoryDialog(story)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStory(story.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="chapters">
          <Card className="p-6">
            {!selectedStoryId ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a story from the Stories tab to manage its chapters
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex-1">
                    <Label>Select Story</Label>
                    <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stories.map(story => (
                          <SelectItem key={story.id} value={story.id}>
                            {story.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => handleOpenChapterDialog()} className="ml-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading chapters...</div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No chapters found. Add your first chapter to this story.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapters.map((chapter) => (
                        <TableRow key={chapter.id}>
                          <TableCell className="font-medium">{chapter.chapter_number}</TableCell>
                          <TableCell>{chapter.title}</TableCell>
                          <TableCell>{chapter.duration}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{chapter.icon_type || 'Sprout'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={chapter.status === 'completed' ? 'default' : 'secondary'}>
                              {chapter.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenChapterDialog(chapter)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteChapter(chapter.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Story Dialog */}
      <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStory ? 'Edit' : 'Add'} Story</DialogTitle>
            <DialogDescription>
              {editingStory ? 'Update' : 'Create a new'} story with details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={storyFormData.title}
                  onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={storyFormData.description}
                  onChange={(e) => setStoryFormData({ ...storyFormData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Story Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {!imagePreview && !imageFile && (
                  <div className="mt-2 flex items-center justify-center h-48 bg-muted rounded-lg border-2 border-dashed">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Upload an image</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={storyFormData.difficulty}
                    onValueChange={(value) => setStoryFormData({ ...storyFormData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Estimated Time</Label>
                  <Input
                    id="estimated_time"
                    value={storyFormData.estimated_time}
                    onChange={(e) => setStoryFormData({ ...storyFormData, estimated_time: e.target.value })}
                    placeholder="e.g., 2 hours"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={storyFormData.is_published}
                  onCheckedChange={(checked) => setStoryFormData({ ...storyFormData, is_published: checked })}
                />
                <Label htmlFor="is_published">Publish Story</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingStory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChapter ? 'Edit' : 'Add'} Chapter</DialogTitle>
            <DialogDescription>
              {editingChapter ? 'Update' : 'Create a new'} chapter for this story
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitChapter}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter_number">Chapter Number</Label>
                  <Input
                    id="chapter_number"
                    type="number"
                    value={chapterFormData.chapter_number}
                    onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_number: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={chapterFormData.duration}
                    onChange={(e) => setChapterFormData({ ...chapterFormData, duration: e.target.value })}
                    placeholder="e.g., 5 min"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ch_title">Title</Label>
                <Input
                  id="ch_title"
                  value={chapterFormData.title}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ch_description">Description</Label>
                <Textarea
                  id="ch_description"
                  value={chapterFormData.description}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon_type">Icon</Label>
                  <Select
                    value={chapterFormData.icon_type}
                    onValueChange={(value) => setChapterFormData({ ...chapterFormData, icon_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ch_status">Status</Label>
                  <Select
                    value={chapterFormData.status}
                    onValueChange={(value) => setChapterFormData({ ...chapterFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="locked">Locked</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heading">Content Heading</Label>
                <Input
                  id="heading"
                  value={chapterFormData.content.heading}
                  onChange={(e) =>
                    setChapterFormData({
                      ...chapterFormData,
                      content: { ...chapterFormData.content, heading: e.target.value }
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content Sections</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </Button>
                </div>
                {chapterFormData.content.sections.map((section, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Section {index + 1}</Label>
                        {chapterFormData.content.sections.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Section title"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        required
                      />
                      <Textarea
                        placeholder="Section content"
                        value={section.text}
                        onChange={(e) => updateSection(index, 'text', e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingChapter ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
