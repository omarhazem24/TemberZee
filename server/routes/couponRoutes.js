const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getCoupons, createCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/validate').post(protect, validateCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);

module.exports = router;
