const AdvertisersRepository = require('../repositories/AdvertisersRepository');

class AdvertiserService {
  async setCampaign(advertiserId, campaignId) {
    const { campaigns_id } = await AdvertisersRepository.findById(advertiserId);

    campaigns_id.push(campaignId);

    await AdvertisersRepository.update(advertiserId, { campaigns_id });
  }

  async removeCampaign(advertiserId, campaignId) {
    const { campaigns_id } = await AdvertisersRepository.findById(advertiserId);

    const filteredArray = campaigns_id.filter((campaign) => campaign.toString() !== campaignId);

    await AdvertisersRepository.update(advertiserId, { campaigns_id: filteredArray });
  }
}

module.exports = new AdvertiserService();
