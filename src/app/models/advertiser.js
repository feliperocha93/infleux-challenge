const mongoose = require('../../database');

// TODO: Change require to required;

const AdvertiserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  campaigns_id: {
    // type: [mongoose.SchemaTypes.ObjectId],
    type: Array,
    default: [],
  },
});

const Advertiser = mongoose.model('Advertiser', AdvertiserSchema);

module.exports = Advertiser;
