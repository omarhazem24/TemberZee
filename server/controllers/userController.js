const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail, getWishlistTemplate } = require('../utils/emailClient');

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
       // Check if already in wishlist
       if (user.wishlist.includes(productId)) {
           return res.status(400).json({ message: 'Product already in wishlist' });
       }
       
       user.wishlist.push(productId);
       await user.save();

       // Send Wishlist Email
       try {
         const product = await Product.findById(productId);
         if (product) {
           const html = getWishlistTemplate(product, user);
           sendEmail(user.email, `Added to Wishlist: ${product.name}`, html);
         }
       } catch (emailError) {
         console.error('Failed to send wishlist email:', emailError);
       }

       res.json({ message: 'Product added to wishlist' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  const productId = req.params.id;
  
  try {
     const user = await User.findById(req.user._id);
     
     if (user) {
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId.toString()
        );
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
     } else {
        res.status(404);
        throw new Error('User not found');
     }
  } catch (error) {
     // If user cancels during a request (edge case), or other DB error
     res.status(500).json({ message: error.message });
  }
};

// @desc    Check if product in wishlist - Helper for UI
// @route   GET /api/users/wishlist/:id
// @access  Private
const checkInWishlist = async (req, res) => {
     try {
         const user = await User.findById(req.user._id);
         if (!user) { return res.status(404).json('User not found'); }
         
         const exists = user.wishlist.includes(req.params.id);
         res.json({ exists });
     } catch (error) {
         res.status(500).json({ message: error.message });
     }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      address: user.address,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    
    // Address updates
    if (req.body.address) {
        user.address.street = req.body.address.street || user.address.street;
        user.address.city = req.body.address.city || user.address.city;
        user.address.state = req.body.address.state || user.address.state;
        user.address.zip = req.body.address.zip || user.address.zip;
        // Country fixed usually
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      countryCode: updatedUser.countryCode,
      address: updatedUser.address,
      role: updatedUser.role,
      token: req.headers.authorization.split(' ')[1] 
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

module.exports = { 
    getWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    checkInWishlist, 
    getUserProfile, 
    updateUserProfile 
};
