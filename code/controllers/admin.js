const Login = require('../models/Login');
const Search = require('../models/Search');
const Product = require('../models/Product');
var Cookies = require('cookies');

var keys = ['secret key']

exports.get_test = (req,res,next) => {

    // var cookies = new Cookies(req, res, { })

    // Get a cookie
    // var currentID = cookies.get('CurrentID', { signed: true })

    // if (!currentID) {
    //     console.log('Get Lost');
    // } else {
        res.render('admin/login_screen', {
            pageTitle: 'Login Screen',
            path: '/login-screen',
            editing: false
        });
    // }


    


};

exports.post_test = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password
  
    const user = new Login( email, password);
    user
        .get_user()
        .then(results => {

            // console.log(results.rows);
            // console.log(req);
            req.currentUser =results.rows[0].person_id;

            // Create a cookies object
            var cookies = new Cookies(req, res, {keys : keys });
            
            // Set the cookie to a value
            cookies.set('CurrentID', results.rows[0].person_id, { signed: true });

            res.redirect('home-screen');

        })
        .catch(err => console.log(err));
};







exports.post_logout = (req,res,next) => {

    console.log('Entered post_logout');
    

    var cookies = new Cookies(req, res, {keys  : keys });

    cookies.set('CurrentID', {expires: Date.now()});

    var currentID = cookies.get('CurrentID', { signed: true });


    if (currentID) {

        console.log('getting logged out');

        res.redirect('login-screen');

        // console.log("success");
        // console.log(currentID);
        // res.render('admin/login_screen', {
        //     pageTitle: 'Add Product',
        //     path: '/login-screen',
        //     editing: false
        // });

        }

    // console.log(currentID)


        // else{

        //     res.redirect('prods');
        // }



    // }

    // Prod.get_all().then(results => 
    // {
    //     res.render('admin/login_screen', {
    //         pageTitle: 'View Products',
    //         path: '/login-screen',
       
    //     });
    // }
        
    //     );

};




exports.get_home_screen = (req,res,next) => {

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        console.log('Get Lost');
    } else {

        res.render('admin/home_screen', {
            pageTitle: 'Home Screen',
            path: '/home-screen',
            editing: false
        });



    }


    


};


exports.post_home_screen_search = (req,res,next) => {

    var cookies = new Cookies(req, res, {keys  : keys })

    // Get a cookie
    var currentID = cookies.get('CurrentID', { signed: true })

    if (!currentID) {
        console.log('Get Lost');
    } else {


        console.log('entered post_home_screen_search');

        const search_key = req.body.search;
       
        const search_object = new Search( search_key );
        search_object
            .get_direct_search_results()
            .then(direct_results => {



            search_object
            .get_auction_search_results()
            .then(auction_results => {

    
               
                // console.log(req);
                // req.currentUser =results.rows[0].email;
        
                res.render('admin/search_screen', {
                    pageTitle: 'Search Screen',
                    path: '/search-screen',
                    editing: false,
                    direct_products : direct_results,
                    auction_products : auction_results
                });


            }).catch(err => console.log(err));






    
            })
            .catch(err => console.log(err));
    }

};




exports.get_product_details = (req,res,next) => {

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

        


        const product_object = new Product( product_id , product_type, currentID );
        product_object
            .get_direct_item()
            .then(direct_results => {


                if(direct_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                    
                }


                product_price = direct_results.rows[0].price 
                product_status = direct_results.rows[0].status
           

                res.render('admin/product_details', {
                    pageTitle: 'Product Details',
                    path: '/product-details',
                    editing: false,
                    product_id : product_id,
                    product_type : product_type,
                    product_price : product_price,
                    product_status : product_status,
                    product_viewer : product_viewer

                });
                 
            }).catch(err => console.log(err));

    }

};




exports.get_product_details_delete_product = (req,res,next) => {

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


        const product_object = new Product( product_id , product_type, currentID );
        product_object
            .delete_product()
            .then(() => {


                    res.redirect('/home-screen');


            }).catch(err => console.log(err));

    }


};



