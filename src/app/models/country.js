const mongoose = require('../../database');

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
