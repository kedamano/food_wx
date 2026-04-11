-- 更新图片路径：从 example.com 改为本地路径
USE food_wx;

UPDATE users SET avatar = REPLACE(avatar, 'https://example.com/', '/images/avatars/') WHERE avatar LIKE 'https://example.com/%';
UPDATE stores SET logo = REPLACE(logo, 'https://example.com/', '/images/stores/') WHERE logo LIKE 'https://example.com/%';
UPDATE foods SET image = REPLACE(image, 'https://example.com/', '/images/foods/') WHERE image LIKE 'https://example.com/%';
UPDATE reviews SET images = REPLACE(images, 'https://example.com/', '/images/foods/') WHERE images LIKE '%https://example.com/%';

SELECT '图片路径更新完成！' as result;
SELECT COUNT(*) as updated_users FROM users WHERE avatar LIKE '/images/%';
SELECT COUNT(*) as updated_stores FROM stores WHERE logo LIKE '/images/%';
SELECT COUNT(*) as updated_foods FROM foods WHERE image LIKE '/images/%';
SELECT COUNT(*) as updated_reviews FROM reviews WHERE images LIKE '/images/%';
