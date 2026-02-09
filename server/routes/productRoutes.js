const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductSale,
  createProductReview,
  getTopProducts,
  getAllReviewsAdmin
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/top', getTopProducts);
router.get('/admin/allreviews', protect, admin, getAllReviewsAdmin);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/sale').put(protect, admin, updateProductSale);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

module.exports = router;
