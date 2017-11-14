var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: function(v){
        return /^[a-zA-Z0-9 ]+$/.test(v) && v.length > 5 && v.length < 1000
      },
      message: 'name is onlu accept letter and number (A-Z,0-9), length must be between 5 and 100'
    }
  },
  description: {
    type: String,
    validate: {
      validator: function(v){
        return v.length > 0 && v.length<50
      },
      message: 'description length must be between 0 and 50'
    }

  } ,
  price: {
    type: Number,
    validate: {
      validator: function(v){
        return v > 0
      },
      message: 'price must be greater than zero'
    }
  },
  image: {
    type: String
  }

});

var ProductDB = mongoose.model('products', productSchema);
module.exports = ProductDB;
