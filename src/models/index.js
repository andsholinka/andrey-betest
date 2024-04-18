const dbConfig = require('../config/database');
const mongoose = require('mongoose');

module.exports = {
    mongoose,
    url: dbConfig.url,
    user: require('./user.model')(mongoose),
}