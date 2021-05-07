const Login = require('../models/Login');
const Search = require('../models/Search');
const Product = require('../models/Product');
const {encrypt,get_timestamp} = require('../utils/crypto');
var Cookies = require('cookies');
const Message = require('../models/Message');
const Signup = require('../models/Signup');
const { use } = require('../routes/admin');
const { rawListeners } = require('../utils/database');
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
var keys = ['secret key']
const alert = require('alert');

exports.get_login = (req, res, next) => {


    res.render('admin/login_screen', {
        pageTitle: 'Login Screen',
        path: '/login-screen'

    });

};

exports.get_signup = (req, res, next) => {


    res.render('admin/signup_screen', {
        pageTitle: 'Signup Screen',
        path: '/signup-screen'

    });

};

function getPosition(position) {
    return [position.latitude, position.longitude];
}

exports.post_signup = (req, res, next) => {
    var name = req.body.name,
        email = req.body.email,
        password = encrypt(req.body.password),
        phone_no = req.body.phone;


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                //latitude = position.coords.latitude;
                //longitude = position.coords.longitude; 

                var latitude = position.latitude;
                var longitude = position.longitude;
                user = new Signup();
                user
                    .get_personid()
                    .then(results => {
                        var user = new Signup(results.rows[0].person_id + 1, name, email, password, phone_no, latitude, longitude, 1000);

                        user.insert_user().catch(err => console.log(err));
                        res.redirect('login-screen');

                    }).catch(err => console.log(err));


            });
    }


};
exports.post_login = (req, res, next) => {
    const email = req.body.email;
    const password = encrypt(req.body.password);

    //const password = req.body.password;
    const user = new Login(email);
    user
        .get_user(password)
        .then(results => {

            if (results.rows.length == 0) {

                res.redirect('login-screen');

            }
            req.currentUser = results.rows[0].person_id;

            // Create a cookies object
            var cookies = new Cookies(req, res, { keys: keys });

            // Set the cookie to a value
            cookies.set('CurrentID', results.rows[0].person_id, { signed: true });
            cookies.set('CurrentEmail', results.rows[0].email, { signed: true });

            res.redirect('home-screen');


        })
        .catch(err => console.log(err));



};







exports.get_logout = (req, res, next) => {

    console.log('Entered get_logout');


    var cookies = new Cookies(req, res, { keys: keys });

    cookies.set('CurrentID', { expires: Date.now() }); // for deleting a cookie

    var currentID = cookies.get('CurrentID', { signed: true });


    if (currentID) { //cookie will be present here but after redirecting it will not be present

        console.log('getting logged out');

        res.redirect('login-screen');


    }


};




exports.get_home_screen = (req, res, next) => {

    var cookies = new Cookies(req, res, { keys: keys })


    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    user = new Login(currentEmail);

    if (!currentID) {
        res.redirect('login-screen');
    } else {
        user
            .get_balance()
            .then(results => {

                res.render('admin/home_screen', {
                    pageTitle: 'Home Screen',
                    path: '/home-screen',
                    balance: results.rows[0].balance,
                    amount_on_hold:results.rows[0].amount_on_hold
                    
                });

            }).catch(err => console.log(err));

    }
};

exports.post_update_balance = (req, res, next) => {

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    user = new Login(currentEmail);
    if (!currentID) {
        res.redirect('login-screen');
    } else {
        user.update_balance(req.body.balance);
        var message = new Message(product_id,seller_id,"Balance updated","Your have added money "+req.body.balance+" at "+get_timestamp(),get_timestamp())
        message.send_direct_message();
                    
        res.redirect('home-screen');
    }
};



