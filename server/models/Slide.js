const mongoose = require('mongoose');

const slideSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
        type: String,
        default: 'New Arrival'
    },
    description: {
        type: String, 
        default: 'Shop the collection'
    }
  },
  {
    timestamps: true,
  }
);

const Slide = mongoose.model('Slide', slideSchema);

module.exports = Slide;
