const { fakerIT: faker } = require('@faker-js/faker')
const { Shop, Product, Order, OrdersProduct } = require('./models')

const {
  NUMBER_OF_SHOPS = 10,
  NUMBER_OF_PRODUCTS = 5,
  NUMBER_OF_PRODUCTS_IN_ORDER = 4,
  NUMBER_OF_ORDERS = 3
} = process.env

const shops = []
const products = []
const orders = []

/**
 *
 * @param {import('fastify').FastifyBaseLogger} log
 */
const generate = async (log, generationMetadata) => {
  if (!generationMetadata.started) {
    for (let i = 0; i < NUMBER_OF_SHOPS; i++) {
      const shop = await Shop.create({
        Name: faker.company.buzzPhrase(),
        Street: faker.location.street(),
        Since: faker.date.past({ years: 30 })
      })
      shops.push(shop)
    }
    log.debug({ shops }, 'created products')
    log.info({ NUMBER_OF_SHOPS }, 'created shops')
    generationMetadata.started = true
  } else {
    const newProducts = []
    const newOrders = []
    for (let i = 0; i < NUMBER_OF_PRODUCTS; i++) {
      const product = await Product.create({
        Name: faker.commerce.productName(),
        ISBN: faker.commerce.isbn(10),
        Price: faker.commerce.price({ min: 50, max: 200 }),
        Quantity: faker.number.int({ min: 0, max: 100 }),
        ExpirationDate: faker.date.future({ years: 5 }),
        ShopId: shops[faker.number.int({ min: 0, max: NUMBER_OF_SHOPS - 1 })].Id
      })
      newProducts.push(product)
    }

    log.debug({ newProducts }, 'created products')
    products.push(...newProducts)

    log.info({ productsLength: products.length }, 'products length is now')

    for (let i = 0; i < NUMBER_OF_ORDERS; i++) {
      const order = await Order.create({
        Payment: faker.finance.transactionType(),
        Delivery: faker.vehicle.vrm(),
        CreationDate: faker.date.recent()
      })
      for (let j = 0; j < faker.number.int({ min: 1, max: NUMBER_OF_PRODUCTS_IN_ORDER }); j++) {
        await OrdersProduct.create({
          ProductId: products[faker.number.int({ min: 0, max: NUMBER_OF_PRODUCTS - 1 })].Id,
          OrderId: order.Id
        })
      }
      newOrders.push(order)
    }

    log.debug({ newOrders }, 'created orders')
    orders.push(...newOrders)
    log.info({ ordersLength: orders.length }, 'orders length is now')
  }
}

module.exports = {
  generate
}
