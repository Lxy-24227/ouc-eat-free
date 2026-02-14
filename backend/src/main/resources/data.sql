-- 清空现有数据（避免主键冲突，注意顺序：先删除有外键依赖的表）
DELETE FROM comment;
DELETE FROM rating;
DELETE FROM dish;

-- 重置自增主键（让ID从1开始）
ALTER TABLE dish AUTO_INCREMENT = 1;
ALTER TABLE rating AUTO_INCREMENT = 1;
ALTER TABLE comment AUTO_INCREMENT = 1;

-- 插入示例菜品
INSERT INTO dish (name, canteen, floor, avg_rating, created_at, updated_at) VALUES
('红烧肉', '二食堂', 2, 4.7, NOW(), NOW()),
('清蒸鲈鱼', '一食堂', 1, 4.5, NOW(), NOW()),
('麻辣香锅', '三食堂', 3, 4.9, NOW(), NOW()),
('番茄炒蛋', '二食堂', 1, 3.8, NOW(), NOW()),
('宫保鸡丁', '一食堂', 2, 4.2, NOW(), NOW()),
('酸菜鱼', '二食堂', 2, 4.6, NOW(), NOW()),
('糖醋里脊', '三食堂', 2, 4.3, NOW(), NOW()),
('地三鲜', '一食堂', 1, 3.5, NOW(), NOW()),
('水煮肉片', '二食堂', 3, 4.8, NOW(), NOW()),
('麻婆豆腐', '三食堂', 1, 4.1, NOW(), NOW());

-- 插入示例评分（确保 dish_id 对应上面的 ID）
-- 红烧肉 (id=1)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(1, 5, 'user001', NOW()),
(1, 5, 'user002', NOW()),
(1, 4, 'user003', NOW()),
(1, 5, 'user004', NOW());

-- 清蒸鲈鱼 (id=2)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(2, 5, 'user005', NOW()),
(2, 4, 'user006', NOW()),
(2, 4, 'user007', NOW());

-- 麻辣香锅 (id=3)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(3, 5, 'user008', NOW()),
(3, 5, 'user009', NOW()),
(3, 5, 'user010', NOW());

-- 番茄炒蛋 (id=4)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(4, 4, 'user011', NOW()),
(4, 3, 'user012', NOW()),
(4, 4, 'user013', NOW()),
(4, 4, 'user014', NOW());

-- 宫保鸡丁 (id=5)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(5, 4, 'user015', NOW()),
(5, 5, 'user016', NOW()),
(5, 4, 'user017', NOW());

-- 酸菜鱼 (id=6)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(6, 5, 'user018', NOW()),
(6, 4, 'user019', NOW()),
(6, 5, 'user020', NOW());

-- 糖醋里脊 (id=7)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(7, 4, 'user021', NOW()),
(7, 4, 'user022', NOW()),
(7, 5, 'user023', NOW());

-- 地三鲜 (id=8)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(8, 3, 'user024', NOW()),
(8, 4, 'user025', NOW()),
(8, 3, 'user026', NOW()),
(8, 4, 'user027', NOW());

-- 水煮肉片 (id=9)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(9, 5, 'user028', NOW()),
(9, 5, 'user029', NOW()),
(9, 4, 'user030', NOW());

-- 麻婆豆腐 (id=10)
INSERT INTO rating (dish_id, score, user_id, created_at) VALUES
(10, 4, 'user031', NOW()),
(10, 4, 'user032', NOW()),
(10, 5, 'user033', NOW());

-- 插入示例评论
INSERT INTO comment (dish_id, content, user_id, created_at) VALUES
(1, '肥而不腻，超级好吃', 'user001', NOW()),
(1, '分量很足，味道正宗', 'user002', NOW()),
(2, '鱼很新鲜，蒸得刚刚好', 'user005', NOW()),
(3, '麻辣过瘾，太下饭了', 'user008', NOW()),
(4, '家常味道，不错', 'user011', NOW()),
(5, '宫保鸡丁酸甜适口', 'user015', NOW()),
(6, '酸菜鱼汤很好喝', 'user018', NOW()),
(7, '糖醋里脊外酥里嫩', 'user021', NOW()),
(8, '地三鲜有点油', 'user024', NOW()),
(9, '水煮肉片麻辣鲜香', 'user028', NOW()),
(10, '麻婆豆腐很正宗', 'user031', NOW());