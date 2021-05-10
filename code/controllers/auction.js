const Login = require('../models/Login');
const Search = require('../models/Search');
const Product = require('../models/Product');
const Auction_Product = require('../models/Auction_Product');
const { encrypt, get_timestamp } = require('../utils/crypto');
const { use } = require('../routes/admin');
const { rawListeners } = require('../utils/database');
const { Navigator } = require("node-navigator");
const navigator = new Navigator();

const alert = require('alert');

const Message = require('../models/Message');

var Cookies = require('cookies');

var keys = ['secret key']


exports.auction_get_product_details = (req,res,next) => {// auction item product details are displayed

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {
        

        console.log(product_id);
        console.log(product_type);

        product_viewer = 'buyer';

        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {

                if(auction_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                    
                }

                product_base_price = auction_results.rows[0].price 
                product_status = auction_results.rows[0].status
                product_curent_best_bid = auction_results.rows[0].best_bid 
                product_curent_best_bidder = auction_results.rows[0].best_bidder 
                product_sale_start_time = auction_results.rows[0].start_time
                product_sale_end_time = auction_results.rows[0].close_time
                product_quantity = auction_results.rows[0].quantity

                // console.log(auction_results.rows[0]);

                // product_sale_end_time = auction_results.rows[0].location 


               

                product_object
                    .get_your_bid()
                    .then(your_bid_results => {
                        

                        product_your_bid = 0;

                        product_auto_mode = 'false';

                        product_bid_limit = 0;
                        product_bid_present = 0;

                        if(your_bid_results.rows.length!=0){// if a bid is present the details are fetched
                            product_your_bid = your_bid_results.rows[0].bid_value
                            product_auto_mode = your_bid_results.rows[0].auto_mode
                            product_bid_limit = your_bid_results.rows[0].bid_limit
                            product_bid_present = 1;
    
                        }

                        product_object
                            .get_location(auction_results.rows[0].seller_id)
                            .then(location_results => {


                                product_new_status = product_status;//initialisation
                                if(product_status == 'auctioned'){
                                    product_new_status = 'shipping';
                
                                }
                                else if(product_status == 'shipping'){
                                    product_new_status = 'shipped';
                                    
                                }
                                else if(product_status == 'shipped'){
                                    product_new_status = 'out-for-delivery';
                                    
                                }

                                product_object
                                  .get_distance(currentID,auction_results.rows[0].seller_id)
                                  .then(distance_results => {
                                      
                                    product_distance = Math.round(distance_results.rows[0].distance/1000);//converted  to KM
                                    product_delivery_cost = Math.round(product_distance*auction_results.rows[0].delivery_factor);//rounded off


                                   
                                    product_amount_to_pay = product_your_bid + product_delivery_cost;

      
                                   
                                    product_seller = auction_results.rows[0].seller_id

                                    product_object
                                        .get_seller_name(product_seller)
                                        .then(name_results => {


                                            product_seller_name = name_results.rows[0].name;


        

                                        res.render('admin/auction_product_details', {
                                            pageTitle: 'Product Details',
                                            path: '/auction-product-details',
                                            editing: false,

                                            current_id : currentID,
                                            product_id : product_id,
                                            product_type : product_type,
                                            product_base_price : product_base_price,
                                            product_status : product_status,
                                            product_viewer : product_viewer,
                                            product_curent_best_bid : product_curent_best_bid,
                                            product_curent_best_bidder : product_curent_best_bidder,
                                            product_sale_start_time : product_sale_start_time,
                                            product_sale_end_time : product_sale_end_time,
                                            product_your_bid : product_your_bid,
                                            product_auto_mode : product_auto_mode,
                                            product_bid_limit : product_bid_limit,
                                            product_lat : location_results.rows[0].y,
                                            product_lng : location_results.rows[0].x,
                                            product_seller  : product_seller,
                                            product_new_status : product_new_status,
                                            product_distance  : product_distance,
                                            product_delivery_cost : product_delivery_cost,
                                            message : req.flash('error'),
                                            product_description : auction_results.rows[0].description,
                                            product_name : auction_results.rows[0].name,
                                            product_amount_to_pay : product_amount_to_pay,
                                            product_bid_present : product_bid_present,
                                            product_quantity : product_quantity,
                                            product_seller_name : product_seller_name,
                                            user_name: currentEmail
                                            

                                        });

                                    }).catch(err => console.log(err));

                                }).catch(err => console.log(err));



                            }).catch(err => console.log(err));


                    }).catch(err => console.log(err));
                 
            }).catch(err => console.log(err));

    }

};






