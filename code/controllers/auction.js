const Login = require('../models/Login');
const Search = require('../models/Search');
const Product = require('../models/Product');
const Auction_Product = require('../models/Auction_Product');

var Cookies = require('cookies');

var keys = ['secret key']


exports.auction_get_product_details = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        console.log('Get Lost');
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


               

                product_object
                    .get_your_bid()
                    .then(your_bid_results => {
                        

                        product_your_bid = 0;

                        product_auto_mode = 'false';

                        product_bid_limit = 0;

                        if(your_bid_results.rows.length!=0){
                            product_your_bid = your_bid_results.rows[0].bid_value
                            product_auto_mode = your_bid_results.rows[0].auto_mode
                            product_bid_limit = your_bid_results.rows[0].bid_limit
    
                        }

        

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
                                product_bid_limit : product_bid_limit
                                



                            });

                    }).catch(err => console.log(err));
                 
            }).catch(err => console.log(err));

    }

};






exports.auction_place_bid = (req,res,next) => {

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;
    const product_your_bid = parseFloat(req.body.your_bid);
    const product_auto_mode = req.body.auto_mode;
    const product_bid_limit = parseFloat(req.body.bid_limit);

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        console.log('Get Lost');
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


                product_object
                    .get_your_bid()
                    .then(your_bid_results => {

                       
                            previous_bid_value = 0;

                            old_on_hold = 0;
                            if(your_bid_results.rows.length==0){//if this is a new bid

                                old_on_hold = 0;
                                previous_bid_value = 0;

                            }

                            else if((your_bid_results.rows[0].auto_mode).toString().replace(/\s/g, '') == 'true'){//check if automode is set to true
                                    
                                previous_bid_value = your_bid_results.rows[0].bid_value
                                old_on_hold = your_bid_results.rows[0].bid_limit;

                            }
                            else{

                                previous_bid_value = your_bid_results.rows[0].bid_value
                                old_on_hold = your_bid_results.rows[0].bid_value;

                            }

                            new_on_hold = 0;
                            check = 1;// your bid must not be less than your previous bid && product_bid_limit>=product_your_bid for auto-mode
                            
                            if((product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                if(product_your_bid<previous_bid_value ||  product_bid_limit<product_your_bid){check = 0;}

                                console.log("entered auto mode")

                                
                                    
                                new_on_hold = product_bid_limit;

                            }
                            else{

                                new_on_hold = product_your_bid;

                            }

                            console.log(product_auto_mode)

                            console.log(old_on_hold)
                            console.log(new_on_hold)


                            product_object
                                .get_person_remaining_balance()
                                .then(remaining_balance => {
                                    

                                    console.log(remaining_balance.rows[0].remaining_balance)
        
                                    if(remaining_balance.rows[0].remaining_balance >= new_on_hold - old_on_hold && new_on_hold>=old_on_hold && check){
        
                                        product_object
                                            .increase_on_hold_balance(new_on_hold - old_on_hold)
                                            .then(() => {

                            
                                                    product_object
                                                        .update_bid(product_your_bid,product_auto_mode,product_bid_limit,your_bid_results.rows.length!=0)
                                                        .then(() => {


                                                            if (auction_results.rows[0].best_bid > product_your_bid && (product_auto_mode).toString().replace(/\s/g, '') == 'false'){

                                                                //Do Nothing
                                                            }
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
                                                                    else{

                                                                        new_best_bid = product_your_bid

                                                                    }

                                                                    //perform best bid and best bidder
                                                                        product_object
                                                                            .update_best_bid(new_best_bid)
                                                                            .then(() => {

                                                                            product_object
                                                                                .update_bid_value_for_auto_bids(new_best_bid)
                                                                                .then(() => {

                                                                                    product_object
                                                                                    .update_best_bidder(new_best_bid)
                                                                                    .then(() => {
                    
                                                                                
                                                                                
                                                                                            res.redirect(307,'/auction-product-details');
                    
                    
                                                                                    }).catch(err => console.log(err));                                
                                                                            
                                                                            
                                                                            }).catch(err => console.log(err));
                                                                     
                                                                            
                                                                        }).catch(err => console.log(err));
    








                                                                 }).catch(err => console.log(err));


                                                            }
                                                            else if(auction_results.rows[0].best_bid > product_your_bid && auction_results.rows[0].best_bid > product_bid_limit && (product_auto_mode).toString().replace(/\s/g, '') == 'true'){

                                                                product_object
                                                                    .update_bid(product_bid_limit,product_auto_mode,product_bid_limit)
                                                                    .then(() => {

                                                                    }).catch(err => console.log(err));

                                                            }
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
                                                                        else{

                                                                            new_best_bid = product_bid_limit

                                                                        }

                                                                        //perform best bid and best bidder
                                                                        product_object
                                                                        .update_best_bid(new_best_bid)
                                                                        .then(() => {

                                                                            console.log(new_best_bid);
                                                                            console.log("don0");

                                                                                product_object
                                                                                    .update_bid_value_for_auto_bids(new_best_bid)
                                                                                    .then(() => {

                                                                                        console.log("don1");

                                                                                        product_object
                                                                                        .update_best_bidder(new_best_bid)
                                                                                        .then(() => {

                                                                                            console.log("don2");
                        
                                                                                    
                                                                                    
                                                                                                res.redirect(307,'/auction-product-details');
                        
                        
                                                                                        }).catch(err => console.log(err));                                
                                                                                
                                                                                
                                                                                }).catch(err => console.log(err));
                                                                        
                                                                                
                                                                        }).catch(err => console.log(err));







                                                                }).catch(err => console.log(err));

                                                            }

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

                                                                        //perform best bid and best bidder
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
                    
                                                                                
                                                                                
                                                                                            res.redirect(307,'/auction-product-details');
                    
                    
                                                                                    }).catch(err => console.log(err));                                
                                                                            
                                                                            
                                                                            }).catch(err => console.log(err));
                                                                    
                                                                            
                                                                        }).catch(err => console.log(err));







                                                                }).catch(err => console.log(err));



                                                            }



                                                     }).catch(err => console.log(err));


                                        }).catch(err => console.log(err));

                                    }   
                                    else if( product_bid_limit<product_your_bid){

                                        console.log("bid limit cannot be less than than your bid");


                                    }
                                    else if( new_on_hold<old_on_hold){

                                        console.log("Cannot reduce your bid");


                                    }

                                    else{
                                        console.log("Insufficient funds");
                                        //print insufficient funds here
                                    }
    
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
        console.log('Get Lost');
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

                console.log(auction_results.rows[0].best_bid);

                if(auction_results.rows[0].best_bid == 'NULL'){


                    console.log('No bid is present');

                }
                else{

                    product_object
                        .update_status_to_sold()
                        .then(() => {

                            product_object
                                .update_status_for_rejected_buyers(auction_results.rows[0].best_bidder)
                                .then(() => {


                                    product_object
                                        .update_on_hold_balance_for_rejected_buyers(auction_results.rows[0].best_bidder)
                                         .then(() => {
                                    
                                            product_object
                                            .update_status_for_accepted_buyer(auction_results.rows[0].best_bidder)
                                            .then(() => {


                                                res.redirect(307,'/auction-product-details');

            
            
            
            
                                             }).catch(err => console.log(err));



                                    }).catch(err => console.log(err));





                            }).catch(err => console.log(err));




                    }).catch(err => console.log(err));



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
        console.log('Get Lost');
    } else {

        console.log(product_id);
        console.log(product_type);


        const product_object = new Auction_Product( product_id , product_type, currentID );
        product_object
            .delete_product()
            .then(auction_results => {

                product_object
                    .update_status_for_rejected_buyers(-1)// here -1 is placed since no bid is accepted
                    .then(() => {

                         product_object
                            .update_on_hold_balance_for_rejected_buyers(-1)// here -1 is placed since no bid is accepted
                            .then(() => {


                                res.redirect('/home-screen');



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
        console.log('Get Lost');
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
           

                if(product_status == 'auctioned'){
                    product_status = 'shipping';

                }
                else if(product_status == 'shipping'){
                    product_status = 'shipped';
                    
                }
                else if(product_status == 'shipped'){
                    product_status = 'out-for-delivery';
                    
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
        console.log('Get Lost');
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

                
                product_object
                    .update_status('delivered')
                    .then(() => {


                        product_object
                            .decrease_on_hold_balance(auction_results.rows[0].best_bid)
                            .then(() => {


                                product_object
                                    .decrease_balance(auction_results.rows[0].best_bid,currentID)
                                    .then(() => {

                                        product_object
                                            .increase_balance(auction_results.rows[0].best_bid,auction_results.rows[0].seller_id)
                                            .then(() => {

                                           
                                                 res.redirect(307,'/auction-product-details');

                                                

                                        }).catch(err => console.log(err));


                                }).catch(err => console.log(err));


                            }).catch(err => console.log(err));


                }).catch(err => console.log(err));




            }).catch(err => console.log(err));


    }


    


};
