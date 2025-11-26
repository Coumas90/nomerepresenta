-- Make description column nullable for artworks table
ALTER TABLE artworks ALTER COLUMN description DROP NOT NULL;