const { Router } = require('express');

const AdvertiserController = require('./app/controllers/AdvertiserController');

const router = Router();

router.post('/advertisers', AdvertiserController.store);

module.exports = router;
