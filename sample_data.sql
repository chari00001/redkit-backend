-- Örnek kullanıcılar ekleme
INSERT INTO Users (username, email, password, role, profile_picture_url, bio, is_verified, account_status, subscription_level) 
VALUES 
  ('admin', 'admin@example.com', '$2a$10$zQU4mQZQbMJ1CF3VxymAc.I00O6yEMF6TARhxMM2HDq0Q0wSE2Ege', 'admin', 'https://example.com/admin.jpg', 'Admin kullanıcısı', true, 'active', 'vip'),
  ('kullanici1', 'kullanici1@example.com', '$2a$10$zQU4mQZQbMJ1CF3VxymAc.I00O6yEMF6TARhxMM2HDq0Q0wSE2Ege', 'user', 'https://example.com/user1.jpg', 'Normal kullanıcı', true, 'active', 'free'),
  ('moderator', 'moderator@example.com', '$2a$10$zQU4mQZQbMJ1CF3VxymAc.I00O6yEMF6TARhxMM2HDq0Q0wSE2Ege', 'moderator', 'https://example.com/mod.jpg', 'Moderatör kullanıcısı', true, 'active', 'premium'),
  ('kullanici2', 'kullanici2@example.com', '$2a$10$zQU4mQZQbMJ1CF3VxymAc.I00O6yEMF6TARhxMM2HDq0Q0wSE2Ege', 'user', 'https://example.com/user2.jpg', 'İkinci kullanıcı', false, 'active', 'free');

-- Örnek topluluklar ekleme
INSERT INTO Communities (creator_id, name, description, visibility, member_count, is_verified, rules, post_count, tags, is_featured, cover_image_url)
VALUES
  (1, 'Teknoloji', 'Teknoloji hakkında her şey', 'public', 1, true, 'Saygılı olun. Spam yapmayın.', 0, '{"keywords": ["teknoloji", "bilgisayar", "yazılım"]}', true, 'https://example.com/tech.jpg'),
  (3, 'Spor', 'Spor tutkunları için', 'public', 1, false, 'Sportif kalın.', 0, '{"keywords": ["spor", "futbol", "basketbol"]}', false, 'https://example.com/sport.jpg'),
  (2, 'Özel Grup', 'Davetlilere özel topluluk', 'private', 1, false, 'Gizlilik esastır.', 0, '{"keywords": ["özel", "gizli"]}', false, 'https://example.com/private.jpg');

-- Topluluk üyelikleri ekleme
INSERT INTO User_Communities (user_id, community_id, role, joined_at)
VALUES
  (1, 1, 'admin', CURRENT_TIMESTAMP),
  (2, 1, 'member', CURRENT_TIMESTAMP),
  (3, 1, 'moderator', CURRENT_TIMESTAMP),
  (3, 2, 'admin', CURRENT_TIMESTAMP),
  (2, 3, 'admin', CURRENT_TIMESTAMP),
  (1, 3, 'member', CURRENT_TIMESTAMP);

-- Takipleşme örnekleri
INSERT INTO Follows (follower_id, followee_id, followed_at)
VALUES
  (2, 1, CURRENT_TIMESTAMP),
  (3, 1, CURRENT_TIMESTAMP),
  (4, 1, CURRENT_TIMESTAMP),
  (1, 3, CURRENT_TIMESTAMP),
  (2, 3, CURRENT_TIMESTAMP); 