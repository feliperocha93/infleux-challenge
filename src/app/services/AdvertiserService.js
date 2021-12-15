const AdvertisersRepository = require('../repositories/AdvertisersRepository');
const CampaignsRepository = require('../repositories/CampaignsRepository');

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

  async deleteAllAdvertiserCampaigns(advertiserId) {
    await CampaignsRepository.removeMany(advertiserId);
  }
}

module.exports = new AdvertiserService();