exports.get_product_details_update_status = (req,res,next) => {

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



        const product_object = new Product( product_id , product_type, currentID );
        product_object
            .get_direct_item()
            .then(direct_results => {



                product_price = direct_results.rows[0].price 
                product_status = direct_results.rows[0].status
           


                if(direct_results.rows[0].seller_id == currentID){
                    product_viewer = 'seller';
                    
                }


                if(product_status == 'sold'){
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


                res.redirect(307,'/product-details');



            }).catch(err => console.log(err));


               
                // res.redirect(307, '/product-details');

                // res.render('admin/product_details', {
                //     pageTitle: 'Product Details',
                //     path: '/product-details',
                //     editing: false,
                //     product_id : product_id,
                //     product_type : product_type,
                //     product_price : product_price,
                //     product_status : product_status,
                //     product_viewer : product_viewer

                // });

              



            }).catch(err => console.log(err));









    }





};


exports.get_product_details_buy = (req,res,next) => {

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


        const product_object = new Product( product_id , product_type, currentID );
        product_object
            .get_direct_item()
            .then(direct_results => {


                product_price = direct_results.rows[0].price 
                product_status = direct_results.rows[0].status
                
                product_object
                    .get_person_remaining_balance()
                    .then(remaining_balance => {

                        if(remaining_balance.rows[0].remaining_balance >= product_price){

                            product_object
                                .increase_on_hold_balance(product_price)
                                .then(() => {

                                    product_object
                                    .update_status('sold')
                                    .then(() => {


                                        // product_object
                                        // .get_direct_item()
                                        // .then(direct_results_after_buying => {

                                            res.redirect(307,'/product-details');

                                                    //  product_price = direct_results_after_buying.rows[0].price 
                                                    //  product_status = direct_results_after_buying.rows[0].status

                                                    // res.render('admin/product_details', {
                                                    //     pageTitle: 'Product Details',
                                                    //     path: '/product-details',
                                                    //     editing: false,
                                                    //     product_id : product_id,
                                                    //     product_type : product_type,
                                                    //     product_price : product_price,
                                                    //     product_status : product_status

                                                    // });

                                        // }).catch(err => console.log(err));

                                    }).catch(err => console.log(err));

                                }).catch(err => console.log(err));

                         }

                }).catch(err => console.log(err));

            }).catch(err => console.log(err));

    }


};









exports.get_product_details_confirm_delivery = (req,res,next) => {

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


        const product_object = new Product( product_id , product_type, currentID );
        product_object
            .get_direct_item()
            .then(direct_results => {


                product_price = direct_results.rows[0].price 
                product_status = direct_results.rows[0].status
                
                product_object
                    .update_status('delivered')
                    .then(() => {


                        product_object
                            .decrease_on_hold_balance(product_price)
                            .then(() => {


                                product_object
                                    .decrease_balance(product_price,currentID)
                                    .then(() => {

                                        product_object
                                            .increase_balance(product_price,direct_results.rows[0].seller_id)
                                            .then(() => {

                                                // product_object
                                                //     .get_direct_item()
                                                //     .then(direct_results_after_confirming_delivery => {

                                                                res.redirect(307,'/product-details');

                                                                // product_price = direct_results_after_confirming_delivery.rows[0].price 
                                                                // product_status = direct_results_after_confirming_delivery.rows[0].status

                                                                // res.render('admin/product_details', {
                                                                //     pageTitle: 'Product Details',
                                                                //     path: '/product-details',
                                                                //     editing: false,
                                                                //     product_id : product_id,
                                                                //     product_type : product_type,
                                                                //     product_price : product_price,
                                                                //     product_status : product_status

                                                                // });


                                                    // }).catch(err => console.log(err));

                                        }).catch(err => console.log(err));


                                }).catch(err => console.log(err));


                            }).catch(err => console.log(err));


                }).catch(err => console.log(err));




            }).catch(err => console.log(err));


    }


    


};

// exports.get_products = (req,res,next) => {
    

//     var cookies = new Cookies(req, res, {keys  : keys });

//     // Get a cookie
//     var currentID = cookies.get('CurrentID', { signed: true });

//     if (!currentID) {
//         console.log('Get Lost');
//     } else {

//         // cookies.set('CurrentID');

//         var currentID = cookies.get('CurrentID', { signed: true });


//         if (currentID) {

//         console.log("success");
//         console.log(currentID);
//         res.render('admin/login_screen', {
//             pageTitle: 'Add Product',
//             path: '/login-screen',
//             editing: false
//         });

//         }
//         // else{

//         //     res.redirect('prods');
//         // }



//     }

//     // Prod.get_all().then(results => 
//     // {
//     //     res.render('admin/login_screen', {
//     //         pageTitle: 'View Products',
//     //         path: '/login-screen',
       
//     //     });
//     // }
        
//     //     );

// };