exports.post_home_screen_search = (req, res, next) => { // when search button is pressed 

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {


        console.log('entered post_home_screen_search');

        const search_key = req.body.search;
        const start = 0;

        const search_object = new Search(search_key);
        search_object
            .get_direct_search_results()
            .then(direct_results => {



                search_object
                    .get_auction_search_results()
                    .then(auction_results => {


                        res.render('admin/search_screen', {
                            pageTitle: 'Search Screen',
                            path: '/search-screen',

                            direct_products: direct_results,
                            auction_products: auction_results,
                            result_start: start,
                            searched_text: search_key
                        });


                    }).catch(err => console.log(err));


            }).catch(err => console.log(err));

    }

};

exports.get_view_my_sales = (req,res,next) => {// when search button is pressed 

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    
    if (!currentID) {
        res.redirect('login-screen');
    } else {
        
        const user = new Login(currentEmail);
        user
            .get_direct_search_results_sales(currentID)
            .then(direct_results => {



            user
                .get_auction_search_results_sales(currentID)
                .then(auction_results => {

    
                res.render('admin/search_screen', {
                    pageTitle: 'Search Screen',
                    path: '/search-screen',
                  
                    direct_products : direct_results,
                    auction_products : auction_results,
                    searched_text: 'My Sales',
                    result_start: 0
                });


            }).catch(err => console.log(err));

    
        }).catch(err => console.log(err));

    }

};

exports.get_view_my_purchases = (req,res,next) => {// when search button is pressed 

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    
    if (!currentID) {
        res.redirect('login-screen');
    } else {
        
        const user = new Login(currentEmail);
        user
            .get_direct_search_results_purchases(currentID)
            .then(direct_results => {



            user
                .get_auction_search_results_purchases(currentID)
                .then(auction_results => {

    
                res.render('admin/search_screen', {
                    pageTitle: 'Search Screen',
                    path: '/search-screen',
                  
                    direct_products : direct_results,
                    auction_products : auction_results,
                    searched_text: 'My Purchases',
                    result_start: 0
                });


            }).catch(err => console.log(err));

    
        }).catch(err => console.log(err));

    }

};


exports.post_results_switch_page = (req, res, next) => { // when search button is pressed

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {


        console.log('entered post_results_switch_page');

        const search_key = req.body.search;
        const start = req.body.result_start;
        const direct_results = req.body.direct_results;
        const auction_results = req.body.auction_results;

        res.render('admin/search_screen', {
            pageTitle: 'Search Screen',
            path: '/search-screen',

            direct_products: direct_results,
            auction_products: auction_results,
            result_start: start,
            searched_text: search_key
        });

        

    }

};


exports.get_product_details = (req, res, next) => { // when a direct sale product is selected

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;
    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {


        product_viewer = 'buyer';


        const product_object = new Product(product_id, product_type, currentID);
        product_object
            .get_direct_item()
            .then(direct_results => {


                if (direct_results.rows[0].seller_id == currentID) {
                    product_viewer = 'seller';

                }


                product_price = direct_results.rows[0].price
                product_status = direct_results.rows[0].status

                product_new_status = product_status//initialisation

                
                if (product_status == 'sold') {
                    product_new_status = 'shipping';

                } else if (product_status == 'shipping') {
                    product_new_status = 'shipped';

                } else if (product_status == 'shipped') {
                    product_new_status = 'out-for-delivery';

                }


               
                res.render('admin/product_details', {
                    pageTitle: 'Product Details',
                    path: '/product-details',
                    product_id : product_id,
                    product_type : product_type,
                    product_price : product_price,
                    product_status : product_status,
                    product_viewer : product_viewer,
                    product_new_status : product_new_status

                });

            }).catch(err => console.log(err));

    }

};




exports.get_product_details_delete_product = (req, res, next) => { // when seller deletes a product for a direct sale item

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);


        const product_object = new Product(product_id, product_type, currentID);
        product_object
            .delete_product()
            .then(() => {
                
                res.redirect('/home-screen');


            }).catch(err => console.log(err));

    }


};



