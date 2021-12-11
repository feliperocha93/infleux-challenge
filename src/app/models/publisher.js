const mongoose = require('../../database');

// TODO: Change require to required;

const PublisherSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  country_id: {
    type: mongoose.SchemaTypes.ObjectId,
    require: true,
  },
  campaigns_id: {
    type: [mongoose.SchemaTypes.ObjectId],
    default: [],
  },
});

const Publisher = mongoose.model('Publisher', PublisherSchema);

module.exports = Publisher;
