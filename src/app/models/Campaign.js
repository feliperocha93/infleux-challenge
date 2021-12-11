const mongoose = require('../../database');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  advertiser_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'advertiser_id is required'],
  },
  campaign_type: {
    type: String,
    enum: ['CPM', 'CPC', 'CPI'],
    required: [true, 'campaign_type is required'],

  },
  countries_id: {
    type: [mongoose.SchemaTypes.ObjectId],
    required: [true, 'countries_id is required'],

  },
  bid: {
    type: mongoose.Decimal128,
    required: [true, 'bid is required'],

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
