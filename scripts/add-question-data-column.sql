-- Add question_data column to questions table
-- This column stores structured data for special question types like:
-- - Nearest Meaning (word, options, correct answer)
-- - Fill in the Blanks (paragraph with blanks, options in sequence)
-- - Read the Data (image url, sub-questions)

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' 
    AND column_name = 'question_data'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN question_data JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'Added question_data column to questions table';
  ELSE
    RAISE NOTICE 'question_data column already exists';
  END IF;
END $$;

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_questions_question_data 
  ON questions USING GIN (question_data);

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'questions'
AND column_name = 'question_data';
