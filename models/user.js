var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var User = new mongoose.Schema({
  local: {
    name: {
      type: String
     
    },
    email: {
      type: String
      
    },
    sdt: {
      type: String
      
    },
    password: {
      type: String
      
    },
    diachi: {
      type: String
    
    }
  }


});
User.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// kiểm tra mật khẩu có trùng khớp
User.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};





var ProductDB = mongoose.model('Users', User);
module.exports = ProductDB;
