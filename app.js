const express = require('express')
const mysql = require('mysql2');
const sequelize = require('./src/database/index')
const User = require('./src/models/User')
const app = express()
const port = 3001;
const insert_row = require('./src/database/read_csv')
app.use(express.json());

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
  });

sequelize.sync().then(() => {
    insert_row()
})