exports.auction_place_bid = (req,res,next) => {// function to either place a bid or update it

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;
    const product_your_bid = parseFloat(req.body.your_bid);
    var product_auto_mode = req.body.auto_mode;
    const product_bid_limit = parseFloat(req.body.bid_limit);

    if (product_auto_mode != undefined) {

        product_auto_mode = 'true';

    }
    else{
        product_auto_mode = 'false';
    }

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);

        product_viewer = 'buyer';

        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {

                if(auction_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';

                }

                product_name = auction_results.rows[0].name;


                product_object
                .get_distance(currentID,auction_results.rows[0].seller_id)
                .then(distance_results => {
                    
                  product_distance = Math.round(distance_results.rows[0].distance/1000);//converted  to KM
                  product_delivery_cost = Math.round(product_distance*auction_results.rows[0].delivery_factor);//rounded off




                    product_object
                        .get_your_bid()
                        .then(your_bid_results => {//your_bid_results contains the details of your previous bid

                        
                                previous_bid_value = 0;//initialisation
                                old_on_hold = 0;//initialisation

                                if(your_bid_results.rows.length==0){//if there is no previous bid

                                    old_on_hold = 0;
                                    previous_bid_value = 0;

                                }

                                else if((your_bid_results.rows[0].auto_mode).toString().replace(/\s/g, '') == 'true'){//check if automode is set to true
                                        
                                    previous_bid_value = your_bid_results.rows[0].bid_value
                                    old_on_hold = your_bid_results.rows[0].bid_limit + product_delivery_cost;// since auto mode is true on_hold will be the bid_limit

                                }
                                else{// if auto mode is not true 

                                    previous_bid_value = your_bid_results.rows[0].bid_value
                                    old_on_hold = your_bid_results.rows[0].bid_value + product_delivery_cost;// since auto mode is false on_hold will be the bid_value


                                }

                                new_on_hold = 0;//initialisation
                                check = 1;//initialisation

                                //this part is to get the value of new on-hold-amount
                                if((product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                    // your bid must not be less than your previous bid && product_bid_limit>=product_your_bid for auto-mode
                                    if(product_your_bid<previous_bid_value ||  product_bid_limit<product_your_bid){check = 0;}

                                    console.log("entered auto mode")

                                    
                                        
                                    new_on_hold = product_bid_limit + product_delivery_cost;

                                }
                                else{

                                    new_on_hold = product_your_bid + product_delivery_cost;

                                }

                                console.log(product_auto_mode)

                                console.log(old_on_hold)
                                console.log(new_on_hold)


                                product_object
                                    .get_person_remaining_balance()
                                    .then(remaining_balance => {
                                        

                                        console.log(remaining_balance.rows[0].remaining_balance)
            
                                        //all these conditions have to be satisfied in order to place the bid
                                        if(remaining_balance.rows[0].remaining_balance >= new_on_hold - old_on_hold && new_on_hold>=old_on_hold && check && product_your_bid >= auction_results.rows[0].price){
            
                                            product_object
                                                .increase_on_hold_balance(new_on_hold - old_on_hold)
                                                .then(() => {

                                
                                                        product_object
                                                            .update_bid(product_your_bid,product_auto_mode,product_bid_limit,your_bid_results.rows.length!=0)
                                                            .then(() => {


                                                                if (auction_results.rows[0].best_bid > product_your_bid && (product_auto_mode).toString().replace(/\s/g, '') == 'false'){
                                                                    
                                                                    res.redirect(307,'/auction-product-details');
                                                                    //Do Nothing since auto mode is false and the bid is less than the previous best bid
                                                                }

                                                                //If automode is false and your bid_value is greater than the previous best bid
                                                                else if (auction_results.rows[0].best_bid <= product_your_bid && (product_auto_mode).toString().replace(/\s/g, '') == 'false'){

                                                                    product_object
                                                                    .fetch_maximum_possible_bid(currentID)
                                                                    .then(fetch_maximum_possible_bid_results => {//fetch_maximum_possible_bid gets maximum possible bid other than that of the current bidder


                                                                        new_best_bid = 0
                                                                        if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid < product_your_bid){

                                                                            new_best_bid = product_your_bid



                                                                        }
                                                                        else if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid > product_your_bid){

                                                                            new_best_bid = product_your_bid + 1

                                                                        }
                                                                        else{//If maximum possible and bid_value are same

                                                                            new_best_bid = product_your_bid

                                                                        }

                                                                        //perform best bid and best bidder update
                                                                            product_object
                                                                                .update_best_bid(new_best_bid)
                                                                                .then(() => {

                                                                                product_object
                                                                                    .update_bid_value_for_auto_bids(new_best_bid)//for  updating the bid_values for all the auto bids
                                                                                    .then(() => {

                                                                                        product_object
                                                                                        .update_best_bidder(new_best_bid)// the person having bid value as  new_best_bid  is  the new  best bidder
                                                                                        .then(() => {
                        
                                                                                    
                                                                                            var message = new Message(product_id, currentID, "Bid placed succesfully", "We are glad to inform you that you bid for " + product_name + "placed succesfully. Message sent at " + get_timestamp(), get_timestamp());
                                                                                            message.send_auction_message();
                                                                        
                                                                                            res.redirect(307,'/auction-product-details');
                        
                        
                                                                                        }).catch(err => console.log(err));                                
                                                                                
                                                                                
                                                                                }).catch(err => console.log(err));
                                                                        
                                                                                
                                                                            }).catch(err => console.log(err));
        








                                                                    }).catch(err => console.log(err));


                                                                }

                                                                //If automode is true and your bid_value and bid limit are less than the previous best bid 
                                                                else if(auction_results.rows[0].best_bid > product_your_bid && auction_results.rows[0].best_bid > product_bid_limit && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                                                    //In this case we  set the bid_value of the current bid to bid_limit
                                                                    product_object
                                                                        .update_bid(product_bid_limit,product_auto_mode,product_bid_limit)
                                                                        .then(() => {
                                                                            var message = new Message(product_id, currentID, "Bid placed succesfully", "We are glad to inform you that you bid for " + product_name + " has been placed succesfully. Message sent at " + get_timestamp(), get_timestamp());
                                                                            message.send_auction_message();
                                                                        
                                                                            res.redirect(307,'/auction-product-details');

                                                                        }).catch(err => console.log(err));

                                                                }

                                                                //If automode is true and your bid_value is less than the previous best bid but bid limit  is greter than or equal to the previous best bid
                                                                else if(auction_results.rows[0].best_bid > product_your_bid && auction_results.rows[0].best_bid <= product_bid_limit && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                                                    product_object
                                                                        .fetch_maximum_possible_bid(currentID)
                                                                        .then(fetch_maximum_possible_bid_results => {//fetch_maximum_possible_bid gets maximum possible bid other than that of the current bidder


                                                                            new_best_bid = 0
                                                                            if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid < product_bid_limit){

                                                                                new_best_bid = fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid+1



                                                                            }
                                                                            else if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid > product_bid_limit){

                                                                                new_best_bid = product_bid_limit + 1

                                                                            }
                                                                            else{//if they are equal

                                                                                new_best_bid = product_bid_limit

                                                                            }

                                                                            //perform best bid and best bidder update
                                                                            product_object
                                                                            .update_best_bid(new_best_bid)
                                                                            .then(() => {

                                                                                
                                                                                

                                                                                    product_object
                                                                                        .update_bid_value_for_auto_bids(new_best_bid)
                                                                                        .then(() => {

                                                                                            

                                                                                            product_object
                                                                                            .update_best_bidder(new_best_bid)
                                                                                            .then(() => {

                                                                                                
                            
                                                                                        
                                                                                                var message = new Message(product_id, currentID, "Bid placed succesfully", "We are glad to inform you that you bid for " + product_name + " has been placed succesfully. Message sent at " + get_timestamp(), get_timestamp());
                                                                                                message.send_auction_message();
                                                                                            
                                                                                                    res.redirect(307,'/auction-product-details');
                            
                            
                                                                                            }).catch(err => console.log(err));                                
                                                                                    
                                                                                    
                                                                                    }).catch(err => console.log(err));
                                                                            
                                                                                    
                                                                            }).catch(err => console.log(err));







                                                                    }).catch(err => console.log(err));

                                                                }

                                                                //If automode is true and your bid_value is greater than the previous best bid 
                                                                else if(auction_results.rows[0].best_bid <= product_your_bid  && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){
                                                                    
                                                                    product_object
                                                                        .fetch_maximum_possible_bid(currentID)
                                                                        .then(fetch_maximum_possible_bid_results => {

                                                                            


                                                                            new_best_bid = 0
                                                                            if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid < product_your_bid){

                                                                                new_best_bid = product_your_bid



                                                                            }
                                                                            else if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid > product_bid_limit){

                                                                                new_best_bid = product_bid_limit + 1

                                                                            }
                                                                            else if(fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid < product_bid_limit){

                                                                                new_best_bid = fetch_maximum_possible_bid_results.rows[0].maximum_possible_bid + 1

                                                                            }
                                                                            else{

                                                                                new_best_bid = product_bid_limit

                                                                            }

                                                                            //perform best bid and best bidder update
                                                                            product_object
                                                                            .update_best_bid(new_best_bid)
                                                                            .then(() => {

                                                                                console.log("done1");

                                                                                product_object
                                                                                    .update_bid_value_for_auto_bids(new_best_bid)
                                                                                    .then(() => {

                                                                                        console.log("done2");

                                                                                        product_object
                                                                                        .update_best_bidder(new_best_bid)
                                                                                        .then(() => {

                                                                                                console.log("done3");
                        
                                                                                    
                                                                                                var message = new Message(product_id, currentID, "Bid placed succesfully", "We are glad to inform you that you bid for " + product_name + " has been placed succesfully. Message sent at " + get_timestamp(), get_timestamp());
                                                                                                message.send_auction_message();

                                                                                                // res.redirect('/auction-product-details',{product_id:product_id,product_type:product_type});
                                                                                            
                                                                                                res.redirect(307,'/auction-product-details');
                        
                        
                                                                                        }).catch(err => console.log(err));                                
                                                                                
                                                                                
                                                                                }).catch(err => console.log(err));
                                                                        
                                                                                
                                                                            }).catch(err => console.log(err));







                                                                    }).catch(err => console.log(err));



                                                                }



                                                        }).catch(err => console.log(err));


                                            }).catch(err => console.log(err));

                                        }   
                                        else if( product_bid_limit<product_your_bid && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                            console.log("bid limit cannot be less than than your bid");
                                            req.flash('error', 'Bid limit cannot be less than than your bid');
                                        
                                            res.redirect(307,'/auction-product-details');


                                        }
                                        else if( new_on_hold<old_on_hold && (your_bid_results.rows[0].auto_mode).toString().replace(/\s/g, '') == 'true' && (product_auto_mode).toString().replace(/\s/g, '') == 'false'){

                                            console.log("You cannot reduce the amount on hold when you change from auto mode to simple mode");
                                            req.flash('error', 'You cannot reduce the amount on hold when you change from auto mode to simple mode');
                                        
                                            res.redirect(307,'/auction-product-details');


                                        }
                                        else if( new_on_hold<old_on_hold && product_bid_limit<your_bid_results.rows[0].bid_limit && (your_bid_results.rows[0].auto_mode).toString().replace(/\s/g, '') == 'true' && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                            console.log("You cannot reduce your bid limit");
                                            req.flash('error', 'You cannot reduce your bid limit');
                                        
                                            res.redirect(307,'/auction-product-details');


                                        }
                                        else if( new_on_hold<old_on_hold || product_your_bid<previous_bid_value){

                                            // console.log(new_on_hold)
                                            // console.log(old_on_hold)


                                            console.log("Cannot reduce your bid");
                                            req.flash('error', 'Cannot reduce your bid');
                                        
                                            res.redirect(307,'/auction-product-details');


                                        }
                                        else if(product_your_bid < auction_results.rows[0].price){

                                            console.log("Bid cannot be less than the base price of the item");
                                            req.flash('error', 'Bid cannot be less than the base price of the item');
                                        
                                            res.redirect(307,'/auction-product-details');


                                        }

                                        

                                        else{

                                            
                                            console.log("Insufficient funds");
                                            //print insufficient funds here

                                            req.flash('error', 'Insufficient funds');
                                        
                                            res.redirect(307,'/auction-product-details');

                                          

                                        }
        
                                    }).catch(err => console.log(err));



                                                    

                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));
                 
            }).catch(err => console.log(err));

    }

};






