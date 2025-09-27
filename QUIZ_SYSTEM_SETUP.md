# 🚀 Quiz System Setup Guide

## Quick Fix Steps

### Step 1: Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the entire content from `/supabase/sql/complete_setup.sql`
4. Paste and execute it in SQL Editor

### Step 2: Test the System

1. Visit `/admin/quiz` page in your app
2. Click **🔍 Test Database** button
3. You should see "✅ Database Connected!" message

### Step 3: Create Your First Quiz

1. Fill out the "Create Quiz" form:

   - Title: e.g., "Soil Management Basics"
   - Difficulty: Easy/Medium/Hard
   - NASA Topic: Optional
   - Attempts: How many tries users get

2. Click **Create Quiz** button

### Step 4: Add Questions

1. Select your created quiz (click **Select** button)
2. Fill out the "Add Questions" form:

   - Question: Your question text
   - Options: Comma-separated (e.g., "Option A, Option B, Option C, Option D")
   - Correct Answer: Exact text that matches one option
   - Explanation: Optional explanation

3. Click **Add Question** button

## What's Fixed

✅ **Course Section**: Fully dynamic with database integration
✅ **Quiz Listing**: Uses useQuizzesCatalog hook, no more auto-logout
✅ **Quiz Exam**: Complete database-driven system with useQuizExam hook
✅ **My Results**: Shows all user quiz results from database
✅ **Admin Panel**: Full CRUD operations for quizzes and questions

## Admin Access

To access admin features, your email must be in the `VITE_ADMIN_EMAILS` environment variable:

```bash
VITE_ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

## Database Schema

The setup script creates these tables:

- `quizzes`: Quiz metadata (title, difficulty, NASA topic, attempts allowed)
- `quiz_questions`: Individual questions with options and correct answers
- `quiz_results`: User attempt results and scores

## Troubleshooting

1. **Database Connection Failed**: Run the SQL setup script
2. **Admin Access Denied**: Add your email to VITE_ADMIN_EMAILS
3. **Quiz Not Appearing**: Check if quiz has questions added
4. **Results Not Saving**: Verify database tables were created properly

## Testing the Complete Flow

1. Admin creates quiz and adds questions
2. User visits Quizzes page and sees available quizzes
3. User takes quiz exam
4. Results are saved to database
5. User can view results in My Results page
6. Admin can manage quizzes through Admin panel

The entire system is now database-driven with no edge function dependencies!
