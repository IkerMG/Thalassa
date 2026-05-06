-- Phase 2: Add image URL columns for Cloudinary integration

ALTER TABLE livestock ADD COLUMN image_url VARCHAR(500);
ALTER TABLE equipment ADD COLUMN image_url VARCHAR(500);
ALTER TABLE users     ADD COLUMN avatar_url VARCHAR(500);
