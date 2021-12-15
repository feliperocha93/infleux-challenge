const AdvertisersRepository = require('../repositories/AdvertisersRepository');

const Advertiser = require('../models/Advertiser');

const SchemaValidator = require('../utils/SchemaValidator');

const AdvertiserService = require('../services/AdvertiserService');

class AdvertiserController {
  async store(request, response) {
    const errors = SchemaValidator.validateAndGetErrors(Advertiser, request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const advertiser = await AdvertisersRepository.create(request.body);
      return response.status(201).json(advertiser);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
  }

  async index(request, response) {
    const advertisers = await AdvertisersRepository.findAll();

    return response.json(advertisers);
  }

  async show(request, response) {
    const { id } = request.params;

    const advertiser = await AdvertisersRepository.findById(id);

    if (!advertiser) {
      return response.status(404).json({ error: 'advertiser not found' });
    }

    return response.json(advertiser);
  }

  async filter(request, response) {
    const filter = { ...request.query };

    const advertiser = await AdvertisersRepository.findByFilter(filter);

    return response.json(advertiser);
  }

  async update(request, response) {
    const { id } = request.params;

    if (Object.prototype.hasOwnProperty.call(request.body, 'campaigns_id')) {
      return response.status(400).json({ error: 'campaigns_id can not be updated' });
    }

    const advertiserExist = await AdvertisersRepository.findById(id);
    if (!advertiserExist) {
      return response.status(404).json({ error: 'advertiser not found' });
    }

    const payload = { ...advertiserExist._doc, ...request.body };
    const errors = SchemaValidator.validateAndGetErrors(Advertiser, payload);
    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const advertiser = await AdvertisersRepository.update(id, payload);
      return response.json(advertiser);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
  }

  async delete(request, response) {
    const { id } = request.params;

    const advertiser = await AdvertisersRepository.remove(id);

    if (!advertiser) {
      return response.status(404).json({ error: 'advertiser not found' });
    }

    await AdvertiserService.deleteAllAdvertiserCampaigns(id);

    return response.status(204).send();
  }
}

module.exports = new AdvertiserController();
