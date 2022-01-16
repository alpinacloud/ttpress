#!/bin/sh

export NODE_ENV=production

rm -rf dist
mkdir -p dist

yarn sass:main
yarn sass:editor

cp -R public dist/public
cp -R views dist/views
./node_modules/typescript/bin/tsc

cp package.json dist/package.json
cp yarn.lock dist/yarn.lock
