const mongoose = require('../../database');

const CampaignsRepository = require('../repositories/CampaignsRepository');
const PublishersRepository = require('../repositories/PublishersRepository');

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

    const nonUpdatableFields = ['advertiser_id', 'publishers'];
    for (const field of nonUpdatableFields) {
      if (Object.prototype.hasOwnProperty.call(request.body, field)) {
        return response.status(400).json({ error: `${field} can not be updated` });
      }
    }

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

  async updatePublishers(request, response) {
    const { id } = request.params;
    const { publisher_result } = request.body;

    const publisher_id = request.body.publisher_id || request.params.publisher_id;

    const ids = [
      { field: 'publisher_id', value: publisher_id },
      { field: 'campaign_id', value: id },
    ];

    for (const { field, value } of ids) {
      if (!mongoose.isValidObjectId(value)) {
        return response.status(400).json({ error: `${field} is invalid` });
      }
    }

    const campaignExist = await CampaignsRepository.findById(id);
    if (!campaignExist) {
      return response.status(404).json({ error: 'campaign not found' });
    }

    const publisherExist = await PublishersRepository.findById(publisher_id);

    if (!publisherExist) {
      return response.status(404).json({ error: 'publisher not found' });
    }

    let publishers;
    switch (request.method) {
      case 'POST':
        publishers = [...campaignExist.publishers, { publisher_id, publisher_result: 0 }];
        await PublishersRepository.update(
          publisher_id,
          { campaigns_id: [...publisherExist._doc.campaigns_id, id] },
        );
        break;
      case 'PUT':
        publishers = campaignExist.publishers.map((publisher) => {
          if (publisher.publisher_id.toString() === publisher_id) {
            publisher.publisher_result = publisher_result;
          }
          return publisher;
        });
        break;
      case 'DELETE':
        publishers = campaignExist.publishers.filter(
          (publisher) => publisher.publisher_id.toString() !== publisher_id,
        );
        await PublishersRepository.update(
          publisher_id,
          {
            campaigns_id: publisherExist._doc.campaigns_id.filter(
              (camp) => camp !== id,
            ),
          },
        );
        break;
      default:
        break;
    }

    const campaign = await CampaignsRepository.update(id, { publishers });

    return response.status(200).json(campaign);
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
