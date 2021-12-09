const Advertiser = require('../models/advertiser');

class AdvertisersRepository {
  async create(payload) {
    const advertiser = await Advertiser.create(payload);

    return advertiser;
  }

  async findAll() {
    const advertisers = await Advertiser.find();

    return advertisers;
  }

  async findById(id) {
    const advertiser = await Advertiser.findById(id);

    return advertiser;
  }

  async findByFilter(filter) {
    const advertiser = await Advertiser.find(filter);

    return advertiser;
  }

  async update(id, payload) {
    const advertiser = await Advertiser.findByIdAndUpdate(id, payload, { new: true });

    return advertiser;
  }
}

module.exports = new AdvertisersRepository();
