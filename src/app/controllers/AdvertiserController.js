const AdvertisersRepository = require('../repositories/AdvertisersRepository');

class AdvertiserController {
  async store(request, response) {
    const { name } = request.body;

    if (!name) {
      return response.status(400).json({ error: 'name is required' });
    }

    const advertiser = await AdvertisersRepository.create({ name });

    return response.status(201).json(advertiser);
  }
}

module.exports = new AdvertiserController();
