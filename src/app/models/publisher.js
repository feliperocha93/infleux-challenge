const mongoose = require('../../database');

const PublisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ({ path }) => `${path} is required`],
  },
  country_id: {
    type: String,
    validate: {
      validator: (s) => mongoose.isValidObjectId(s),
      message: ({ path }) => `${path} is invalid`,
    },
    required: [true, ({ path }) => `${path} is required`],
  },
  campaigns_id: {
    type: Array,
    validate: {
      validator: (a) => a.every((i) => mongoose.isValidObjectId(i)),
      message: ({ path }) => `${path} is invalid`,
    },
    required: [true, ({ path }) => `${path} is required`],
  },
});

PublisherSchema.pre('save', function cleanCampaigns(next) {
  this.campaigns_id = [];
  next();
});

const Publisher = mongoose.model('Publisher', PublisherSchema);

module.exports = Publisher;
