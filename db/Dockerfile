FROM mysql:5.7

# MySQL設定ファイルのコピー
COPY ./my.cnf /etc/my.cnf

# 初期化SQLとCSVファイルのコピー
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql
COPY ./*.csv /var/lib/mysql-files