exports.get_product_details_update_status = (req, res, next) => { //when seller presses the update button for a direct sale item

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



        const product_object = new Product(product_id, product_type, currentID);
        product_object
            .get_direct_item()
            .then(direct_results => {



                product_price = direct_results.rows[0].price
                product_status = direct_results.rows[0].status
                console.log(direct_results.rows[0])
                buyer_id  = direct_results.rows[0].buyer_id
                product_name = direct_results.rows[0].name




                if (direct_results.rows[0].seller_id == currentID) {
                    product_viewer = 'seller';

                }


                if (product_status == 'sold') {
                    product_status = 'shipping';
                    var message = new Message(product_id,currentID,"Status Updated","Your have updated the status of "+product_name+" to shipping at "+get_timestamp(),get_timestamp())
                    message.send_direct_message();
                    var message = new Message(product_id,buyer_id,"Product Shipping","We are glad to inform you that your new purchase "+product_name+" status is shipping. Message sent at "+get_timestamp(),get_timestamp());
                    message.send_direct_message();
                                        

                } else if (product_status == 'shipping') {
                    product_status = 'shipped';
                    var message = new Message(product_id,currentID,"Status Updated","Your have updated the status of "+product_name+" to shipped at "+get_timestamp(),get_timestamp())
                    message.send_direct_message();
                    var message = new Message(product_id,buyer_id,"Product Shipping","We are glad to inform you that your new purchase "+product_name+"got shipped at "+get_timestamp(),get_timestamp());
                    message.send_direct_message();
                    

                } else if (product_status == 'shipped') {
                    product_status = 'out-for-delivery';
                    var message = new Message(product_id,currentID,"Status Updated","Your have updated the status of "+product_name+" to out for delivary at "+get_timestamp(),get_timestamp())
                    message.send_direct_message();
                    var message = new Message(product_id,buyer_id,"Product Shipping","We are glad to inform you that your new purchase "+product_name+" is out for delivary now. Message sent at "+get_timestamp(),get_timestamp());
                    message.send_direct_message();
                    

                }

                product_object
                    .update_status(product_status)
                    .then(() => {

                        res.redirect(307, '/product-details');


                    }).catch(err => console.log(err));


            }).catch(err => console.log(err));

    }

};


exports.get_product_details_buy = (req, res, next) => { // when the buyer clicks on the buy button for a direct sale item

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true });
    var currentEmail = cookies.get('CurrentEmail',{signed:true});
    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);


        const product_object = new Product(product_id, product_type, currentID);
        product_object
            .get_direct_item()
            .then(direct_results => {


                product_price = direct_results.rows[0].price; 
                product_status = direct_results.rows[0].status;
                product_seller = direct_results.rows[0].seller_id;
                product_name = direct_results.rows[0].name;
                
                product_object
                    .get_person_remaining_balance()
                    .then(remaining_balance => {

                        if (remaining_balance.rows[0].remaining_balance >= product_price) {

                            product_object
                                .increase_on_hold_balance(product_price)
                                .then(() => {

                                    product_object
                                        .update_status('sold')
                                        .then(() => {

                                        //var user = new Login(currentEmail);
                                        product_object.update_direct_buyer(currentID);
                                        var message = new Message(product_id,currentID,"Order placed Succesful","Your order for item "+product_name+" is placed success fully at "+get_timestamp(),get_timestamp())
                                        message.send_direct_message();
                                        var message = new Message(product_id,product_seller,"New order","You got a new order for "+product_name+" at "+get_timestamp(),get_timestamp());
                                        message.send_direct_message();
                                        res.redirect(307,'/product-details');


                                        }).catch(err => console.log(err));

                                }).catch(err => console.log(err));

                         }
                         else{
                            // res.json({success:false});
                            //var string = encodeURIComponent('something that would break');
                           // res.redirect(307,'/product-details?valid=' + string);
                             res.send("Insufficent Balance");
                         }

                    }).catch(err => console.log(err));

            }).catch(err => console.log(err));

    }


};



