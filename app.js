const express = require('express')
const mysql = require('mysql2');
const sequelize = require('./src/database/index')
const User = require('./src/models/User')
const Assignment = require('./src/models/Assignment')
const { authenticate, getCredentials } = require('./auth')
const assignmentRouter = require('./src/routes/Assignment');
const healthzRouter = require('./src/routes/Healthz')
const app = express()
const port = 3000;
const insert_row = require('./src/database/read_csv')
app.use(express.json());

const createDatabase = async () => {
    //const { host, username, password, database } = config;
    const database = 'Cloud_db'
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Geethareddy@1989'
    });
     connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  };

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
  });

(async () => {
try {
    await createDatabase();
    await sequelize.sync({ alter: true }).then(() => {
        insert_row()
    })
} catch (error) {
    console.error("Error:", error);
}
})();

User.hasMany(Assignment, {
    foreignKey: 'user_id', 
});
Assignment.belongsTo(User, {
    foreignKey: 'user_id', 
});



app.use('/assignments', assignmentRouter);
app.use('/healthz', healthzRouter);

// app.get('/healthz', async (req, res) => {
//     try {
//         res.set('Cache-Control', 'no-cache');
//         if(Object.keys(req.body).length > 0) {
//             res.status(400).send();
//         }
//         if(Object.keys(req.query).length > 0) {
//             res.status(400).send()
//         }
//         else {
//             await sequelize.authenticate()
//             res.status(200).send()
//         }
//       } catch (error) {
//             res.status(503).send()
//       }
// });

// app.use('/healthz', healthzRouter, (req, res, next) => {
    
// });