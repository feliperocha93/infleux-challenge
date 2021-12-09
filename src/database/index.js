const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/infleux_challenge');

module.exports = mongoose;
