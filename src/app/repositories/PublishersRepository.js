const Publisher = require('../models/publisher');

class PublishersRepository {
  async create(payload) {
    const publisher = await Publisher.create(payload);

    return publisher;
  }
}

module.exports = new PublishersRepository();
