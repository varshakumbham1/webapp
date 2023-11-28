const Sequelize = require('sequelize');
const model = (sequelize) => {
	const Submission = sequelize.define('Submission', {
		submission_id:{
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull:false,
			primaryKey:true
		},
		submission_url: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		submission_date: {
			type: Sequelize.DATE,
			readonly: true
		},
		submission_updated: {
			type: Sequelize.DATE,
			readonly: true
		}
	},
	{
	createdAt: 'submission_date',
	updatedAt: 'submission_updated'
	})
	return Submission
}
module.exports = model