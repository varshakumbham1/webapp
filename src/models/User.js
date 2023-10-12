const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const model = (sequelize) => {
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
		password: { type: Sequelize.STRING, allowNull:false, writeonly:true},
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
	return User
}

// User.beforeCreate(async (user) => {
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash(user.password, saltRounds);
//   user.password = hashedPassword;
// });

module.exports = model;
