const Sequelize = require('sequelize')
const sequelize = require('../database/index')

const User = sequelize.define('User', {
	user_id:{
		type:Sequelize.INTEGER,
		autoIncrement:true,
		allowNull:false,
		primaryKey:true
	},
	first_name: { type: Sequelize.STRING, allowNull:false },
  last_name: { type: Sequelize.STRING, allowNull:false },
	email: { type: Sequelize.STRING, unique: true, allowNull:false },
	password: { type: Sequelize.STRING, allowNull:false },
	account_created: Sequelize.DATE,
	account_updated: Sequelize.DATE
},
{
  createdAt: 'account_created',
  updatedAt: 'account_updated'
})

// Exporting User, using this constant
// we can perform CRUD operations on
// 'user' table.
module.exports = User
