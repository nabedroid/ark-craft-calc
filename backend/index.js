const express = require('express');
const app = express();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySql Connected...');
});

// Request.bodyをjsonとしてparseする機能を使用
app.use(express.json());
// Postを実装するなら必要
// app.use(express.urlencoded({ limit: "100kb" }));
// CORS回避を行うミドルウェア関数
app.use((req, res, next) => {
  res.header({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.BACKEND_ALLOWED_ORIGIN,
    'charset': 'utf-8',
  });
  next();
});

// APIエンドポイントを追加

// アイテム一覧を取得
app.get('/api/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// レシピ一覧を取得
app.get('/api/recipes', (req, res) => {
  const sql = 'SELECT * FROM recipes';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 素材数一覧を取得
app.get('/api/recipe_materials', (req, res) => {
  const sql = 'SELECT * FROM recipe_materials';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
