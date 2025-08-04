-- データベースの作成
DROP DATABASE IF EXISTS ark_craft_calc;
CREATE DATABASE ark_craft_calc;

-- データベースを使用
USE ark_craft_calc;

-- アイテムテーブルの作成
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY,         -- アイテムのID
  name VARCHAR(255) NOT NULL,  -- アイテムの名称
  category VARCHAR(255),       -- アイテムのカテゴリ名（）
  sub_category VARCHAR(255),   -- アイテムのサブカテゴリ名（マップ共通、DLC、Pritmitive+、null）
  icon_url VARCHAR(255)       -- アイテムのアイコンURL
);

-- レシピテーブルの作成
CREATE TABLE IF NOT EXISTS recipes (
  id INT PRIMARY KEY,          -- レシピのID
  name VARCHAR(255),            -- レシピの名称
  output_item_id INT,          -- 得られるアイテムのID
  output_item_quantity INT,    -- 得られるアイテムの数量
  FOREIGN KEY (output_item_id) REFERENCES items(id)
);

-- 素材テーブルの作成
CREATE TABLE IF NOT EXISTS recipe_materials (
  id INT PRIMARY KEY, -- 素材のID
  recipe_id INT,      -- レシピのID
  item_id INT,        -- アイテムのID
  quantity INT,       -- 素材数
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- items.csvのデータをitemsへ挿入
LOAD DATA INFILE '/var/lib/mysql-files/items.csv'
INTO TABLE items
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- recipes.csvのデータをrecipesへ挿入
LOAD DATA INFILE '/var/lib/mysql-files/recipes.csv'
INTO TABLE recipes
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- materials.csvのデータをrecipe_materialsへ挿入
LOAD DATA INFILE '/var/lib/mysql-files/materials.csv'
INTO TABLE recipe_materials
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';
