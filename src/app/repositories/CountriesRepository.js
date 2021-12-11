const Country = require('../models/country');

class CountriesRepository {
  async findAll() {
    const countries = await Country.find();

    return countries;
  }

  async findById(id) {
    const country = await Country.findById(id);

    return country;
  }
}

module.exports = new CountriesRepository();
