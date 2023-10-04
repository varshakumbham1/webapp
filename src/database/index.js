const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  'Cloud_db',
  'root',
  'Geethareddy@1989',
  {
    dialect: 'mysql',
    host: 'localhost',
  }
)
module.exports = sequelize