const Sequelize = require('sequelize')

const mysql = require("mysql2/promise");
const UserModel = require("../models/User");
const AssignmentModel = require("../models/Assignment");

// require('dotenv').config();
// const database = process.env.database
// const user = process.env.username
// const password = process.env.password
// const dialectName = process.env.dialect
// const host = process.env.host
const database = 'Cloud_db'
const user = 'root'
const password = 'Geethareddy@1989'
const host = 'localhost'
const dialectName = 'mysql'

const sequelize = new Sequelize(
  database, user, password, 
  {
    dialect: dialectName,
    host: host
  })

const User = UserModel(sequelize);
const Assignment = AssignmentModel(sequelize);

const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
  console.log("Models synchronized successfully.");
};

const createDatabase = async () => {
  const connection = await mysql.createConnection({
    host: host,
    user: user,
    password: password,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
};

module.exports = {
  sequelize,
  createDatabase,
  syncDatabase,
  User,
  Assignment,
};