FROM node:20-alpine as builder

WORKDIR /build

COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

RUN npm ci

#################################################################################

FROM node:20-alpine

RUN apk add --no-cache --upgrade tini libcrypto3 libssl3

ENV HTTP_PORT=3000
ENV LOG_LEVEL=info
ENV NODE_ENV=production

LABEL name="sequelize-inventory-transaction-model" \
      description="fast data demo for platmosphere 2024" 

COPY ./package.json package.json
COPY LICENSE LICENSE

COPY --from=builder /build .
COPY src src

USER node

ENTRYPOINT ["/sbin/tini", "--"]

CMD npm run start
