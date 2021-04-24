const path = require('path');
const express = require('express');

const adminCon = require('../controllers/admin');
const auctionCon = require('../controllers/auction');

const router = express.Router();


router.get('/login-screen', adminCon.get_login);
router.post('/login-screen', adminCon.post_login);
router.get('/signup-screen', adminCon.get_signup);
router.post('/signup-screen', adminCon.post_signup);

router.get('/home-screen', adminCon.get_home_screen);
router.post('/home-screen', adminCon.post_home_screen_search);

router.post('/messages',adminCon.viewMessages);
router.post('/add-product',adminCon.post_add_product);
router.get('/add-product',adminCon.get_add_product);
router.get('/view-myproducts',adminCon.get_view_my_products);

router.post('/results-switch-page',adminCon.post_results_switch_page);
router.post('/update-balance',adminCon.post_update_balance);
router.post('/product-details',adminCon.get_product_details);
router.post('/product-details-buy',adminCon.get_product_details_buy);
router.post('/product-details-confirm-delivery',adminCon.get_product_details_confirm_delivery);
router.post('/product-details-delete-product',adminCon.get_product_details_delete_product);
router.post('/product-details-update-status',adminCon.get_product_details_update_status);



router.post('/auction-product-details', auctionCon.auction_get_product_details);
router.post('/auction-product-details-place-bid', auctionCon.auction_place_bid);
router.post('/auction-product-details-close-bidding', auctionCon.auction_close_bidding);
router.post('/auction-product-details-delete-product', auctionCon.auction_delete_product);
router.post('/auction-update-status', auctionCon.auction_update_status);
router.post('/auction-confirm-delivery', auctionCon.auction_confirm_delivery);


router.get('/logout', adminCon.get_logout);

// router.get('/prods',adminCon.get_products);



module.exports = router;