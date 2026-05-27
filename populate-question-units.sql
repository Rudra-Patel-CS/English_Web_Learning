-- Script to populate question_units table from existing textbooks/units data
-- Run this after creating the question_units table

-- ============================================
-- Populate question_units from units table
-- ============================================

-- For Standard 9
INSERT INTO question_units (standard, instruction_type, unit_name, chapter_name)
SELECT DISTINCT 
  s.grade_number::text as standard,
  instruction_type,
  u.name as unit_name,
  u.name as chapter_name
FROM units u
INNER JOIN standards s ON u.standard_id = s.id
CROSS JOIN (
  VALUES 
    ('Paragraph base question(Textbook)'),
    ('True or False'),
    ('Stanza Base Question(Poem) – 2mark'),
    ('Stanza Base Question(Poem) – 3mark'),
    ('Opposite meaning'),
    ('Paragraph base question(Dolphin) 4 mark'),
    ('Paragraph base question(Dolphin) – 5 mark'),
    ('Fill in the blanks (Textbook) 3 mark'),
    ('Fill in the blanks (Textbook) 4 mark'),
    ('Fill in the blanks (Textbook) 5 mark')
) AS instruction_types(instruction_type)
WHERE s.grade_number IN (9, 10, 11, 12)
ON CONFLICT (standard, instruction_type, unit_name) DO NOTHING;

-- ============================================
-- Verify the data
-- ============================================
SELECT 
  standard,
  instruction_type,
  COUNT(*) as unit_count
FROM question_units
GROUP BY standard, instruction_type
ORDER BY standard, instruction_type;