exports.auction_close_bidding = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;
    const product_your_bid = req.body.your_bid;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);

        product_viewer = 'buyer';

        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {

                if(auction_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                }

                // product_buyer = auction_results.rows[0]

                // console.log(auction_results.rows[0].best_bid);

                if(auction_results.rows[0].best_bid){


                    product_buyer = auction_results.rows[0].best_bidder;
                    product_name = auction_results.rows[0].name;
                    



                    product_object
                        .update_status_to_sold()
                        .then(() => {

                            

                            product_object
                                .update_status_for_rejected_buyers(auction_results.rows[0].best_bidder)
                                .then(() => {


                                    product_object
                                        .update_on_hold_balance_for_rejected_buyers_auto(auction_results.rows[0].best_bidder,auction_results.rows[0].delivery_factor,auction_results.rows[0].seller_id)
                                         .then(() => {//////////

                                            product_object
                                            .update_on_hold_balance_for_rejected_buyers_non_auto(auction_results.rows[0].best_bidder,auction_results.rows[0].delivery_factor,auction_results.rows[0].seller_id)
                                             .then(() => {//////////


                                            
                                                    product_object
                                                    .update_status_for_accepted_buyer(auction_results.rows[0].best_bidder)
                                                    .then(() => {

                                                        var message = new Message(product_id, currentID, "Bidding Closed", "You have successfully closed the bidding of " + product_name + " at " + get_timestamp(), get_timestamp())
                                                        message.send_auction_message();
                                                        var message = new Message(product_id, product_buyer, "Bidding Closed", "We are glad to inform you that you are the best bidder and the product: " + product_name + " has been sold to you. Message sent at " + get_timestamp(), get_timestamp());
                                                        message.send_auction_message();
                                    


                                                        res.redirect(307,'/auction-product-details');

                    
                    
                    
                    
                                                    }).catch(err => console.log(err));

                                            }).catch(err => console.log(err));



                                    }).catch(err => console.log(err));





                            }).catch(err => console.log(err));




                    }).catch(err => console.log(err));



                }
                else{

                    console.log('No bid is present');


                    req.flash('error', 'No bid is present');
                                        
                    res.redirect(307,'/auction-product-details');


                    

                 }
            


                product_object
                    .get_your_bid()
                    .then(your_bid_results => {




                    }).catch(err => console.log(err));
                 
            }).catch(err => console.log(err));

    }

                       

};




