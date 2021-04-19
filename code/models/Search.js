
const pool= require('../utils/database');

module.exports = class Search{

    constructor( searchkey ){
        this.searchkey = searchkey;
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_direct_search_results(){
        // console.log(this.searchkey);
        return pool.query('SELECT * FROM direct_sale_item where name = $1',[this.searchkey]);

    }


    get_auction_search_results(){
        // console.log(this.searchkey);
        return pool.query('SELECT * FROM auction_item where name = $1',[this.searchkey]);

    }

};