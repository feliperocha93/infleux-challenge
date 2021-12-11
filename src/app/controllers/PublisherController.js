const mongoose = require('../../database');

const PublishersRepository = require('../repositories/PublishersRepository');
const CountriesRepository = require('../repositories/CountriesRepository');

class PublisherController {
  async store(request, response) {
    const { name, country_id } = request.body;

    if (!name) {
      return response.status(400).json({ error: 'name is required' });
    }

    if (!country_id) {
      return response.status(400).json({ error: 'country_id is required' });
    }

    const countryIdExist = await CountriesRepository.findById(country_id);

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

  async update(request, response) {
    const { id } = request.params;
    const { name, country_id } = request.body;

    if (Object.keys(request.body).length === 0) {
      return response.status(400).json({ error: 'payload can not be empty' });
    }

    if (
      Object.prototype.hasOwnProperty.call(request.body, 'name')
      && (typeof name !== 'string' || name.length === 0)
    ) {
      return response.status(400).json({ error: 'name is invalid' });
    }

    if (
      Object.prototype.hasOwnProperty.call(request.body, 'country_id')
      && !(mongoose.Types.ObjectId.isValid(String(country_id)))
    ) {
      return response.status(400).json({ error: 'country_id is invalid' });
    }

    const publisherExist = await PublishersRepository.findById(id);

    if (!publisherExist) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    const countryIdExist = await CountriesRepository.findById(country_id);

    if (!countryIdExist) {
      return response.status(404).json({ error: 'country_id not found' });
    }

    const publisher = await PublishersRepository.update(id, { name, country_id });

    return response.json(publisher);
  }

  async delete(request, response) {
    const { id } = request.params;

    const publisher = await PublishersRepository.remove(id);

    if (!publisher) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    return response.status(204).send();
  }
}

module.exports = new PublisherController();