exports.auction_delete_product = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);
        

        delivery_factor = 0 //initialisation
        seller_id = 0       //initialisation

        product_name = 'dummy'//initialisation

      


        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {


                if(auction_results.rows.length!=0){

                    delivery_factor = auction_results.rows[0].delivery_factor
            
                    seller_id = auction_results.rows[0].seller_id

                    product_name = auction_results.rows[0].name;


                }


                product_object
                    .update_status_for_rejected_buyers(-1)// here -1 is placed since no bid is accepted
                    .then(() => {

                        product_object
                            .update_on_hold_balance_for_rejected_buyers_auto(-1,delivery_factor,seller_id)// here -1 is placed since no bid is accepted
                            .then(() => {//////////

                                product_object
                                .update_on_hold_balance_for_rejected_buyers_non_auto(-1,delivery_factor,seller_id)// here -1 is placed since no bid is accepted
                                .then(() => {//////////

                                    product_object
                                    .update_status('closed')// here -1 is placed since no bid is accepted
                                    .then(() => {//////////


    
                                        var message = new Message(product_id, currentID, "Product Deleted", "You have deleted the product: " + product_name + " at " + get_timestamp(), get_timestamp())
                                        message.send_auction_message();
                                       
    
    
                                         res.redirect('/home-screen');

                                    }).catch(err => console.log(err));
    
    
    
                                 }).catch(err => console.log(err));

                        }).catch(err => console.log(err));

                }).catch(err => console.log(err));


            }).catch(err => console.log(err));

    }


};






