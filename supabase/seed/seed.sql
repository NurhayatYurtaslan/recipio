-- Recipio Seed Data
-- /supabase/seed/seed.sql

-- Reset sequences for clean seeding
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 1;
ALTER SEQUENCE recipes_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_variants_id_seq RESTART WITH 1;
ALTER SEQUENCE units_id_seq RESTART WITH 1;

-- 1. Units
INSERT INTO public.units (code) VALUES
('g'), ('kg'), ('ml'), ('l'), ('pcs'), ('tbsp'), ('tsp'), ('cup'), ('pinch');

-- 2. Categories
INSERT INTO public.categories (id, slug) VALUES
(1, 'soups'),
(2, 'salads'),
(3, 'main-courses'),
(4, 'desserts'),
(5, 'breakfast'),
(6, 'appetizers');

INSERT INTO public.category_translations (category_id, locale, name, description) VALUES
(1, 'en', 'Soups', 'Warm and comforting soups.'),
(1, 'tr', 'Çorbalar', 'Sıcak ve rahatlatıcı çorbalar.'),
(2, 'en', 'Salads', 'Fresh and healthy salads.'),
(2, 'tr', 'Salatalar', 'Taze ve sağlıklı salatalar.'),
(3, 'en', 'Main Courses', 'Hearty and satisfying main dishes.'),
(3, 'tr', 'Ana Yemekler', 'Doyurucu ve tatmin edici ana yemekler.'),
(4, 'en', 'Desserts', 'Sweet treats to finish your meal.'),
(4, 'tr', 'Tatlılar', 'Yemeğinizi tatlı bir sonla bitirin.'),
(5, 'en', 'Breakfast', 'Delicious ways to start your day.'),
(5, 'tr', 'Kahvaltı', 'Güne başlamanın lezzetli yolları.'),
(6, 'en', 'Appetizers', 'Small bites to whet your appetite.'),
(6, 'tr', 'Başlangıçlar', 'İştahınızı açacak küçük atıştırmalıklar.');

