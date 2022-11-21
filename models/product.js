const mongoose = require("mongoose");
const { schema } = require("./user");
const moment= require('moment')

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { 
    type: String, 
    required: true },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: Array,
    required: true,

  },
  description: {
    type: String,
  },
  date: {
    type: String,
    default:Date.now
  },
  brand: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    
  },


//   userId:{
//       type:Schema.Types.ObjectId,
//       ref: "user",
//       required:true
//   }
});

module.exports  = mongoose.model("Products", productSchema);

