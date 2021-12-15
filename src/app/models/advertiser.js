const mongoose = require('../../database');

const AdvertiserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ({ path }) => `${path} is required`],
  },
  campaigns_id: {
    type: Array,
    validate: {
      validator: (a) => a.every((i) => mongoose.isValidObjectId(i)),
      message: ({ path }) => `${path} is invalid`,
    },
    default: [],
  },
});

AdvertiserSchema.pre('save', function cleanCampaigns(next) {
  this.campaigns_id = [];
  next();
});

const Advertiser = mongoose.model('Advertiser', AdvertiserSchema);

module.exports = Advertiser;
