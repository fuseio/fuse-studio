cd client
npm install --registry https://registry.npmjs.org/
npm run build
cp dist/* ../server/public

cd ../server
npm install --registry https://registry.npmjs.org/
npm start
