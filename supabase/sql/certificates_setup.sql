-- CERTIFICATES SYSTEM SETUP
-- Missing certificates table and dynamic integration with user courses

-- ================================
-- STEP 1: CREATE CERTIFICATES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_name TEXT NOT NULL,
    certificate_type TEXT DEFAULT 'course_completion',
    certificate_number TEXT UNIQUE NOT NULL,
    issued_date TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    completion_percentage INTEGER DEFAULT 100,
    total_score INTEGER,
    time_spent_hours INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_date ON public.certificates(issued_date);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own certificates" 
    ON public.certificates FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all certificates" 
    ON public.certificates FOR ALL 
    USING (true);

-- ================================
-- STEP 2: ADD SAMPLE CERTIFICATES DATA
-- ================================
-- Generate certificate numbers function
CREATE OR REPLACE FUNCTION generate_certificate_number() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'HARV-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Insert sample certificates for demonstration
INSERT INTO public.certificates (
    user_id, 
    course_id, 
    certificate_name, 
    certificate_type,
    certificate_number,
    completion_percentage,
    total_score,
    time_spent_hours,
    metadata
)
SELECT 
    gen_random_uuid(), -- Sample user ID
    c.id,
    'Certificate of Completion - ' || c.title,
    'course_completion',
    generate_certificate_number(),
    100,
    85 + (random() * 15)::integer, -- Score between 85-100
    (2 + random() * 8)::integer, -- Time between 2-10 hours
    jsonb_build_object(
        'instructor', 'Dr. Sarah Johnson',
        'institution', 'Harvestia Academy',
        'skills_learned', ARRAY['Sustainable Farming', 'Crop Management', 'Soil Health'],
        'grade', CASE 
            WHEN random() > 0.7 THEN 'A+'
            WHEN random() > 0.4 THEN 'A'
            ELSE 'B+'
        END
    )
FROM public.courses c
LIMIT 3;

-- ================================
-- STEP 3: CREATE CERTIFICATE GENERATION FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION award_course_certificate(
    p_user_id UUID,
    p_course_id UUID
) 
RETURNS UUID AS $$
DECLARE
    course_record public.courses%ROWTYPE;
    certificate_id UUID;
    cert_number TEXT;
BEGIN
    -- Get course details
    SELECT * INTO course_record FROM public.courses WHERE id = p_course_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Course not found';
    END IF;
    
    -- Check if certificate already exists
    IF EXISTS (
        SELECT 1 FROM public.certificates 
        WHERE user_id = p_user_id AND course_id = p_course_id
    ) THEN
        RAISE EXCEPTION 'Certificate already awarded for this course';
    END IF;
    
    -- Generate certificate number
    cert_number := generate_certificate_number();
    
    -- Insert certificate
    INSERT INTO public.certificates (
        user_id,
        course_id,
        certificate_name,
        certificate_number,
        metadata
    ) VALUES (
        p_user_id,
        p_course_id,
        'Certificate of Completion - ' || course_record.title,
        cert_number,
        jsonb_build_object(
            'course_title', course_record.title,
            'issued_by', 'Harvestia Sustainable Farming Academy',
            'certificate_type', 'Digital Certificate',
            'verification_url', 'https://harvestia.com/verify/' || cert_number
        )
    ) RETURNING id INTO certificate_id;
    
    RETURN certificate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- STEP 4: CREATE VIEW FOR USER DASHBOARD
-- ================================
CREATE OR REPLACE VIEW user_certificates_view AS
SELECT 
    c.id,
    c.user_id,
    c.certificate_name,
    c.certificate_number,
    c.issued_date,
    c.completion_percentage,
    c.total_score,
    c.time_spent_hours,
    c.is_verified,
    courses.title as course_title,
    courses.description as course_description,
    courses.thumbnail_url as course_thumbnail,
    c.metadata
FROM public.certificates c
JOIN public.courses ON courses.id = c.course_id
ORDER BY c.issued_date DESC;

-- RLS for view
ALTER VIEW user_certificates_view OWNER TO postgres;

-- ================================
-- STEP 5: UPDATE ACHIEVEMENTS FOR CERTIFICATES
-- ================================
-- Add certificate-related achievements
INSERT INTO public.achievements (
    achievement_type,
    achievement_name,
    description,
    icon_name,
    points_awarded,
    criteria,
    badge_color
) VALUES 
(
    'certificate',
    'First Certificate',
    'Earned your first course completion certificate',
    'trophy',
    50,
    '{"certificates_count": 1}',
    'gold'
),
(
    'certificate',
    'Knowledge Seeker',
    'Earned 3 course completion certificates',
    'graduation-cap',
    100,
    '{"certificates_count": 3}',
    'blue'
),
(
    'certificate',
    'Learning Master',
    'Earned 5 course completion certificates',
    'crown',
    200,
    '{"certificates_count": 5}',
    'purple'
),
(
    'excellence',
    'High Achiever',
    'Completed a course with 95+ score',
    'star',
    75,
    '{"min_score": 95}',
    'gold'
);

-- ================================
-- VERIFICATION QUERIES
-- ================================
SELECT 'Certificates Setup Complete!' as status;
SELECT 'Total certificates:' as info, COUNT(*) as count FROM public.certificates;
SELECT 'Certificate achievements:' as info, COUNT(*) as count FROM public.achievements WHERE achievement_type IN ('certificate', 'excellence');

-- Test certificate generation function
-- SELECT award_course_certificate('123e4567-e89b-12d3-a456-426614174000'::uuid, (SELECT id FROM courses LIMIT 1));