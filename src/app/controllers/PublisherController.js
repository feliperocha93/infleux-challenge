const PublishersRepository = require('../repositories/PublishersRepository');
const CountriesRepository = require('../repositories/CountriesRepository');

const Publisher = require('../models/Publisher');

const SchemaValidator = require('../utils/SchemaValidator');

const CampaignService = require('../services/CampaignService');

class PublisherController {
  async store(request, response) {
    const errors = SchemaValidator.validateAndGetErrors(Publisher, request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }
    try {
      const countryIdExist = await CountriesRepository.findById(request.body.country_id);
      if (!countryIdExist) {
        return response.status(404).json({ error: 'country_id not found' });
      }
      const publisher = await PublishersRepository.create(request.body);

      return response.status(201).json(publisher);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
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
    const { country_id } = request.body;

    if (Object.prototype.hasOwnProperty.call(request.body, 'campaigns_id')) {
      return response.status(400).json({ error: 'campaigns_id can not be updated' });
    }

    const countryIdExist = country_id && await CountriesRepository.findById(country_id);
    if (country_id && !countryIdExist) {
      return response.status(404).json({ error: 'country_id not found' });
    }

    const publisherExist = await PublishersRepository.findById(id);
    if (!publisherExist) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    const payload = { ...publisherExist._doc, ...request.body };
    const errors = SchemaValidator.validateAndGetErrors(Publisher, payload);
    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const publisher = await PublishersRepository.update(id, payload);
      return response.status(200).json(publisher);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
  }

  async delete(request, response) {
    const { id } = request.params;

    const publisher = await PublishersRepository.remove(id);

    if (!publisher) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    await CampaignService.removePublisher(id);

    return response.status(204).send();
  }
}

module.exports = new PublisherController();
