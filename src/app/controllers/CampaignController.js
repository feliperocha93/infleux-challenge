const CampaignsRepository = require('../repositories/CampaignsRepository');
const Campaign = require('../models/Campaign');
const SchemaValidator = require('../utils/SchemaValidator');

class CampaignController {
  async store(request, response) {
    const errors = SchemaValidator.validateAndGetErrors(Campaign, request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    const campaign = await CampaignsRepository.create(request.body);

    return response.status(201).json(campaign);
  }
}

module.exports = new CampaignController();