exports.auction_update_status = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {


        console.log(product_id);
        console.log(product_type);

        product_viewer = 'buyer';

        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {

                if(auction_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                    
                }

                product_status = auction_results.rows[0].status;
                product_buyer = auction_results.rows[0].best_bidder;
                product_name = auction_results.rows[0].name;
           

                if(product_status == 'auctioned'){
                    product_status = 'shipping';
                    var message = new Message(product_id, currentID, "Status Updated", "You have updated the status of " + product_name + " to shipping at " + get_timestamp(), get_timestamp())
                    message.send_auction_message();
                    var message = new Message(product_id, product_buyer, "Product Shipping", "We are glad to inform you that your new purchase " + product_name + " status is shipping. Message sent at " + get_timestamp(), get_timestamp());
                    message.send_auction_message();


                }
                else if(product_status == 'shipping'){
                    product_status = 'shipped';
                    var message = new Message(product_id, currentID, "Status Updated", "You have updated the status of " + product_name + " to shipped at " + get_timestamp(), get_timestamp())
                    message.send_auction_message();
                    var message = new Message(product_id, product_buyer, "Product Shipped", "We are glad to inform you that your new purchase " + product_name + "got shipped at " + get_timestamp(), get_timestamp());
                    message.send_auction_message();


                    
                }
                else if(product_status == 'shipped'){
                    product_status = 'out-for-delivery';
                    var message = new Message(product_id, currentID, "Status Updated", "You have updated the status of " + product_name + " to out for delivery at " + get_timestamp(), get_timestamp())
                    message.send_auction_message();
                    var message = new Message(product_id, product_buyer, "Product Out For Delivery", "We are glad to inform you that your new purchase " + product_name + " is out for delivery now. Message sent at " + get_timestamp(), get_timestamp());
                    message.send_auction_message();


                    
                }

                product_object
                    .update_status(product_status)
                    .then(() => {

                            res.redirect(307,'/auction-product-details');



                }).catch(err => console.log(err));


            }).catch(err => console.log(err));

    }

};




