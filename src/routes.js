const { Router } = require('express');

const AdvertiserController = require('./app/controllers/AdvertiserController');

const router = Router();

router.post('/advertisers', AdvertiserController.store);
router.get('/advertisers/filter', AdvertiserController.filter);
router.get('/advertisers/:id', AdvertiserController.show);
router.get('/advertisers', AdvertiserController.index);

module.exports = router;
