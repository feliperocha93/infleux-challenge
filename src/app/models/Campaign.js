const mongoose = require('../../database');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ({ path }) => `${path} is required`],
  },
  advertiser_id: {
    type: String,
    validate: {
      validator: (s) => mongoose.isValidObjectId(s),
      message: ({ path }) => `${path} is invalid`,
    },
    required: [true, ({ path }) => `${path} is required`],
  },
  campaign_type: {
    type: String,
    enum: {
      values: ['CPM', 'CPC', 'CPI'],
      message: 'campaign_type is invalid',
    },
    required: [true, ({ path }) => `${path} is required`],
  },
  countries_id: {
    type: Array,
    validate: {
      validator: (a) => a.length > 0 && a.every((i) => mongoose.isValidObjectId(i)),
      message: ({ path }) => `${path} is invalid`,
    },
    required: [true, ({ path }) => `${path} is required`],
  },
  bid: {
    type: mongoose.Decimal128,
    required: [true, ({ path }) => `${path} is required`],
  },
  publishers: {
    type: [
      {
        publisher_id: mongoose.ObjectId,
        publisher_result: Number,
      },
    ],
    default: [],
  },
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;
