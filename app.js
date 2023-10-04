const express = require('express')
const mysql = require('mysql2');
const sequelize = require('./src/database/index')
const User = require('./src/models/User')
const Assignment = require('./src/models/Assignment')
const { authenticate, getCredentials } = require('./auth')
const assignmentRouter = require('./src/routes/Assignment');
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

User.hasMany(Assignment, {
    foreignKey: 'user_id', 
});
Assignment.belongsTo(User, {
    foreignKey: 'user_id', 
});

app.get('/api/protected', authenticate, (req, res) => {
    credentials = getCredentials(req.headers.authorization)
    res.status(200).json({ message: 'Authenticated endpoint' });
});

app.use('/assignments', assignmentRouter);

