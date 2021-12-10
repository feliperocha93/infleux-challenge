const { Router } = require('express');

const AdvertiserController = require('./app/controllers/AdvertiserController');
const PublisherController = require('./app/controllers/PublisherController');

const router = Router();

router.post('/advertisers', AdvertiserController.store);
router.get('/advertisers/filter', AdvertiserController.filter);
router.get('/advertisers/:id', AdvertiserController.show);
router.get('/advertisers', AdvertiserController.index);
router.put('/advertisers/:id', AdvertiserController.update);
router.delete('/advertisers/:id', AdvertiserController.delete);

router.post('/publishers', PublisherController.store);

module.exports = router;
