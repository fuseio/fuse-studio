FROM node:latest
USER $UID:$GID
WORKDIR /app
RUN apt install git
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]