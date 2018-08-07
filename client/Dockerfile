FROM node:latest
RUN apt install git
COPY package.json .
COPY package-lock.json .
RUN npm install --verbose
COPY . .