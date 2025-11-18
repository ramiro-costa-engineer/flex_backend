const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

router.post('/signin', managerController.signIn);
router.post('/approve', managerController.approveReviews);
router.post('/password', managerController.updatePassword);

module.exports = router;
