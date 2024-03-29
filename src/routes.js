const { Router } = require('express');

const AdvertiserController = require('./app/controllers/AdvertiserController');
const CampaignController = require('./app/controllers/CampaignController');
const CountryController = require('./app/controllers/CountryController');
const PublisherController = require('./app/controllers/PublisherController');

const router = Router();

router.post('/advertisers', AdvertiserController.store);
router.get('/advertisers/filter', AdvertiserController.filter);
router.get('/advertisers/:id', AdvertiserController.show);
router.get('/advertisers', AdvertiserController.index);
router.put('/advertisers/:id', AdvertiserController.update);
router.delete('/advertisers/:id', AdvertiserController.delete);

router.post('/campaigns/:id/publishers', CampaignController.updatePublishers);
router.post('/campaigns', CampaignController.store);
router.get('/campaigns/fetch', CampaignController.fetch);
router.get('/campaigns/filter', CampaignController.filter);
router.get('/campaigns/:id', CampaignController.show);
router.get('/campaigns', CampaignController.index);
router.put('/campaigns/:id/publishers', CampaignController.updatePublishers);
router.put('/campaigns/:id', CampaignController.update);
router.delete('/campaigns/:id/publishers/:publisher_id', CampaignController.updatePublishers);
router.delete('/campaigns/:id', CampaignController.delete);

router.get('/countries', CountryController.index);

router.post('/publishers', PublisherController.store);
router.get('/publishers/filter', PublisherController.filter);
router.get('/publishers/:id', PublisherController.show);
router.get('/publishers', PublisherController.index);
router.put('/publishers/:id', PublisherController.update);
router.delete('/publishers/:id', PublisherController.delete);

module.exports = router;
