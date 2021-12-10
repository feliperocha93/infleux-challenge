const mongoose = require('../../database');

const AdvertiserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  campaigns_id: {
    type: [mongoose.SchemaTypes.ObjectId],
    default: [],
  },
});

const Advertiser = mongoose.model('Advertiser', AdvertiserSchema);

module.exports = Advertiser;
