# Используем базовый образ Node.js
FROM node:20.11-slim

# Копируем файлы приложения в контейнер
COPY . /app

# Устанавливаем рабоцую директорию
WORKDIR /app

# Устанавливаем зависимости
RUN npm ci

# Указываем команду для запуска приложения
CMD [ "npm", "start" ]