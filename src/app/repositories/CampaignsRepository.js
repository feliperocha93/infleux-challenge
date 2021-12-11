const Campaign = require('../models/Campaign');

class CampaignsRepository {
  async create(payload) {
    const campaign = await Campaign.create(payload);

    return campaign;
  }
}

module.exports = new CampaignsRepository();
