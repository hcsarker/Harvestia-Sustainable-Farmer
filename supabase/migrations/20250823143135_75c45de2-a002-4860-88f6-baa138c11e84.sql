-- CRITICAL SECURITY FIX: Remove conflicting RLS policy that exposes quiz answers
-- The old "Allow quiz question SELECT access" policy is still active and overriding our security fix

-- Remove the old permissive policy that allows direct access to quiz answers
DROP POLICY IF EXISTS "Allow quiz question SELECT access" ON quiz_questions;

-- Verify only the blocking policy remains active:
-- "Block all direct access to prevent answer theft" should be the ONLY policy
-- This ensures quiz answers cannot be stolen while maintaining secure function access