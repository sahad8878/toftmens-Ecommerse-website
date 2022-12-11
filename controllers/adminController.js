// const product = require('../models/product');
const Product = require("../models/product");
const User = require("../models/user");
const upload = require("../middlewares/multer");
const bannerImages = require("../middlewares/bannerMulter");
const Category = require("../models/category");
const Order = require("../models/order");
const moment = require("moment");
const Banner = require("../models/banner");

//  login page
const loginView = (req, res) => {
  try {
    if (req.session.adminLogedIn) {
      console.log(req.session.adminLogedIn);
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/login", { adminLoggErr: req.flash("adminLogErr") });
      // req.session.adminLoggErr = false;
    }
  } catch (error) {
    res.render("admin/error");
  }
};

//  admin login
const loginAdmin = (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // console.log(req.body.email,"//",req.body.password);
    if (req.body.email == email && req.body.password == password) {
      req.session.adminLogedIn = true;
      res.redirect("admin/dashboard");
    } else {
      req.flash("adminLogErr", "wrong email or password");
      res.redirect("/admin");
      req.session.adminLoggErr = true;
    }
  } catch (error) {
    res.render("admin/error");
  }
};

//  dashboard page
const dashboardView = (req, res) => {
  try {
    res.render("admin/dashboard");
  } catch (error) {
    res.render("admin/error");
  }
};

//  product view

const prodcutManagememnt = async (req, res) => {
  try {
    let product = await Product.find().sort({ updatedAt: -1 });
    // console.log(product);
    let category = await Category.find();
    res.render("admin/product_management", { product, category });
  } catch (error) {
    res.render("admin/error");
  }
};
// get add product page
const addProduct = async (req, res) => {
  try {
    let category = await Category.find();
    res.render("admin/add_products", {
      category,
      proAddErr: req.flash("proAddErr"),
    });
  } catch (error) {
    res.render("admin/error");
  }
};

