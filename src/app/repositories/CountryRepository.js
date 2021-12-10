const Country = require('../models/country');

class CountryRepository {
  async findById(id) {
    const country = await Country.findById(id);

    return country;
  }
}

module.exports = new CountryRepository();
