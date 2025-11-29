# Story Journey Admin Guide

## Overview

Story Journey এখন সম্পূর্ণ dynamic এবং admin panel থেকে manage করা যায়। Admin users story chapters add, edit, এবং delete করতে পারবেন।

## Features

### ✅ Database Migration

- নতুন migration file: `20251129000000_add_story_admin_features.sql`
- Story chapters table এ নতুন fields যুক্ত করা হয়েছে:
  - `content` (JSONB): Chapter এর rich content সহ sections
  - `icon_type` (TEXT): Chapter icon type (Sprout, Droplets, Sun, Trophy, MapPin, Star)
  - `updated_at` (TIMESTAMP): Last update time
- Admin-only RLS policies যুক্ত করা হয়েছে
- Existing chapters এ default content migrate করা হয়েছে

### ✅ Admin Hook

**File:** `src/hooks/useStoryAdmin.ts`

Hook functions:

- `fetchStoryChapters()`: সব chapters fetch করে
- `createStoryChapter(chapter)`: নতুন chapter তৈরি করে
- `updateStoryChapter(id, updates)`: Chapter update করে
- `deleteStoryChapter(id)`: Chapter delete করে
- `getStoryChapter(id)`: Single chapter fetch করে

### ✅ Admin Page

**File:** `src/pages/StoryAdmin.tsx`

Features:

- Full CRUD operations for story chapters
- Table view with all chapters
- Add/Edit dialog with:
  - Chapter number
  - Title & Description
  - Duration
  - Icon type selection
  - Status (locked/current/completed)
  - Content heading
  - Multiple content sections (dynamic add/remove)
- Delete confirmation dialog
- Back to dashboard navigation

### ✅ Updated StoryJourney Page

**File:** `src/pages/StoryJourney.tsx`

Changes:

- Dynamic chapter loading from database
- Uses chapter content and icon from database
- Admin users দেখতে পাবেন "Manage Stories" button
- Icon dynamically render হয় based on `icon_type` field

### ✅ Route Configuration

**File:** `src/App.tsx`

নতুন route যুক্ত:

```tsx
<Route path="admin/stories" element={<StoryAdmin />} />
```

## How to Use

### Admin Access

1. Admin হিসেবে login করুন (profile table এ role='admin')
2. Story Journey page এ যান
3. উপরের ডান কোণে "Manage Stories" button দেখা যাবে
4. Click করে admin panel এ যান

### Create New Story Chapter

1. Admin panel এ "Add Chapter" button click করুন
2. Fill out the form:
   - **Chapter Number**: Sequential number (auto-suggested)
   - **Title**: Chapter এর title
   - **Description**: Brief description
   - **Duration**: e.g., "5 min", "10 min"
   - **Icon**: Select from dropdown (Sprout, Droplets, Sun, Trophy, MapPin, Star)
   - **Status**: locked/current/completed
   - **Content Heading**: Main heading for chapter content
   - **Content Sections**: Multiple sections with title and text
     - "Add Section" button দিয়ে নতুন section যুক্ত করুন
     - Trash icon দিয়ে section remove করুন
3. "Create" button click করুন

### Edit Story Chapter

1. Chapter row এ Edit (pencil) icon click করুন
2. Modal খুলবে existing data সহ
3. যে কোনো field update করুন
4. "Update" button click করুন

### Delete Story Chapter

1. Chapter row এ Delete (trash) icon click করুন
2. Confirmation dialog আসবে
3. "Delete" confirm করুন

### Content Structure

প্রতিটি chapter এর content এই structure এ:

```json
{
  "heading": "Main Chapter Heading",
  "sections": [
    {
      "title": "Section Title 1",
      "text": "Section content text..."
    },
    {
      "title": "Section Title 2",
      "text": "More content..."
    }
  ]
}
```

## Database Schema

### story_chapters Table

```sql
- id (UUID, Primary Key)
- chapter_number (INTEGER)
- title (TEXT)
- description (TEXT)
- duration (TEXT)
- status (TEXT)
- icon_type (TEXT) -- NEW
- content (JSONB) -- NEW
- nasa_data_integration (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) -- NEW
```

### RLS Policies

- `Anyone can view story chapters`: সবাই chapters দেখতে পারে
- `Admins can insert story chapters`: শুধু admin insert করতে পারে
- `Admins can update story chapters`: শুধু admin update করতে পারে
- `Admins can delete story chapters`: শুধু admin delete করতে পারে

## Migration Apply করার পদ্ধতি

```bash
# Supabase CLI দিয়ে
cd supabase
supabase db reset  # Development এ

# অথবা production এ
supabase db push
```

## Security Notes

- শুধুমাত্র admin role সহ users story chapters manage করতে পারবেন
- Non-admin users শুধু chapters দেখতে পারবেন
- RLS policies database level এ enforce করা আছে
- Frontend এ `isAdmin` check করে admin button show/hide করা হয়

## Future Enhancements (Optional)

- Rich text editor for chapter content
- Image upload for chapters
- Chapter ordering/reordering interface
- Preview mode before publishing
- Chapter versioning
- Bulk operations

## Troubleshooting

### Admin button দেখা যাচ্ছে না?

- Check করুন profile table এ user এর role 'admin' আছে কিনা:

```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```

### RLS policy error?

- Ensure migration properly applied
- Check admin function exists:

```sql
SELECT public.is_admin('your-user-id');
```

### Content না দেখাচ্ছে?

- Check browser console for errors
- Verify chapter has content field populated
- Ensure JSON structure is correct
