#!/bin/bash

echo "🗄️ Database Setup for Quiz System"
echo "=================================="
echo ""

# Read the database setup SQL
if [ -f "supabase/sql/database_setup.sql" ]; then
    echo "📋 SQL Script Content:"
    echo "====================="
    cat supabase/sql/database_setup.sql
    echo ""
    echo "🔗 Copy the above SQL content and paste it in your Supabase SQL Editor"
    echo "💡 Go to: https://supabase.com/dashboard → Your Project → SQL Editor"
    echo ""
else
    echo "❌ database_setup.sql file not found!"
    exit 1
fi

echo "✅ Database setup instructions completed!"