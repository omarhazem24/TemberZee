const Slide = require('../models/Slide');

// @desc    Get all slides
// @route   GET /api/slides
// @access  Public
const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find({});
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a slide
// @route   POST /api/slides
// @access  Private/Admin
const createSlide = async (req, res) => {
  const { image, title, description } = req.body;

  try {
    const slide = new Slide({
      image,
      title,
      description
    });

    const createdSlide = await slide.save();
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a slide
// @route   DELETE /api/slides/:id
// @access  Private/Admin
const deleteSlide = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);

    if (slide) {
      await slide.deleteOne();
      res.json({ message: 'Slide removed' });
    } else {
      res.status(404);
      throw new Error('Slide not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSlides, createSlide, deleteSlide };
