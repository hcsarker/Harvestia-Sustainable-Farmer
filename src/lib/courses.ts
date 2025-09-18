export type Lesson = { id: string; title: string; minutes: number }
export type Course = {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  students: number
  certificate: boolean
  lessons: Lesson[]
}

export const courseCatalog: Course[] = [
  {
    id: 'fundamentals',
    title: 'Sustainable Farming Fundamentals',
    description: 'Learn the core principles of sustainable agriculture and environmental stewardship.',
    instructor: 'Dr. Maria Rodriguez',
    duration: '4 weeks',
    difficulty: 'Beginner',
    rating: 4.8,
    students: 1250,
    certificate: true,
    lessons: [
      { id: 'sf-1', title: 'Soil Basics', minutes: 12 },
      { id: 'sf-2', title: 'Crop Rotation', minutes: 14 },
      { id: 'sf-3', title: 'Composting', minutes: 10 },
      { id: 'sf-4', title: 'Pest Management', minutes: 16 },
    ],
  },
  {
    id: 'nasa-data',
    title: 'NASA Data for Smart Agriculture',
    description: 'Harness satellite data and remote sensing for precision farming decisions.',
    instructor: 'Prof. James Chen',
    duration: '6 weeks',
    difficulty: 'Intermediate',
    rating: 4.9,
    students: 850,
    certificate: true,
    lessons: [
      { id: 'nd-1', title: 'Remote Sensing 101', minutes: 15 },
      { id: 'nd-2', title: 'MODIS & NDVI', minutes: 18 },
      { id: 'nd-3', title: 'SMAP Soil Moisture', minutes: 12 },
      { id: 'nd-4', title: 'GPM Rainfall', minutes: 12 },
      { id: 'nd-5', title: 'Fusing Datasets', minutes: 20 },
    ],
  },
  {
    id: 'climate-resilience',
    title: 'Climate-Resilient Crop Management',
    description: 'Adapt your farming practices to changing climate conditions using data-driven approaches.',
    instructor: 'Dr. Sarah Williams',
    duration: '5 weeks',
    difficulty: 'Advanced',
    rating: 4.7,
    students: 620,
    certificate: true,
    lessons: [
      { id: 'cr-1', title: 'Heat & Drought', minutes: 16 },
      { id: 'cr-2', title: 'Variety Selection', minutes: 12 },
      { id: 'cr-3', title: 'Irrigation Strategies', minutes: 14 },
      { id: 'cr-4', title: 'Soil Protection', minutes: 10 },
    ],
  },
]
