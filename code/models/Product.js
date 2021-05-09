const pool= require('../utils/database');

module.exports = class Product{

    constructor( product_id, product_type, currentID ){
        this.product_id = product_id;
        this.product_type = product_type;
        this.currentID = currentID;
    }

    //add_direct_item(){
      //   return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    //}

    get_seller_name(seller_id) {

        return pool.query('SELECT name FROM person where person_id = $1', [seller_id]);

    }
    
    get_location(user_id) {
        return pool.query('SELECT ST_X(location::geometry) as  X,ST_Y(location::geometry) as Y FROM person where person.person_id = $1', [user_id]);

    }
    
    get_distance(buyer_id, seller_id) {
        return pool.query('SELECT ST_DistanceSphere(geometry(a.location), geometry(b.location)) as distance FROM person a, person b where a.person_id = $1 and b.person_id = $2', [buyer_id, seller_id]);


    }


    update_direct_buyer(id){
        return pool.query('update direct_sale_item set buyer_id = $1 where ditem_id = $2',[id,this.product_id]);
    }

    update_auction_buyer(id){
        return pool.query('update auction_sale_item set buyer_id = $1 where aitem_id = $2',[id,this.product_id]);
    }
    get_direct_item(){
        
        return pool.query('SELECT * FROM direct_sale_item where ditem_id = $1',[this.product_id]);

    }

    get_person_remaining_balance(){
        
        return pool.query('SELECT (balance - amount_on_hold) as remaining_balance FROM person where person_id = $1',[this.currentID]);

    }

    increase_on_hold_balance(price){

        
        
        return pool.query('UPDATE person SET amount_on_hold = amount_on_hold + $2 where person_id = $1',[this.currentID,price]);

    }

    update_status(new_status){

        
        
        return pool.query('UPDATE direct_sale_item SET status = $2 where ditem_id = $1',[this.product_id,new_status]);

    }


    decrease_on_hold_balance(price){

        
        
        return pool.query('UPDATE person SET amount_on_hold = amount_on_hold - $2 where person_id = $1',[this.currentID,price]);

    }

    decrease_balance(price,id){

        
        
        return pool.query('UPDATE person SET balance = balance - $2 where person_id = $1',[id,price]);

    }


    increase_balance(price,id){

        
        return pool.query('UPDATE person SET balance = balance + $2 where person_id = $1',[id,price]);

    }

    delete_product(){
        
        return pool.query('DELETE FROM direct_sale_item WHERE ditem_id = $1',[this.product_id]);

    }

    



    // get_auction_search_results(){
        
    //     return pool.query('SELECT * FROM auction_item where name = $1',[this.searchkey]);

    // }

};