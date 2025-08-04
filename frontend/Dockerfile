# ベースイメージを指定
FROM node:14-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY ./package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ビルドコマンドを実行
RUN npm run build

# アプリケーションを起動するコマンドを設定
CMD ["npm", "start"]

# ポートを指定
EXPOSE 3000
