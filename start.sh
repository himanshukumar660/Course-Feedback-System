#!/bin/sh

export NODE_ENV=development

npm install --silent

echo "Create data folder"
if [ ! -d "data" ]; then
  mkdir ./data/db
fi

npm run start-dev
