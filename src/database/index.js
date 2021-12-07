const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/influex_challenge');

module.exports = mongoose;
