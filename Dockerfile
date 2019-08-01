FROM colucom/nodejs:8.12.0
USER root

COPY . .

RUN env

RUN rm -rf node_modules && rm package-lock.json

RUN cd contracts/entities && npm install && npm run build

RUN cd contracts/token-factory  && npm install && npm run build

RUN cd dapp && npm install && npm run build && cp dist/* ../server/public

RUN cd server && npm install

RUN cp -r server/* . 
RUN ls -lah

CMD [ "npm", "start" ]