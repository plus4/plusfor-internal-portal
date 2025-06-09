-- Create announcement_reads table for tracking read status
CREATE TABLE announcement_reads (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Composite primary key to prevent duplicate reads
  PRIMARY KEY (user_id, announcement_id)
);

-- Create RLS policies for announcement_reads table
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Users can only read their own read status
CREATE POLICY "Users can read their own announcement reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own read status
CREATE POLICY "Users can insert their own announcement reads"
  ON announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update read status (read_at is immutable)
-- Users cannot delete read status (reads are permanent)

-- Create index for performance
CREATE INDEX idx_announcement_reads_user_id ON announcement_reads(user_id);
CREATE INDEX idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);
