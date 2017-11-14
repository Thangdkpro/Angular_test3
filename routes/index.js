var express = require('express');
var Product = require('../models/product.js');
var Cart = require('../models/cart');
var Fuse = require('fuse.js')
var _ = require("underscore");

const bcrypt = require('bcryptjs');
const passport = require('passport');

let user = require('../models/user');
var Bill = require('../models/bill.js')


var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage }).single('uploadfile');

module.exports = function (app, passport) {
  //--------------------------------
  app.get('/register', function (req, res) {
    res.render('register.ejs', { message: req.flash('signupMessage') });
  });
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });
  app.post('/login', function (req, res, next) {

    passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  })
  app.post('/register', function (req, res, next) {
    passport.authenticate('local-signup', {
      successRedirect: '/login',
      failureRedirect: '/register',
      failureFlash: true
    })(req, res, next);
  })

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/login');
  }
  //--------------------------------
  app.get('/new_product', function (req, res) {
    res.render('products.ejs')
  });



  app.get('/', function (req, res) {
    var User =req.user;
    //res.send(User)
    var options = {
      keys: ['name']
    }

    Product.find(function (err, products) {
      var fuse = new Fuse(products, options);
      var results;

      if (req.query) {
        results = req.query['name'] ? fuse.search(req.query['name']) : products;
        if (req.query['begin_price'] && req.query['end_price']) {
          results = _.filter(results, function (p) { return p.price > req.query['begin_price'] && p.price < req.query['end_price'] })
        }
      }
      else {
        results = products
      }


      var perPage = 2 // mỗi trang có 2 product 
      var page = req.params.page || 1 // bắt đầu từ trang 1

      Product
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function (err, products) {
          Product.count().exec(function (err, count) {
            if (err) return next(err)
            res.render('index.ejs', {
              'User':User,
              results,
              products: products,
              current: page,
              pages: Math.ceil(count / perPage)
            })
          })
        })

    })
  });



  app.get('/add/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.find(function (err, products) {
      var product = products.filter(function (item) {
        return item.id == productId;
      });
      cart.add(product[0], productId);
      req.session.cart = cart;
      res.redirect('/');
    })
  })

  app.get('/cart', function (req, res, next) {
    if (!req.session.cart) {
      return res.render('cart.ejs', {
        products: null
      });
    }
    var cart = new Cart(req.session.cart);
    res.render('cart.ejs', {
      products: cart.getItems(), price: cart.price
    });
  })




  app.post('/add_product', urlencodeParser, function (req, res) {
    upload(req, res, function (err) {
      if (err) {
        res.send("loi");
      } else {
        if (req.file == undefined) {
          var loi = "File chua duoc chon";
          res.render('products.ejs', { message: loi });
        }
        else {
          var newProduct = new Product();
          newProduct.name = req.body.name;
          newProduct.description = req.body.description;
          newProduct.price = req.body.price;
          newProduct.image = req.file.originalname;
          
          var result = "";

          newProduct.save(function (err) {
            if (err) {
                result = err.message;
                res.render('products.ejs', { message: result });
                //res.send({ message: err.errors.name.message })
              
            }
            else {
              res.redirect('/');
            }

          })

        }
      }
    })
  })

  app.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.remove(productId);
    req.session.cart = cart;
    res.redirect('/cart');
  });

  app.get('/clear', function (req, res, next) {
    req.session.cart = {};
    res.redirect('/cart');
  })
  app.get('/dathang',isLoggedIn,function(req,res){
    var User =req.user;
    var cart = new Cart(req.session.cart);

    res.render('bill.ejs', 
    {'User':User,
    products: cart.getItems(), 
    price: cart.price})

  })
  app.post('/dathang',isLoggedIn,function(req,res){
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var data= cart.getItems();
    
    var bill = new Bill({
      nameKH : req.body.name,
      mail : req.body.mail,
      cart :data,
      sdtKH : req.body.sdt,
      tongtien : req.body.tongtien
    })
    bill.save(function (err) {
        req.session.cart = {items: {}};
        res.redirect('/');
    })

  })
}

