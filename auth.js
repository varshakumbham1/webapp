const User = require('./src/models/User')
const bcrypt = require('bcrypt')
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized: No credentials provided.');
  }
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const email = credentials[0];
  const password = credentials[1];
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

module.exports = authenticate