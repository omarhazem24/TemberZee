const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check sale status
      if (product.isSaleActive) {
          if (product.saleLimit > 0 && product.saleSold >= product.saleLimit) {
              // Sale limit reached
              product.price = product.price; // keep original
              // Ideally update DB here to turn off sale, but doing it on read is safe enough for display
              // For cleaner logic, controller might just return the 'current' price
          } else {
              // Apply sale logic for view? No, client should see original and sale price
          }
      }
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product sale
// @route   PUT /api/products/:id/sale
// @access  Private/Admin
const updateProductSale = async (req, res) => {
    const { salePrice, saleLimit, isSaleActive } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.salePrice = salePrice;
            product.saleLimit = saleLimit;
            product.isSaleActive = isSaleActive;
            product.saleSold = 0; // Reset sold count for new sale

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, colors, sizes, countInStock } = req.body;

    const product = new Product({
      name,
      price,
      user: req.user._id,
      image,
      images,
      colors,
      sizes,
      countInStock,
      description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne(); // Use deleteOne() as remove() is deprecated
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, colors, sizes, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.images = images || product.images;
      product.colors = colors || product.colors;
      product.sizes = sizes || product.sizes;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
      }

      const review = {
        name: req.user.firstName + ' ' + req.user.lastName,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
      const products = await Product.find({}).sort({ rating: -1 }).limit(5);
      res.json(products);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for admin
// @route   GET /api/products/admin/allreviews
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Product.aggregate([
            { $unwind: '$reviews' },
            { $project: {
                year: { $year: "$reviews.createdAt" }, // For testing
                productName: '$name',
                productId: '$_id',
                productImage: '$image',
                userName: '$reviews.name',
                rating: '$reviews.rating',
                comment: '$reviews.comment',
                createdAt: '$reviews.createdAt',
                reviewId: '$reviews._id'
            }},
            { $sort: { createdAt: -1 }} 
        ]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductSale,
  createProductReview,
  getTopProducts,
  getAllReviewsAdmin
};
