const PublishersRepository = require('../repositories/PublishersRepository');
const CountryRepository = require('../repositories/CountryRepository');

class PublisherController {
  async store(request, response) {
    const { name, country_id } = request.body;

    if (!name) {
      return response.status(400).json({ error: 'name is required' });
    }

    if (!country_id) {
      return response.status(400).json({ error: 'country_id is required' });
    }

    const countryIdExist = await CountryRepository.findById(country_id);

    if (!countryIdExist) {
      return response.status(404).json({ error: 'country_id not found' });
    }

    const publisher = await PublishersRepository.create({ name, country_id });

    return response.status(201).json(publisher);
  }
}

module.exports = new PublisherController();
