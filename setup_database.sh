#!/bin/bash

echo "🚀 Setting up Quiz System Database..."
echo ""
echo "📋 Instructions:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"  
echo "3. Copy the content from supabase/sql/database_setup.sql"
echo "4. Paste and run it"
echo ""
echo "💡 The script will:"
echo "   - Create all required tables (quizzes, quiz_questions, user_quiz_results)"
echo "   - Add sample quizzes and questions"
echo "   - Set up proper indexes for performance"
echo ""
echo "🔗 After setup, test your system at /admin/quiz"
echo ""

# Check if the SQL file exists
if [ -f "supabase/sql/database_setup.sql" ]; then
    echo "✅ SQL setup file found at: supabase/sql/database_setup.sql"
else
    echo "❌ SQL setup file not found!"
    exit 1
fi

echo ""
echo "📂 File ready for copy-paste setup!"