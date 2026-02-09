const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getSlides, createSlide, deleteSlide } = require('../controllers/slideController');

router.route('/').get(getSlides).post(protect, admin, createSlide);
router.route('/:id').delete(protect, admin, deleteSlide);

module.exports = router;
