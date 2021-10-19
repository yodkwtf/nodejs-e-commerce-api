const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

// * CREATE REVIEW
const createReview = async (req, res) => {
  // check for the product for rating
  const { product: productId } = req.body;

  // check if product exists, err if it doesnt
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw CustomError.NotFoundError(`No product with id : ${id}`);
  }

  // check if user already left a review, err if he didnt
  const reviewAlreadyExist = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (reviewAlreadyExist) {
    throw new CustomError.BadRequestError(
      'Already submitted a review for the product'
    );
  }

  // attach the user who rates
  req.body.user = req.user.userId;

  // create a review
  const review = await Review.create(req.body);

  // send review as response
  res.status(StatusCodes.CREATED).json({ review });
};

// * GET ALL REVIEWS
const getAllReviews = async (req, res) => {
  // get all reviews
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name',
    });

  // send back the response
  res.status(StatusCodes.CREATED).json({ reviews, count: reviews.length });
};

// * GET SINGLE REVIEW
const getSingleReview = async (req, res) => {
  // get single review id
  const { id: reviewId } = req.params;

  // get single review
  const review = await Review.findOne({ _id: reviewId });

  // if review isnt found
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id :${reviewId}`);
  }

  // send back the response
  res.status(StatusCodes.OK).json({ review });
};

// * UPDATE REVIEW
const updateReview = async (req, res) => {
  // get review id
  const { id: reviewId } = req.params;

  // get update review details
  const { rating, title, comment } = req.body;

  // find single review
  const review = await Review.findOne({ _id: reviewId });
  // if review isnt found
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id :${reviewId}`);
  }

  // check user is only requesting to update own review
  checkPermissions(req.user, review.user);

  // update review
  review.rating = rating;
  review.title = title;
  review.comment = comment;

  // save it
  await review.save();

  // send the response
  res.status(StatusCodes.OK).json({ review });
};

// * DELETE REVIEW
const deleteReview = async (req, res) => {
  // get single review id
  const { id: reviewId } = req.params;

  // find single review
  const review = await Review.findOne({ _id: reviewId });

  // if review isnt found
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id :${reviewId}`);
  }

  // check user is only requesting his own review
  checkPermissions(req.user, review.user);

  // remove the review
  await review.remove();

  // send the response
  res.status(StatusCodes.OK).json({ msg: 'Success! Review deleted.' });
};

// * GET SINGLE PRODUCT REVIEWS
const getSingleProductReviews = async (req, res) => {
  // get the product's id
  const { id: productId } = req.params;

  // get all reviews for the product
  const reviews = await Review.find({ product: productId });

  // send response
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
