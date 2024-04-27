const { DataTypes, Model } = require('sequelize')

const defaultOptions = {
  timestamps: false
}

class Shop extends Model {}
class Product extends Model {}
class Order extends Model {}
class OrdersProduct extends Model {}

/**
 *
 * @param {import('sequelize').Sequelize} sequelize
 */
const initInventoryModel = (sequelize) => {
  Shop.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      Name: {
        type: DataTypes.STRING
      },
      Street: {
        type: DataTypes.STRING
      },
      Since: {
        type: DataTypes.DATE
      }
    },
    { ...defaultOptions, sequelize }
  )
  Product.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      ISBN: {
        type: DataTypes.STRING,
        allowNull: false
      },
      Name: {
        type: DataTypes.STRING
      },
      Price: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      Quantity: {
        type: DataTypes.INTEGER
      },
      ExpirationDate: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    { ...defaultOptions, sequelize }
  )

  Shop.hasMany(Product)
}

/**
 *
 * @param {Sequelize} sequelize
 */
const initTransactionsModel = (sequelize) => {
  Order.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      Payment: {
        type: DataTypes.STRING,
        allowNull: false
      },
      Delivery: {
        type: DataTypes.STRING,
        allowNull: false
      },
      CreationDate: {
        type: DataTypes.DATE
      }
    },
    { ...defaultOptions, sequelize }
  )

  OrdersProduct.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      ProductId: {
        type: DataTypes.INTEGER
      },
      OrderId: {
        type: DataTypes.INTEGER
      }
    },
    { ...defaultOptions, sequelize }
  )

  Order.hasMany(OrdersProduct, { foreignKey: { field: 'OrderId', allowNull: false } })
}

module.exports = {
  initInventoryModel,
  initTransactionsModel,
  Shop,
  Product,
  Order,
  OrdersProduct
}
