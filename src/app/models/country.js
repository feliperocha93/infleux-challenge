const mongoose = require('../../database');

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ({ path }) => `${path} is required`],
  },
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
