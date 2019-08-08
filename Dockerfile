FROM colucom/nodejs:8.12.0
USER root

COPY . .

ARG COMMMUNITY_WEB3_PORTIS_ID
ARG COMMUNITY_WEB3_API_KEY
ARG NODE_ENV

RUN env

RUN rm -rf node_modules && rm package-lock.json

RUN cd contracts/entities && npm install && npm run build

RUN cd contracts/token-factory  && npm install && npm run build

RUN cd dapp && npm install && NODE_ENV=qa npm run build && cp dist/* ../server/public

RUN cd server && npm install

RUN cp -r server/* . 
RUN ls -lah

CMD [ "npm", "start" ]