var mongoose = require('mongoose');



var bill = new mongoose.Schema({
    tongtien:{
        type: String
    },
    mail: {
        type: String
    },
    nameKH: {
        type: String
    },
    sdtKH:{
        type: String
    },
    cart:{
        type: Object
    }

});

var ProductDB = mongoose.model('Bill', bill);
module.exports = ProductDB;