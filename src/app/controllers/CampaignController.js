/* eslint-disable no-underscore-dangle */
const CampaignsRepository = require('../repositories/CampaignsRepository');
const Campaign = require('../models/Campaign');
const SchemaValidator = require('../utils/SchemaValidator');

const AdvertiserService = require('../services/AdvertiserService');

class CampaignController {
  async store(request, response) {
    const errors = SchemaValidator.validateAndGetErrors(Campaign, request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const campaign = await CampaignsRepository.create(request.body);
      await AdvertiserService.setCampaign(request.body.advertiser_id, campaign._id.toString());
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

  async update(request, response) {
    const { id } = request.params;

    const campaignExist = await CampaignsRepository.findById(id);

    if (!campaignExist) {
      return response.status(404).json({ error: 'campaign not found' });
    }

    const payload = { ...campaignExist._doc, ...request.body };

    const errors = SchemaValidator.validateAndGetErrors(Campaign, payload);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    try {
      const campaign = await CampaignsRepository.update(id, payload);
      return response.status(200).json(campaign);
    } catch ({ message, status }) {
      return response.status(status).json({ message });
    }
  }

  async delete(request, response) {
    const { id } = request.params;

    const campaign = await CampaignsRepository.remove(id);

    if (!campaign) {
      return response.status(404).json({ error: 'campaign not found' });
    }

    await AdvertiserService.removeCampaign(campaign.advertiser_id.toString(), id);

    return response.status(204).send();
  }
}

module.exports = new CampaignController();
