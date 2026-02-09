const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  const { code, discountPercentage } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code,
      discountPercentage,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
    const { code } = req.body;
    try {
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (coupon) {
            res.json({ 
                _id: coupon._id,
                code: coupon.code,
                discountPercentage: coupon.discountPercentage
            });
        } else {
            res.status(404);
            throw new Error('Invalid or expired coupon');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getCoupons, createCoupon, deleteCoupon, validateCoupon };
