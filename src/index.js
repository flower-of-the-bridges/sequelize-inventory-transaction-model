const sequelizePlugin = require('./sequelize')

const {
  HTTP_PORT = 3000,
  LOG_LEVEL = 'debug'
} = process.env
const fastify = require('fastify')({
  logger: {
    level: LOG_LEVEL
  }
})

fastify.register(sequelizePlugin)

fastify.listen({ port: HTTP_PORT }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
