const Campaign = require('../models/Campaign');

class CampaignsRepository {
  async create(payload) {
    const campaign = await Campaign.create(payload);

    return campaign;
  }

  async fetch(country_id) {
    const campaigns = await Campaign.find({ countries_id: [country_id] })
      .sort({ bid: -1 })
      .limit(3);

    return campaigns;
  }

  async findAll() {
    const campaigns = await Campaign.find();

    return campaigns;
  }

  async findById(id) {
    const campaign = await Campaign.findById(id);

    return campaign;
  }

  async findByFilter(filter) {
    const campaign = await Campaign.find(filter);

    return campaign;
  }

  async update(id, payload) {
    const campaign = await Campaign.findByIdAndUpdate(id, payload, { new: true });

    return campaign;
  }

  async remove(id) {
    const campaign = await Campaign.findByIdAndRemove(id);

    return campaign;
  }

  async removeMany(id) {
    const campaign = await Campaign.deleteMany({ advertiser_id: id });

    return campaign;
  }
}

module.exports = new CampaignsRepository();
