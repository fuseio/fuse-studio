FROM colucom/nodejs:8.12.0
USER root
#WORKDIR /app
#RUN apt install git
#COPY package*.json ./
COPY . .
RUN rm -rf node_modules && rm package-lock.json

# RUN NODE_ENV=qa scripts/deploy.sh

RUN cd contracts/entities && npm install && npm run build

RUN cd contracts/token-factory  && npm install && npm run build

RUN cd dapp && npm install && npm run build && cp dist/* ../server/public

RUN cd server && npm install

RUN cp -r server/* . 
RUN ls -lah
#RUN npm ls 2>&1

#COPY . /app
#RUN cd server && npm install
#WORKDIR /app/server
CMD [ "npm", "start" ]