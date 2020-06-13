FROM node:14-alpine
WORKDIR /app
COPY . /app
RUN yarn --prod && yarn cache clean
EXPOSE 3001
CMD ["yarn", "serve"]