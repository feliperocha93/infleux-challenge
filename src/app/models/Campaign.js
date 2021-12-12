const mongoose = require('../../database');
const AdvertisersRepository = require('../repositories/AdvertisersRepository');
const CountriesRepository = require('../repositories/CountriesRepository');

const NotFoundError = require('../errors/NotFoundError');

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
    type: Number,
    validate: {
      validator: (a) => a > 0 && typeof a === 'number',
      message: ({ path }) => `${path} is invalid`,
    },
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

CampaignSchema.pre('save', function cleanPublishers(next) {
  this.publishers = [];
  next();
});

CampaignSchema.pre('save', async function checkAdvertiser(next) {
  const advertiserExist = await AdvertisersRepository.findById(this.advertiser_id);

  if (!advertiserExist) {
    throw new NotFoundError('advertiser_id not found');
  }

  next();
});

CampaignSchema.pre('save', async function checkAdvertiser(next) {
  const errors = [];

  for (const country_id of this.countries_id) {
    const idExist = await CountriesRepository.findById(country_id);

    if (!idExist) {
      errors.push(country_id);
    }
  }

  if (errors.length > 0) {
    throw new NotFoundError(`countries_id [${errors}] not found`);
  }

  next();
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;
