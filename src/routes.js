const { Router } = require('express');

const CountryController = require('./app/controllers/CountryController');
const AdvertiserController = require('./app/controllers/AdvertiserController');
const PublisherController = require('./app/controllers/PublisherController');

const router = Router();

router.get('/countries', CountryController.index);

router.post('/advertisers', AdvertiserController.store);
router.get('/advertisers/filter', AdvertiserController.filter);
router.get('/advertisers/:id', AdvertiserController.show);
router.get('/advertisers', AdvertiserController.index);
router.put('/advertisers/:id', AdvertiserController.update);
router.delete('/advertisers/:id', AdvertiserController.delete);

router.post('/publishers', PublisherController.store);
router.get('/publishers/filter', PublisherController.filter);
router.get('/publishers/:id', PublisherController.show);
router.get('/publishers', PublisherController.index);

router.delete('/publishers/:id', PublisherController.delete);

module.exports = router;
