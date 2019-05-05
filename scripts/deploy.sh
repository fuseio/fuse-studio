set -e

cd dapp

if ! [ -n "$NO_INSTALL" ]
then
  npm install --registry https://registry.npmjs.org/
fi

npm run build
cp dist/* ../server/public

cd ../server
# npm install --registry https://registry.npmjs.org/
if ! [ -n "$NO_INSTALL" ]
then
  npm install --registry https://registry.npmjs.org/
fi
