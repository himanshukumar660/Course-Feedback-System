FROM node:8.11.1-slim

RUN mkdir /feedback-system -p
WORKDIR /feedback-system

ADD package.json /feedback-system/package.json

RUN npm install -g nodemon@~1.17.3 --silent
RUN npm install --silent

COPY . /feedback-system