-- 3. Ingredients
INSERT INTO public.ingredients (id, slug, default_image_url) VALUES
(1, 'tomato', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/800px-Bright_red_tomato_and_cross_section02.jpg'),
(2, 'onion', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/800px-Onion_on_White.JPG'),
(3, 'garlic', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Garlic.jpg/800px-Garlic.jpg'),
(4, 'lentil', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Red_lentils.jpg/800px-Red_lentils.jpg'),
(5, 'chicken-breast', NULL),
(6, 'lettuce', NULL),
(7, 'cucumber', NULL),
(8, 'olive-oil', NULL),
(9, 'flour', NULL),
(10, 'sugar', NULL),
(11, 'egg', NULL),
(12, 'milk', NULL),
(13, 'butter', NULL),
(14, 'salt', NULL),
(15, 'black-pepper', NULL),
(16, 'mint', NULL),
(17, 'bulgur', NULL),
(18, 'parsley', NULL),
(19, 'lemon', NULL),
(20, 'chocolate', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/1024px-Chocolate_%28blue_background%29.jpg');

INSERT INTO public.ingredient_translations (ingredient_id, locale, name) VALUES
(1, 'en', 'Tomato'), (1, 'tr', 'Domates'),
(2, 'en', 'Onion'), (2, 'tr', 'Soğan'),
(3, 'en', 'Garlic'), (3, 'tr', 'Sarımsak'),
(4, 'en', 'Red Lentil'), (4, 'tr', 'Kırmızı Mercimek'),
(5, 'en', 'Chicken Breast'), (5, 'tr', 'Tavuk Göğsü'),
(6, 'en', 'Lettuce'), (6, 'tr', 'Marul'),
(7, 'en', 'Cucumber'), (7, 'tr', 'Salatalık'),
(8, 'en', 'Olive Oil'), (8, 'tr', 'Zeytinyağı'),
(9, 'en', 'Flour'), (9, 'tr', 'Un'),
(10, 'en', 'Sugar'), (10, 'tr', 'Şeker'),
(11, 'en', 'Egg'), (11, 'tr', 'Yumurta'),
(12, 'en', 'Milk'), (12, 'tr', 'Süt'),
(13, 'en', 'Butter'), (13, 'tr', 'Tereyağı'),
(14, 'en', 'Salt'), (14, 'tr', 'Tuz'),
(15, 'en', 'Black Pepper'), (15, 'tr', 'Karabiber'),
(16, 'en', 'Dried Mint'), (16, 'tr', 'Nane'),
(17, 'en', 'Fine Bulgur'), (17, 'tr', 'İnce Bulgur'),
(18, 'en', 'Parsley'), (18, 'tr', 'Maydanoz'),
(19, 'en', 'Lemon'), (19, 'tr', 'Limon'),
(20, 'en', 'Dark Chocolate'), (20, 'tr', 'Bitter Çikolata');


-- 4. Recipes
-- Recipe 1: Lentil Soup (Published, Free)
INSERT INTO public.recipes (id, owner_user_id, status, is_free, cover_image_url) VALUES
(1, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Lentil_soup_%28mercimek_%C3%A7orbas%C4%B1%29.jpg/1024px-Lentil_soup_%28mercimek_%C3%A7orbas%C4%B1%29.jpg');

INSERT INTO public.recipe_categories (recipe_id, category_id) VALUES (1, 1);

INSERT INTO public.recipe_translations (recipe_id, locale, title, description, tips) VALUES
(1, 'en', 'Classic Lentil Soup', 'A timeless, hearty red lentil soup, perfect for any season.', 'Serve with a squeeze of lemon and a sprinkle of dried mint.'),
(1, 'tr', 'Klasik Mercimek Çorbası', 'Her mevsime uygun, doyurucu ve klasik bir kırmızı mercimek çorbası.', 'Limon sıkarak ve nane serperek servis edin.');

INSERT INTO public.recipe_steps (recipe_id, locale, step_number, text) VALUES
(1, 'en', 1, 'Sauté one chopped onion in olive oil until translucent.'),
(1, 'en', 2, 'Add washed red lentils, water, and salt. Bring to a boil.'),
(1, 'en', 3, 'Simmer for 20-25 minutes until lentils are soft.'),
(1, 'en', 4, 'Blend the soup until smooth. Melt butter in a separate pan, add dried mint, and pour over the soup.'),
(1, 'tr', 1, 'Doğranmış bir soğanı zeytinyağında pembeleşinceye kadar kavurun.'),
(1, 'tr', 2, 'Yıkanmış kırmızı mercimek, su ve tuzu ekleyip kaynamaya bırakın.'),
(1, 'tr', 3, 'Mercimekler yumuşayana kadar 20-25 dakika pişirin.'),
(1, 'tr', 4, 'Çorbayı pürüzsüz olana kadar blenderdan geçirin. Ayrı bir tavada tereyağını eritip naneyi ekleyin ve çorbanın üzerine gezdirin.');

-- Variants for Recipe 1
INSERT INTO public.recipe_variants (id, recipe_id, servings) VALUES (1, 1, 2), (2, 1, 4);
-- Ingredients for 2 servings
INSERT INTO public.recipe_variant_ingredients (variant_id, ingredient_id, amount, unit_id) VALUES
(1, 4, 150, (SELECT id from public.units where code = 'g')),
(1, 2, 0.5, (SELECT id from public.units where code = 'pcs')),
(1, 8, 2, (SELECT id from public.units where code = 'tbsp')),
(1, 13, 1, (SELECT id from public.units where code = 'tbsp')),
(1, 16, 1, (SELECT id from public.units where code = 'tsp')),
(1, 14, 1, (SELECT id from public.units where code = 'pinch'));
-- Ingredients for 4 servings
INSERT INTO public.recipe_variant_ingredients (variant_id, ingredient_id, amount, unit_id) VALUES
(2, 4, 300, (SELECT id from public.units where code = 'g')),
(2, 2, 1, (SELECT id from public.units where code = 'pcs')),
(2, 8, 4, (SELECT id from public.units where code = 'tbsp')),
(2, 13, 2, (SELECT id from public.units where code = 'tbsp')),
(2, 16, 2, (SELECT id from public.units where code = 'tsp')),
(2, 14, 1, (SELECT id from public.units where code = 'tsp'));


-- Recipe 2: Chocolate Brownie (Published, Free)
INSERT INTO public.recipes (id, owner_user_id, status, is_free, cover_image_url) VALUES
(2, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Fudge_Brownie.jpg/1024px-Fudge_Brownie.jpg');

INSERT INTO public.recipe_categories (recipe_id, category_id) VALUES (2, 4);

INSERT INTO public.recipe_translations (recipe_id, locale, title, description, tips) VALUES
(2, 'en', 'Fudgy Chocolate Brownies', 'Rich, dense, and incredibly fudgy chocolate brownies.', 'Do not overbake! A slightly underbaked center makes for the best texture.'),
(2, 'tr', 'Islak Çikolatalı Brownie', 'Yoğun, nemli ve inanılmaz lezzetli çikolatalı brownie.', 'Fazla pişirmemeye dikkat edin! Ortasının hafif nemli kalması en iyi dokuyu sağlar.');

INSERT INTO public.recipe_steps (recipe_id, locale, step_number, text) VALUES
(2, 'en', 1, 'Preheat oven to 175°C (350°F). Melt butter and dark chocolate together.'),
(2, 'en', 2, 'In a separate bowl, whisk eggs and sugar until pale and fluffy.'),
(2, 'en', 3, 'Pour the cooled chocolate mixture into the egg mixture and combine.'),
(2, 'en', 4, 'Gently fold in the flour and a pinch of salt. Do not overmix.'),
(2, 'en', 5, 'Pour batter into a greased baking pan and bake for 25-30 minutes.'),
(2, 'tr', 1, 'Fırını 175°C''ye ısıtın. Tereyağı ve bitter çikolatayı birlikte eritin.'),
(2, 'tr', 2, 'Ayrı bir kapta yumurta ve şekeri rengi açılıp köpürene kadar çırpın.'),
(2, 'tr', 3, 'Soğuyan çikolatalı karışımı yumurtalı karışıma döküp birleştirin.'),
(2, 'tr', 4, 'Unu ve bir tutam tuzu yavaşça karışıma ekleyin. Fazla karıştırmayın.'),
(2, 'tr', 5, 'Karışımı yağlanmış fırın kabına dökün ve 25-30 dakika pişirin.');

-- Variants for Recipe 2
INSERT INTO public.recipe_variants (id, recipe_id, servings) VALUES (3, 2, 4), (4, 2, 8);
-- Ingredients for 4 servings (small batch)
INSERT INTO public.recipe_variant_ingredients (variant_id, ingredient_id, amount, unit_id) VALUES
(3, 20, 100, (SELECT id from public.units where code = 'g')),
(3, 13, 85, (SELECT id from public.units where code = 'g')),
(3, 10, 150, (SELECT id from public.units where code = 'g')),
(3, 11, 2, (SELECT id from public.units where code = 'pcs')),
(3, 9, 60, (SELECT id from public.units where code = 'g')),
(3, 14, 1, (SELECT id from public.units where code = 'pinch'));
-- Ingredients for 8 servings (standard batch)
INSERT INTO public.recipe_variant_ingredients (variant_id, ingredient_id, amount, unit_id) VALUES
(4, 20, 200, (SELECT id from public.units where code = 'g')),
(4, 13, 170, (SELECT id from public.units where code = 'g')),
(4, 10, 300, (SELECT id from public.units where code = 'g')),
(4, 11, 4, (SELECT id from public.units where code = 'pcs')),
(4, 9, 120, (SELECT id from public.units where code = 'g')),
(4, 14, 0.5, (SELECT id from public.units where code = 'tsp'));

-- Add 8 more recipes to reach the >= 10 goal.
-- For brevity, these will be simpler entries.
INSERT INTO public.recipes (id, owner_user_id, status, is_free, cover_image_url) VALUES
(3, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'),
(4, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'),
(5, NULL, 'published', false, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'), -- Not free
(6, NULL, 'pending', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'), -- Pending
(7, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'),
(8, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'),
(9, NULL, 'published', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'),
(10, NULL, 'rejected', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Recipe_logo.jpeg/120px-Recipe_logo.jpeg'); -- Rejected

INSERT INTO public.recipe_categories (recipe_id, category_id) VALUES
(3, 2), (4, 3), (5, 3), (6, 5), (7, 6), (8, 1), (9, 4), (10, 2);

INSERT INTO public.recipe_translations (recipe_id, locale, title, description) VALUES
(3, 'en', 'Simple Green Salad', 'A quick and easy green salad.'),
(3, 'tr', 'Basit Yeşil Salata', 'Hızlı ve kolay bir yeşil salata.'),
(4, 'en', 'Grilled Chicken', 'Juicy grilled chicken breast.'),
(4, 'tr', 'Izgara Tavuk', 'Sulu ızgara tavuk göğsü.'),
(5, 'en', 'Premium Steak', 'A members-only steak recipe.'),
(5, 'tr', 'Özel Biftek', 'Sadece üyelere özel biftek tarifi.'),
(6, 'en', 'Scrambled Eggs', 'User submitted scrambled eggs.'),
(6, 'tr', 'Çırpılmış Yumurta', 'Kullanıcı gönderimi çırpılmış yumurta.'),
(7, 'en', 'Bruschetta', 'Classic tomato and basil bruschetta.'),
(7, 'tr', 'Bruschetta', 'Klasik domates ve fesleğenli bruschetta.'),
(8, 'en', 'Tomato Soup', 'Creamy tomato soup.'),
(8, 'tr', 'Domates Çorbası', 'Kremalı domates çorbası.'),
(9, 'en', 'Vanilla Ice Cream', 'Homemade vanilla ice cream.'),
(9, 'tr', 'Vanilyalı Dondurma', 'Ev yapımı vanilyalı dondurma.'),
(10, 'en', 'Rejected Salad', 'A rejected salad recipe.'),
(10, 'tr', 'Reddedilmiş Salata', 'Reddedilmiş bir salata tarifi.');

-- Minimal variants and ingredients for the rest
INSERT INTO public.recipe_variants (recipe_id, servings) VALUES (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1);

-- 5. Set one admin user
-- In a real scenario, you would find a user's ID from the auth.users table
-- and use it here. For seeding, we can't know the ID in advance.
-- The /supabase/README.md will instruct the developer on how to do this manually.
-- Example:
-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = '... an actual user id from auth.users ...';