// post add product page
const addProductButton = async (req, res) => {
  try {
    const { name, description, category, price, stock, brand } = req.body;

    const img = [];
    req.files.forEach((el) => {
      img.push(el.filename);
    });

    console.log(img);

    if (
      name &&
      description &&
      category &&
      price &&
      stock &&
      img.length > 0 &&
      brand
    ) {
      Object.assign(req.body, {
        imageUrl: img,
        updatedAt: moment().format("MM/DD/YYYY"),
      });

      console.log(req.body);

      const newProduct = await new Product(req.body);
      newProduct
        .save()
        .then((result) => {
          console.log("created product");
          res.redirect("/admin/addProduct");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      req.flash("proAddErr", "fill full coloms");
      res.redirect("/admin/addProduct");
      console.log("fill coloms");
    }
  } catch (error) {
    res.render("admin/error");
  }
};

//  order page
const ordersView = async (req, res) => {
  try {
    let order = await Order.find().sort({ updatedAt: -1 }).populate("userId");
    // console.log(order[0].userId);
    Object.values(order);
    res.render("admin/orders", { order, user: req.session.user });
  } catch (error) {
    res.render("admin/error");
  }
};

// get order details

const getOrderDetails= async(req,res)=>{
  try{
 
 let order = await Order.findOne({_id:req.params.id}).populate("products.product");
console.log(order.products)
 
   res.render('admin/orderDetails',{order})
  } catch (error) {
    res.render("admin/error");
  }
 }
 
//  change order status

const changeTrack= async (req, res) => {
  oid = req.body.orderId;
  value = req.body.value;

  console.log(oid, value, 'lllll');

  if (value == 'Delivered') {
    await Order.updateOne(
      {
        _id: oid,
      },
      {
        $set: {
          track: value,
          orderStatus: value,
          paymentStatus: 'Payment Completed',
        },
      }
    ).then((response) => {
      // console.log(response);
      res.json({ status: true });

    });
  } else {
    await Order.updateOne(
      {
        _id: oid,
      },
      {
        $set: {
          track: value,
          orderStatus: value,
        },
      }
    ).then((response) => {
      // console.log(result);
      res.json({ status: true });
    });
  }

}

//  client  page
const clientView = (req, res) => {
  try {
    User.find()
      .sort({ updatedAt: -1 })
      .then((user) => {
        res.render("admin/clients", { user });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    res.render("admin/error");
  }
};

// edit product

const viewEditProduct = (req, res) => {
  try {
    const proId = req.params.id;
    Product.findById(proId).then((product) => {
      res.render("admin/edit_product", {
        product,
        proId,
        proEditErr: req.flash("proEditErr"),
      });
    });
  } catch (error) {
    res.render("admin/error");
  }
};

// edit product
const editProduct = async (req, res) => {
  try {
    var proId = req.params.id;
    const { name, price, description, category, brand, stock } = req.body;
    if (name && price && description && category && brand && stock) {

      if (req.files.length === 0) {
        await Product.findByIdAndUpdate(proId, req.body, {
          upsert: true,
          new: true,
          runValidators: true,
        });
        res.redirect("/admin/product");
      } else {
        var img = [];
        req.files.forEach((el) => {
          img.push(el.filename);
        });
        console.log(img + "elseeeeeeeeeeeeeeeee");

        Object.assign(req.body, {
          imageUrl: img,
          updatedAt: moment().format("MM/DD/YYYY"),
        });
        await Product.findByIdAndUpdate(proId, req.body, {
          upsert: true,
          new: true,
          runValidators: true,
        });
        console.log("updated product");
        res.redirect("/admin/product");
      }
    } else {
      req.flash("proEditErr", "fill the edit coloms");
      res.redirect(`/admin/getEditProduct/${proId}`);
      console.log("fill the edit coloms");
    }
  } catch (error) {
    res.render("admin/error");
  }
};

// delete product
const deleteProduct = (req, res) => {
  try {
    const proId = req.params.id;
    console.log(proId);
    Product.findByIdAndRemove(proId).then((product) => {
      console.log("product deleted");
      res.redirect("/admin/product");
    });
  } catch (error) {
    res.render("admin/error");
  }
};
// log out
const logoutButton = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    res.render("admin/error");
  }
};

// block user
const blockUser = (req, res) => {
  try{
  const userId = req.params.id;
  // console.log(userId)
  User.findByIdAndUpdate(userId, { access: false }, (err, data) => {
    if (err) {
      console.log(err);
      res.render("admin/error");
    } else {
      res.redirect("/admin/clients");
    }
  });
} catch (error) {
  res.render("admin/error");
}
};

// unBlock  User
const unBlockUser = (req, res) => {
  try{
  const userId = req.params.id;
  console.log(userId);
  User.findByIdAndUpdate(userId, { access: true }, (err, data) => {
    if (err) {
      console.log(err);
      res.render("admin/error");
    } else {
      res.redirect("/admin/clients");
    }
  });
} catch (error) {
  res.render("admin/error");
}
};

// Category page
const getCategory = async (req, res) => {
  try {
    let category = await Category.find().sort({ updatedAt: -1 });
console.log(category);
    res.render("admin/category", { category });
  } catch (error) {
    res.render("admin/error");
  }
};

// add get  category
const getAddCategory = (req, res) => {
  try {
    res.render("admin/add_category", {
      catAddErr: req.flash("catAddErr"),
      catExistErr: req.flash("catExistErr"),
    });
  } catch (error) {
    res.render("admin/error");
  }
};

// add post  category
const postAddCategory = async (req, res) => {
  try {
   
    const imageUrl = req.files;
    const reqCategory = req.body.category;
    if (reqCategory && imageUrl) {
      let regExp=new RegExp(reqCategory,'i')
      console.log(reqCategory , " reqqqqqq");
      let dbCategory = await Category.findOne({ category: {$regex:regExp}});
      
      console.log(dbCategory);
      if (!dbCategory) {
          
    
        Object.assign(req.body, { imageUrl: req.files });
        const newCategory = await new Category(req.body);
        await newCategory
          .save()
          .then((result) => {
            console.log("created category");
            res.redirect("/admin/addCategory");
          })
          .catch((err) => {
            console.log(err);
          });
        
      } else {
        req.flash("catExistErr", "Category already exists");
        res.redirect("/admin/addCategory");
        console.log("allready exist");
      }
    } else {
      req.flash("catAddErr", "Fill full coloms");
      res.redirect("/admin/addCategory");
    }
  } catch (error) {
    res.render("admin/error");
  }
};

// delete Category
const deleteCategory = (req, res) => {
  try {
    const proId = req.params.id;
    console.log(proId);
    Category.findByIdAndRemove(proId).then((category) => {
      console.log("category deleted");
      res.redirect("/admin/category");
    });
  } catch (error) {
    res.render("admin/error");
  }
};

// get banner page
const getBanner =async (req, res) => {
try{
  let banner = await Banner.find({ delete: { $ne: true } }).sort({ updatedAt: -1 });
  res.render("admin/bannerManagment",{banner});
} catch (error) {
  res.render("admin/error");
}
}
// get add banner
const getAddBanner = (req, res) => {
  try{
  res.render("admin/add_banner",{bannerAddErr: req.flash("bannerAddErr")});
} catch (error) {
  res.render("admin/error");
}
}

// post add  banner
const postAddBanner = async(req, res) => {
  try{
const imageUrl = req.files;
const { description,head1,head2,head3,route } = req.body;
if( description&&head1&&head2&&head3&&route&&imageUrl){

  Object.assign(req.body, { imageUrl:req.files });
const newBanner =await new Banner(req.body);
await newBanner.save().then((result) => {

  res.redirect('/admin/banner');
});
}else{
  console.log("fill the banner coloms");
  req.flash("bannerAddErr", "Fill full coloms");
  res.redirect('/admin/addBanner')
}
} catch (error) {
  res.render("admin/error");
}
}

// delete banner
const deleteBanner=async(req,res)=>{
try{
  const id = req.query.id;
  const deleteBanner = await Banner.findOneAndUpdate(
    { _id: id },
    { $set: { delete: true } }
  );
  console.log(deleteBanner);
  deleteBanner.save().then(() => {
    res.json('success')
  });
} catch (error) {
  res.render("admin/error");
}
}


// error page
const errorPage = (req, res) => {
  res.render("admin/error");
};

module.exports = {
  loginView,
  loginAdmin,
  dashboardView,
  addProduct,
  addProductButton,
  prodcutManagememnt,
  ordersView,
  clientView,
  viewEditProduct,
  editProduct,
  deleteProduct,
  logoutButton,
  blockUser,
  unBlockUser,
  errorPage,
  getCategory,
  getAddCategory,
  postAddCategory,
   deleteCategory,
   getBanner,
   getAddBanner,
   postAddBanner,
   deleteBanner,
   getOrderDetails,
   changeTrack

};
