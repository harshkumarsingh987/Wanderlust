
const express = require("express");
const project = express();
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");  // Use PascalCase for the model name
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");  
const asyncHandler = require('express-async-handler');

 const Review =require("./model/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

project.set("view engine", "ejs");
project.set("views", path.join(__dirname, "views"));
project.use(express.urlencoded({ extended: true }));
project.use(methodOverride("_method"));
project.engine('ejs', ejsMate);
project.use(express.static(path.join(__dirname,"/public")));

project.get("/", (req, res) => {
  res.send("hi am root");
});
// index route 
project.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/app", { allListings });  // No leading slash and no .ejs extension
});

//new route
project.get("/listings/new",(req,res)=>{
  res.render("listings/new")
});

// Show route
project.get("/listings/:id", async (req, res) => {
  let { id} = req.params;
  const allListings = await Listing.findById(id).populate("reviews");  // Use a different variable name to avoid confusion
  if (!Listing) {
    return res.status(404).send("Listing not found");
  }

  // Set a default price if it is null or undefined
  if (Listing.price == null) {
    Listing.price = 0;
  }
  res.render("listings/show", {allListings });  // No .ejs extension
});

// create route

 project.post("/listings",async(req,res)=>{

  const newlisting= new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");

 
 });
 project.post("/listings",async(req,res)=>{
  var name = req.body.name;
 var image =req.body.image;
 var newlisting = {name: name,image : image};
  var newlisting= new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");
 
 });
 
 //Edit Route 
 project.get("/listings/:id/edit",async(req,res)=>{
  let { id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit",{listing});
 });

 //Update Route
 project.put("/listings/:id",async(req,res)=>{
  let{id}= req.params;

  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
 });

 // Delete Route
 project.delete("/listings/:id",async(req,res)=>{
  let{id}= req.params;

  let DeleteListing =await Listing.findByIdAndDelete(id);
  console.log(DeleteListing);
  res.redirect("/listings");
 });
 // reviews post route
 project.post("/listings/:id/reviews", async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    
    // If listing is not found, return an error
    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);




    
    // Ensure reviews array exists before pushing
    if (!listing.reviews) {
      listing.reviews = [];
    }
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();

    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).send("Internal Server Error");
  }
});

//Delete Review Route 
project.delete(
  "/listings/:id/reviews/:reviewId",
  asyncHandler(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`); // ✅ Corrected path
  })
);

project.listen(8080, () => {
  console.log("server is started");
});
