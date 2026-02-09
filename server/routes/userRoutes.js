const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    checkInWishlist, 
    getUserProfile, 
    updateUserProfile 
} = require('../controllers/userController');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/wishlist').get(protect, getWishlist).post(protect, addToWishlist);
router.route('/wishlist/:id').delete(protect, removeFromWishlist).get(protect, checkInWishlist);

module.exports = router;
