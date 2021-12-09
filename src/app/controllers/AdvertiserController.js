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

  async index(request, response) {
    const advertisers = await AdvertisersRepository.findAll();

    return response.json(advertisers);
  }

  async show(request, response) {
    const { id } = request.params;

    const advertiser = await AdvertisersRepository.findById(id);

    if (!advertiser) {
      return response.status(404).json({ error: 'advertiser not found' });
    }

    return response.json(advertiser);
  }

  async filter(request, response) {
    const filter = { ...request.query };

    const advertiser = await AdvertisersRepository.findByFilter(filter);

    return response.json(advertiser);
  }
}

module.exports = new AdvertiserController();
