# Используем базовый образ Node.js
FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы в рабочую директорию
COPY . .

# Копируем .env файл в контейнер
COPY .env .env

# Указываем порт, который будет прослушивать приложение
EXPOSE 5001

# Определяем команду для запуска приложения
CMD ["npx", "ts-node", "src/index.ts"]