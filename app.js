const express = require('express')
const mysql = require('mysql2');
const sequelize = require('./src/database/index')
const User = require('./src/models/User')
const authenticate = require('./auth')
const app = express()
const port = 3000;
const insert_row = require('./src/database/read_csv')
app.use(express.json());

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
  });

sequelize.sync({ alter: true }).then(() => {
    insert_row()
})

app.get('/api/protected', authenticate, (req, res) => {
  res.status(200).json({ message: 'Authenticated endpoint' });
});