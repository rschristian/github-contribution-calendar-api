FROM node:14-alpine
WORKDIR /app
COPY . /app
RUN yarn --prod && yarn cache clean
EXPOSE 3000
CMD ["yarn", "start"]