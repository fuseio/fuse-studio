cd client
npm run build
cp dist/* ../server/public

cd ../server
npm install
npm start
