FROM colucom/nodejs:8.12.0
USER root

COPY . .

ARG COMMMUNITY_WEB3_PORTIS_ID
ARG COMMUNITY_WEB3_API_KEY
ARG NODE_ENV
ARG NODE_CONFIG_ENV

RUN rm -rf node_modules && rm package-lock.json

RUN cd packages/roles && npm install

RUN cd packages/contract-utils && npm install

RUN cd contracts/entities && npm install && npm run build

RUN cd contracts/token-factory  && npm install && npm run build

RUN export NODE_ENV=qa && cd dapp && npm install && npm run build && cp dist/* ../server/public

RUN cd server && npm install

RUN cp -r server/* . 
RUN ls -lah

CMD [ "npm", "start" ]