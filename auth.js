const { User } = require('./src/database/index')
const bcrypt = require('bcrypt')
const logger = require("./src/logging/applog")
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const credentials = getCredentials(authHeader)
    const email = credentials[0]
    const password = credentials[1]
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send('Unauthorized: Access denied.');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      next();
    } else {
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
