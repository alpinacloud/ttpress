FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY dist /usr/src/app
RUN yarn --prod

CMD ["npm", "run", "start:prod"]