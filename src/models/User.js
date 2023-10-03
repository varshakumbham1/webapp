const Sequelize = require('sequelize')
const sequelize = require('../database/index')
const bcrypt = require('bcrypt');
const User = sequelize.define('User', {
	user_id:{
		type:Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
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

User.beforeCreate(async (user) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  user.password = hashedPassword;
});

module.exports = User
