const Advertiser = require('../models/advertiser');

class AdvertisersRepository {
  async create(payload) {
    const advertiser = await Advertiser.create(payload);

    return advertiser;
  }
}

module.exports = new AdvertisersRepository();
