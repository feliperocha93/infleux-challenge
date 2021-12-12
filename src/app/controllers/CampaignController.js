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
}

module.exports = new CampaignController();
