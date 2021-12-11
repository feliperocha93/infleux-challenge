const Publisher = require('../models/publisher');

class PublishersRepository {
  async create(payload) {
    const publisher = await Publisher.create(payload);

    return publisher;
  }

  async findAll() {
    const publishers = await Publisher.find();

    return publishers;
  }

  async findById(id) {
    const publisher = await Publisher.findById(id);

    return publisher;
  }

  async findByFilter(filter) {
    const publisher = await Publisher.find(filter);

    return publisher;
  }
}

module.exports = new PublishersRepository();