exports.auction_confirm_delivery = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);

        product_viewer = 'buyer';

        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .get_auction_item()
            .then(auction_results => {

                if(auction_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                    
                }

                product_status = auction_results.rows[0].status
                product_buyer = auction_results.rows[0].best_bidder
                product_seller= auction_results.rows[0].seller_id
                product_name = auction_results.rows[0].name

                product_object
                    .get_distance(currentID,auction_results.rows[0].seller_id)
                    .then(distance_results => {
                    
                         product_distance = Math.round(distance_results.rows[0].distance/1000);//converted  to KM
                         product_delivery_cost = Math.round(product_distance*auction_results.rows[0].delivery_factor);//rounded off

                
                    product_object
                        .update_status('delivered')
                        .then(() => {


                            product_object
                            .get_your_bid()
                            .then(your_bid_results => {//////////

                                decrase_on_hold_amount_by_this_value = 0//initialisation

                                if(your_bid_results.rows[0].auto_mode.toString().replace(/\s/g, '') == 'true'){
                                    decrase_on_hold_amount_by_this_value = your_bid_results.rows[0].bid_limit + product_delivery_cost
                                }
                                else{

                                    decrase_on_hold_amount_by_this_value = your_bid_results.rows[0].bid_value + product_delivery_cost

                                }
        


                                product_object
                                    .decrease_on_hold_balance(decrase_on_hold_amount_by_this_value)
                                    .then(() => {


                                        decrease_balance_by_this_amount = auction_results.rows[0].best_bid + product_delivery_cost

                                        product_object
                                            .decrease_balance(decrease_balance_by_this_amount,currentID)
                                            .then(() => {

                                                product_object
                                                    .increase_balance(auction_results.rows[0].best_bid,auction_results.rows[0].seller_id)
                                                    .then(() => {


                                                        var message = new Message(product_id, product_seller, "Product Delivered", "Your product " + product_name + " got succesfully delivered to your customer at " + get_timestamp(), get_timestamp())
                                                        message.send_auction_message();
                                                        var message = new Message(product_id, product_buyer, "Product Delivered", "Your product " + product_name + " got delivered at" + get_timestamp() + ". Thanks for shopping with us.", get_timestamp());
                                                        message.send_auction_message();



                                                
                                                        res.redirect(307,'/auction-product-details');

                                                        

                                                }).catch(err => console.log(err));


                                        }).catch(err => console.log(err));


                                    }).catch(err => console.log(err));

                            }).catch(err => console.log(err));


                    }).catch(err => console.log(err));

                }).catch(err => console.log(err));




            }).catch(err => console.log(err));


    }


    


};
