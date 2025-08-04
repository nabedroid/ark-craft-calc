# ベースイメージを指定
FROM node:14-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY ./package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを起動するコマンドを設定
CMD ["npm", "run", "start"]

# ポートを指定
EXPOSE 5000
