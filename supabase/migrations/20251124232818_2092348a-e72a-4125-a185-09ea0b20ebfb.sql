-- Enable realtime for analytics tables
ALTER TABLE analytics_sessions REPLICA IDENTITY FULL;
ALTER TABLE artwork_views REPLICA IDENTITY FULL;
ALTER TABLE page_views REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE artwork_views;
ALTER PUBLICATION supabase_realtime ADD TABLE page_views;