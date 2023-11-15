const { User } = require('./src/database/index')
const bcrypt = require('bcrypt')
const logger = require("./src/logging/applog")
const statsd = require('./src/metrics/metrics')
const authenticate = async (req, res, next) => {
  try {
    if(req.method == 'POST'){
      statsd.increment('api.post');
    }
    else if (req.method === 'GET') {
      if (req.originalUrl.startsWith('/v1/assignments/')) {
        const assignmentId = req.params.assignmentId;
        if (assignmentId) {
          statsd.increment('api.getAssignment');
        } else {
          statsd.increment('api.get');
        }
      }
    }
    else if(req.method == 'PUT'){
      statsd.increment('api.put');
    }
    else if(req.method == 'DELETE'){
      statsd.increment('api.delete');
    }
    else if(req.method == 'PATCH') {
      statsd.increment('api.patch');
    }
    const authHeader = req.headers.authorization;
    const credentials = getCredentials(authHeader)
    const email = credentials[0]
    const password = credentials[1]
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.info('User not found. Unauthorized: Access denied')
      return res.status(401).send('Unauthorized: Access denied.');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      next();
    } else {
      logger.info('Password not matched. Unauthorized: Access denied')
      return res.status(401).send('Unauthorized: Access denied.');
    }
  }
  catch (error) {
    logger.error(`Error occurred ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const getCredentials =  (authHeader) => {
  try {
    if (!authHeader) {
        return ["", ""]
    }
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    return credentials
  }
  catch (error) {
    logger.error(`Error occurred ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
    authenticate,
    getCredentials,
};
