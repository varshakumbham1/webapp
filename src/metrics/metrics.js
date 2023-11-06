const StatsD = require('node-statsd');
const statsd = new StatsD();

statsd.host = 'localhost'
statsd.port = 8125
module.exports = statsd