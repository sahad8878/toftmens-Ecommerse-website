const bcrypt = require("bcrypt");
const Product = require("../models/product");
const user = require("../models/user");
const User = require("../models/user");
const Cart= require('../models/cart')
const { sendSms, verifySms } = require("../verification/otp");

// home
const homeView = (req, res) => {
  let user = req.session.user;
    Product.find()
    .then((product) => {
      // console.log(product)
      
      res.render("user/home", { product,
      user:user, });
    })
    .catch((err) => {
      console.log(err);
    });
  
  
  // res.render("user/home",
  // {Product:Product,
  //   User:User,
  //   isAuthenticated:req.loggedIn});
};
// Ṃen page
const menView = (req, res) => {
  let user = req.session.user;
  Product.find({category:"Men"})
  .then((product) => {
    console.log(product);
    // console.log(product)
    res.render("user/men", { product,user:user });
  })
  .catch((err) => {
    console.log(err);
  });
  // res.render("user/men", {
  //   Product: Product,
  //   User: User,
  //   isAuthenticated: req.loggedIn,
  // });
};

// women page
const womenView = (req, res) => {
  let user = req.session.user;
  res.render("user/women", {
    Product: Product,
    user:user
  });
};
// aboute page
const aboutView = (req, res) => {
  let user = req.session.user;
  res.render("user/about", {
    Product: Product,
    user:user,
  });
};
// contact page
const contactView = (req, res) => {
  let user = req.session.user;
  res.render("user/contact",{user:user});
};

//get cart page


const cartView =async(req, res) => {
  let ownerId  = req.session.user._id;
    
  // constuser = req.session.user

//  console.log(ownerId);

  const cartItems = await Cart.findOne({ owner: ownerId })
     .populate('items.product')
      .exec((err, allCart) => {
          if (err) {
              return console.log(err);
          }
          res.render('user/cart', { 
            allCart,
             user:req.session.user})
      })

  // res.render("user/cart", {
  //   Product: Product,
  //   user:user,
  // }); 
};

// post cart

const addToCart = async(req, res) => {
  const productId = req.params.id
  let ownerId  = req.session.user._id;
  console.log(ownerId);
  console.log(productId +'its product id');
  const user = await Cart.findOne({ owner:ownerId})
  const product = await Product.findOne({ _id: productId })
  // console.log(product+"its product id");
  const cartTotal = product.price
  if (!user) {
      const addToCart = await Cart({
          owner:ownerId,
          items: [{ product: productId, totalPrice: product.price }],
          cartTotal: cartTotal
      })
      addToCart.save()
          .then(() => {
              res.redirect('/productDetails/' + productId)
          })
  } else {
      const existProduct = await Cart.findOne({ owner: ownerId, 'items.product': productId })
      if (existProduct != null) {
          await Cart.findOneAndUpdate({ owner:ownerId, 'items.product': productId },
              {
                  $inc: {
                      'items.$.quantity': 1,
                      'items.$.totalPrice': product.price,
                      cartTotal: cartTotal
                  }
              })
              .then(() => {
                  res.redirect('/productDetails/' + productId)
              })
      } else {
          const addToCart = await Cart.findOneAndUpdate({ owner:ownerId},
              { $push: { items: { product: productId, totalPrice: product.price } }, $inc: { cartTotal: cartTotal } })
          addToCart.save()
              .then(() => {
                  res.redirect('/productDetails/' + productId)
              })
      }
  }

}

// login
const loginView = (req, res) => {
  res.render("user/login");
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });
    let compare = await bcrypt.compare(password, user.password);
    if (!user) {
      return res.redirect("/login");
    }
    console.log("compare", compare);
    if (!compare) {
      return res.redirect("/login");
    }
    // req.loggedIn=false;
    req.session.loggedIn = true;
    req.session.user=user
    
    return res.redirect("/"), console.log("login succes");
    // req.locals.user=user || null;
  } catch (error) {
    console.log(error.message);
  }
};

// register page
const registerView = (req, res) => {
  res.render("user/register");
};

// register post
const registerUser = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    User.findOne({ email: email }).then(async (user) => {
      if (!user) {
        req.session.user = req.body;
        sendSms(number);
        res.redirect("/otp");
      } else {
        return res.redirect("/login");
      }
    });
  } catch (error) {
    console.log("error");
    console.log(error.message);
  }
};
const postOtp = async (req, res) => {
  const { name, number, email, password } = req.session.user;
  const otp = req.body.otp;
  const phone = number;
  console.log(phone)
  await verifySms(phone, otp).then(async(verification_check) => {
    if (verification_check.status == "approved") {

      const hashPassword= await bcrypt.hash(password,10)
      newUser = User({
        name: name,
        number: number,
        email: email,
        password: hashPassword,
      });
      newUser.save();
      res.redirect("/login");
    } else {
      console.log("otp failed");
    }
  });
};

// logout user
const logoutUser= (req, res) => {
  req.session.destroy();
  res.redirect("/");
};


// products details page
const productDetails = (req, res) => {
  const proId = req.params.id;
  let user = req.session.user;

  Product.findById(proId).then((product) => {
    res.render("user/product_details", { product, proId ,user:user});
  });
};


// otp section
const getOtp = (req, res) => {
  res.render("user/otp");
};

module.exports = {
  homeView,
  menView,
  womenView,
  aboutView,
  contactView,
  cartView,
  loginView,
  loginUser,
  registerView,
  registerUser,
  productDetails,
  getOtp,
  postOtp,
   logoutUser,
   addToCart
};
