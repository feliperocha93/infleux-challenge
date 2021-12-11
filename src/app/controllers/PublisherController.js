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

  async index(request, response) {
    const publishers = await PublishersRepository.findAll();

    return response.json(publishers);
  }

  async show(request, response) {
    const { id } = request.params;

    const publisher = await PublishersRepository.findById(id);

    if (!publisher) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    return response.json(publisher);
  }

  async filter(request, response) {
    const filter = { ...request.query };

    const publisher = await PublishersRepository.findByFilter(filter);

    return response.json(publisher);
  }
}

module.exports = new PublisherController();
