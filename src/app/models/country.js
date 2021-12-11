const mongoose = require('../../database');

// TODO: Change require to required;

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
