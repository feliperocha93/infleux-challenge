const CampaignsRepository = require('../repositories/CampaignsRepository');
const Campaign = require('../models/Campaign');
const SchemaValidator = require('../utils/SchemaValidator');

class CampaignController {
  async store(request, response) {
    const errors = SchemaValidator.validateAndGetErrors(Campaign, request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const campaign = await CampaignsRepository.create(request.body);
      return response.status(201).json(campaign);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
  }

  async fetch(request, response) {
    const { country_id } = request.query;

    const campaigns = await CampaignsRepository.fetch(country_id);

    return response.json(campaigns);
  }

  async index(request, response) {
    const campaigns = await CampaignsRepository.findAll();

    return response.json(campaigns);
  }

  async show(request, response) {
    const { id } = request.params;

    const campaign = await CampaignsRepository.findById(id);

    if (!campaign) {
      return response.status(404).json({ error: 'campaign not found' });
    }

    return response.json(campaign);
  }

  async filter(request, response) {
    const filter = { ...request.query };

    const campaign = await CampaignsRepository.findByFilter(filter);

    return response.json(campaign);
  }
}

module.exports = new CampaignController();
