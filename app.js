const express = require('express')
const mysql = require('mysql2');
const sequelize = require('./src/database/index')
const User = require('./src/models/User')
const app = express()
const port = 3001;
const insert_row = require('./read_csv')
app.use(express.json());

app.listen(port, async () => {
    //await sequelize.sync()
    console.log(`Server is running on port ${port}`);
    //insert_row()
  });

sequelize.sync().then(() => {
    insert_row()
})


//fetch_emails()