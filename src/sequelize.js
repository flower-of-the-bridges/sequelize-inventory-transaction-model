const { Sequelize } = require('sequelize')
const fp = require('fastify-plugin')
const { initInventoryModel, initTransactionsModel } = require('./models')
const { generate } = require('./generation')

const {
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = 'example',
  MYSQL_DATABASE = 'test',
  MYSQL_HOST = 'localhost:3306',
  PGSQL_USER = 'postgres',
  PGSQL_PASSWORD = 'example',
  PGSQL_HOST = 'localhost:5432',
  PGSQL_DATABASE = 'test',
  GENERATE_INTERVAL_MS = 2000
} = process.env

module.exports = fp(async function (fastify, opts, done) {
  const { log } = fastify

  const logging = sequelizeMessage => log.debug({ sequelizeMessage }, 'log from sequelize')
  const mySequelize = new Sequelize(
        `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}/${MYSQL_DATABASE}`,
        { logging }
  )
  const pgSequelize = new Sequelize(
        `postgres://${PGSQL_USER}:${PGSQL_PASSWORD}@${PGSQL_HOST}/${PGSQL_DATABASE}`,
        { logging }
  )

  try {
    await mySequelize.authenticate()
    await pgSequelize.authenticate()
    log.info('Connection has been established successfully.')
  } catch (error) {
    log.error(error, 'Unable to connect to the database:')
  }

  fastify.addHook('onClose', async () => {
    // Some async code
    log.info('Closing connections')
    await mySequelize.close()
    await pgSequelize.close()
  })

  initInventoryModel(mySequelize)
  initTransactionsModel(pgSequelize)

  fastify.decorate('generation', { intervalId: undefined })

  fastify.post('/model', async (request, reply) => {
    try {
      await mySequelize.sync({ force: true })
      await pgSequelize.sync({ force: true })
      reply.status(201).send()
    } catch (error) {
      request.log.error(error, 'error while creating model')
      reply.status(500).send(error)
    }
  })

  fastify.post('/generate/start', async (request, reply) => {
    const { log } = request
    const { generation } = fastify
    if (generation.intervalId) {
      log.warn('generation has already been started')
      reply.status(204).send()
      return
    }
    const generationMetadata = { started: false }
    generation.intervalId = setInterval(async () => {
      log.info('generating random data')
      await generate(log, generationMetadata)
    }, GENERATE_INTERVAL_MS)

    reply.status(201).send()
  })

  fastify.post('/generate/stop', async (request, reply) => {
    const { log } = request
    const { generation } = fastify
    if (!generation.intervalId) {
      log.warn('generation was not started')
      reply.status(204).send()
      return
    }
    clearInterval(generation.intervalId)
    generation.intervalId = undefined
    log.info('clear data generation')
    reply.status(201).send()
  })

  done()
})
