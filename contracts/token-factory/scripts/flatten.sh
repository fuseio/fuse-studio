#!/usr/bin/env bash

if [ -d flats ]; then
  rm -rf flats
fi

mkdir flats

./node_modules/.bin/truffle-flattener contracts/BasicToken.sol > flats/BasicToken_flat.sol
./node_modules/.bin/truffle-flattener contracts/ExpirableToken.sol > flats/ExpirableToken_flat.sol
./node_modules/.bin/truffle-flattener contracts/MintableBurnableToken.sol > flats/MintableBurnableToken_flat.sol
./node_modules/.bin/truffle-flattener contracts/TokenFactory.sol > flats/TokenFactory_flat.sol
