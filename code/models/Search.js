
const pool= require('../utils/database');
//const sequelize = require('sequelize');

module.exports = class Search{

    constructor( searchkey ){
        this.searchkey = searchkey;
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_direct_search_results(tags_string){
        // console.log(this.searchkey);
        if(this.searchkey == "")
        {
            return pool.query('SELECT * FROM direct_sale_item as ds inner join direct_sale_item_tags as dt on ds.ditem_id=dt.identifier  where dt.tag = ANY($1) and status != \'closed\' ',[tags_string]);

        }
        if(tags_string == "" )
        {
            return pool.query('SELECT * FROM direct_sale_item where to_tsvector(name) @@ to_tsquery($1) and status != \'closed\' order by ts_rank(to_tsvector(name),to_tsquery($1)) desc',[this.searchkey.replace(/ /g," & ")]);

        }
        return pool.query('SELECT * FROM direct_sale_item as ds inner join direct_sale_item_tags as dt on ds.ditem_id=dt.identifier  where to_tsvector(name) @@ to_tsquery($1) and dt.tag = ANY($2) and status != \'closed\' order by ts_rank(to_tsvector(name),to_tsquery($1)) desc',[this.searchkey.replace(/ /g," & "),tags_string]);

    }


    get_auction_search_results(tags_string){
        console.log(this.searchkey)
        console.log(tags_string);

        if(this.searchkey == "")
        {
            return pool.query('SELECT * FROM auction_item as ds inner join auction_item_tags as dt on ds.aitem_id=dt.identifier  where dt.tag  = ANY($1) and status != \'closed\' ',[tags_string]);

        }
        if(tags_string == "" )
        {
            return pool.query('SELECT * FROM auction_item where to_tsvector(name) @@ to_tsquery($1) and status != \'closed\' order by ts_rank(to_tsvector(name),to_tsquery($1)) desc',[this.searchkey.replace(/ /g," & ")]);

        }
        return pool.query('SELECT * FROM auction_item as ai inner join auction_item_tags as at on ai.aitem_id = at.identifier where to_tsvector(name) @@ to_tsquery($1) and at.tag = ANY( $2 ) and status != \'closed\' order by ts_rank(to_tsvector(name),to_tsquery($1)) desc',[this.searchkey.replace(/ /g," & "),tags_string]);

    }



};


