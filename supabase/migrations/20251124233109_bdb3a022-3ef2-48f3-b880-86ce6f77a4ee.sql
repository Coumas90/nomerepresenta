-- Create table for cursor tracking on artworks
CREATE TABLE artwork_cursor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  viewport_width INTEGER NOT NULL,
  viewport_height INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_cursor_tracking_artwork ON artwork_cursor_tracking(artwork_id);
CREATE INDEX idx_cursor_tracking_session ON artwork_cursor_tracking(session_id);
CREATE INDEX idx_cursor_tracking_created_at ON artwork_cursor_tracking(created_at);

-- Enable RLS
ALTER TABLE artwork_cursor_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert cursor tracking
CREATE POLICY "Anyone can insert cursor tracking"
  ON artwork_cursor_tracking
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all cursor tracking
CREATE POLICY "Admins can view cursor tracking"
  ON artwork_cursor_tracking
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER TABLE artwork_cursor_tracking REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE artwork_cursor_tracking;