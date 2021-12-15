const mongoose = require('../../database');

const CampaignsRepository = require('../repositories/CampaignsRepository');

class CampaignService {
  async removePublisher(publisherId) {
    const campaigns = await CampaignsRepository.findByFilter({ 'publishers.publisher_id': new mongoose.Types.ObjectId(publisherId) });

    for (const campaign of campaigns) {
      const publishers = campaign.publishers.filter(
        (publisher) => publisher.publisher_id.toString() !== publisherId,
      );
      await CampaignsRepository.update(campaign._id.toString(), { publishers });
    }
  }
}

module.exports = new CampaignService();
