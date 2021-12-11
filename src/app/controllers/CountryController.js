const CountriesRepository = require('../repositories/CountriesRepository');

class CountryController {
  async index(request, response) {
    const countries = await CountriesRepository.findAll();

    return response.json(countries);
  }
}

module.exports = new CountryController();