exports.get_product_details_confirm_delivery = (req, res, next) => { // when the buyer clicks on confirm delivery for a direct sale item

    const product_id = req.body.product_id;
    const product_type = req.body.product_type;

    var cookies = new Cookies(req, res, { keys: keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {

        console.log(product_id);
        console.log(product_type);


        const product_object = new Product(product_id, product_type, currentID);
        product_object
            .get_direct_item()
            .then(direct_results => {


                product_price = direct_results.rows[0].price
                product_status = direct_results.rows[0].status
                product_name = direct_results.rows[0].name
                product_seller = direct_results.rows[0].seller_id
                product_buyer = direct_results.rows[0].buyer_id

                product_object
                    .update_status('delivered')
                    .then(() => {


                        product_object
                            .decrease_on_hold_balance(product_price)
                            .then(() => {


                                product_object
                                    .decrease_balance(product_price, currentID) // decrease balance of the buyer
                                    .then(() => {

                                        product_object
                                            .increase_balance(product_price, direct_results.rows[0].seller_id) //increase balance of the seller
                                            .then(() => {
                                                var message = new Message(product_id,product_seller,"Product Delivered","Your product "+product_name+" got succesfully delivered to your customer at "+get_timestamp(),get_timestamp())
                                                message.send_direct_message();
                                                var message = new Message(product_id,product_buyer,"Product Delivered","Your product"+product_name+" got delivered at"+get_timestamp()+". Thanks for shopping with us.",get_timestamp());
                                                message.send_direct_message();
                    
                                                res.redirect(307, '/product-details');

                                            }).catch(err => console.log(err));


                                    }).catch(err => console.log(err));


                            }).catch(err => console.log(err));


                    }).catch(err => console.log(err));




            }).catch(err => console.log(err));


    }




};


exports.viewMessages = (req,res,next) => {// when a direct sale product is selected

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })

    if (!currentID) {
        res.redirect('login-screen');
    } else {


        const user = new Login(currentEmail);
        user
            .get_messages(currentID)
            .then(results => {
                //console.log(results);
                res.render('admin/messages', {
                    pageTitle: 'Product Details',
                    path: '/product-details',
                    messages : results
                });
                 
            }).catch(err => console.log(err));

    }

};

exports.get_add_product = (req,res,next) => {
    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    if (!currentID) {
        res.redirect('login-screen');
    } else {
        res.render('admin/add-product',{
            pageTitle: 'Add Product',
            path: '/add-product',
            
        });
    }


};


exports.post_add_product = (req,res,next) => {
    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })
    var currentEmail = cookies.get('CurrentEmail', { signed: true })
    var name = req.body.name,
        description = req.body.description,
        price = req.body.price,
        quantity = req.body.quantity,
        identifier = req.body.category,
        mode = req.body.item_type,
        close_date = req.body.close_date;



    if (!currentID) {
        res.redirect('login-screen');
    } else {

        user = new Login(currentEmail);
        if(mode == "auction" )
        {
            user
                .get_new_aitem_id()
                .then(results => {
                    console.log("trying to add auction product")
                    user.add_auction_product(results.rows[0].aitem_id+1,identifier,name,description,price,currentID,quantity,get_timestamp(),close_date+" 23:59:00");
                    console.log("added auction product")
                    var message = new Message(results.rows[0].aitem_id+1,currentID,"New Product Added","You have added a new direct sale product "+name+" at "+get_timestamp(),get_timestamp())
                    console.log("trying to send au msg")
                    message.send_auction_message();
                    console.log("sent au msg")
                    res.redirect('home-screen');    

                }).catch(err => console.log(err));
        }
        else
        {
            user
                .get_new_ditem_id()
                .then(results => {
                    user
                    .add_direct_product(results.rows[0].ditem_id+1,identifier,name,description,price,currentID,quantity)
                    .catch(err=> console.log(err));
                    var message = new Message(results.rows[0].ditem_id+1,currentID,"New Product Added","You have added a new direct sale product "+name+" at "+get_timestamp(),get_timestamp())
                    message.send_direct_message();
                    
                        res.redirect('home-screen');    

                }).catch(err => console.log(err));
        }

        
    }


};