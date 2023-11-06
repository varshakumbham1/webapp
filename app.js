const express = require('express')
const {sequelize, createDatabase, syncDatabase, User, Assignment} = require('./src/database/index')
const { authenticate, getCredentials } = require('./auth')
const assignmentRouter = require('./src/routes/Assignment');
const app = express()
require('dotenv').config();
const port = process.env.PORT
const insert_row = require('./src/database/read_csv')
const logger = require('./src/logging/applog')
const statsd = require('./src/metrics/metrics')
app.use(express.json());
(async () => {
    try {
      await createDatabase();
      await sequelize.sync({ alter: true });
      await insert_row();
      app.listen(port, () => {
        logger.info(`Server running on port: ${port}`);
      });
    } catch (error) {
      logger.error(`Connection failed ${error}`);
      console.log(error)
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
        statsd.increment('api.healthz');
        res.set('Cache-Control', 'no-cache');
        if(Object.keys(req.body).length > 0) {
            res.status(400).send();
        }
        if(Object.keys(req.query).length > 0) {
            res.status(400).send()
        }
        else {
            await sequelize.authenticate()
            logger.info(`/heathz connection successful`);
            res.status(200).send()
        }
      } catch (error) {
            logger.error(`/healthz connection failed: ${error}`);
            res.status(503).send()
      }
});

module.exports = app