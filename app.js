const express = require('express')
const {sequelize, createDatabase, syncDatabase, User, Assignment} = require('./src/database/index')
const { authenticate, getCredentials } = require('./auth')
const assignmentRouter = require('./src/routes/Assignment');
const app = express()
const port = 3000;
const insert_row = require('./src/database/read_csv')
app.use(express.json());

(async () => {
    try {
      await createDatabase();
      await sequelize.sync({ alter: true });
      await insert_row();
  
      app.listen(port, () => {
        console.log("Server running on port", port);
      });
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

app.use('/v1/assignments', assignmentRouter);

app.get('/healthz', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache');
        if(Object.keys(req.body).length > 0) {
            res.status(400).send();
        }
        if(Object.keys(req.query).length > 0) {
            res.status(400).send()
        }
        else {
            await sequelize.authenticate()
            res.status(200).send()
        }
      } catch (error) {
            res.status(503).send()
      }
});

module.exports = app