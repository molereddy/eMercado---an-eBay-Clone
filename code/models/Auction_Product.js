const pool= require('../utils/database');

module.exports = class Product{

    constructor( product_id, product_type, currentID ){
        this.product_id = product_id;
        this.product_type = product_type;
        this.currentID = currentID;
    }

   
    get_auction_item(){
        
        return pool.query('SELECT * FROM auction_item where aitem_id = $1',[this.product_id]);

    }

    get_your_bid(){

         return pool.query ('SELECT * FROM bid WHERE aitem_id = $1 and person_id = $2',[this.product_id,this.currentID]);
    }

    
    // place_bid(bid_value){

    //     return pool.query ('INSERT INTO bid VALUES($1, $2, FALSE, NULL, $3, $4, NOW())',[this.product_id,this.currentID,bid_value,'running']);
    
    // }

    // INSERT INTO bid VALUES($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT UPDATE SET bid_value = $1, auto_mode = $4, bid_limit = $5 ,[this.product_id,this.currentID,auto_mode,bid_limit,bid_value,'running']

    update_bid(bid_value,auto_mode,bid_limit,already_present){

        if(already_present){

            return pool.query ('UPDATE bid SET bid_value = $1, auto_mode = $4, bid_limit = $5 WHERE aitem_id = $2 AND person_id = $3',[bid_value,this.product_id,this.currentID,auto_mode,bid_limit]);
        }
        else{

            return pool.query ('INSERT INTO bid VALUES($1, $2, $3, $4, $5, $6, NOW())',[this.product_id,this.currentID,auto_mode,parseFloat(bid_limit),parseFloat(bid_value),'running']);
    

        }
        
    }


    fetch_maximum_possible_bid(currentID){

        return pool.query (' SELECT coalesce(max(Z.b),0) as maximum_possible_bid  from ((SELECT max(bid_value) as b from bid where aitem_id = $1 and auto_mode = false and person_id <> $2) union (SELECT max(bid_limit) as b from bid where aitem_id = $1 and auto_mode = true and person_id <> $2)) as Z  ',[this.product_id,currentID]);
        
    }


    update_best_bid(new_best_bid){

        return pool.query ('UPDATE auction_item SET best_bid =  $2 where aitem_id = $1',[this.product_id,new_best_bid]);
        
    }



    update_bid_value_for_auto_bids(new_best_bid){

        
        return pool.query ('UPDATE bid SET bid_value = (SELECT least($1,b.bid_limit) from bid as b where b.aitem_id = $2 AND b.auto_mode = true AND b.person_id =  bid.person_id) WHERE aitem_id = $2 AND auto_mode = true',[new_best_bid,this.product_id]);

        
    }


    update_best_bidder(){

        return pool.query ('UPDATE auction_item SET best_bidder = (SELECT person_id from bid where aitem_id = $1 and bid_value = $2 order by  person_id limit 1) where aitem_id = $1',[this.product_id,new_best_bid]);
        
    }




    get_person_remaining_balance(){
        
        return pool.query('SELECT (balance - amount_on_hold) as remaining_balance FROM person where person_id = $1',[this.currentID]);

    }

    increase_on_hold_balance(price){

        
        
        return pool.query('UPDATE person SET amount_on_hold = amount_on_hold + $2 where person_id = $1',[this.currentID,price]);

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



    update_status_to_sold(){

        return pool.query('UPDATE auction_item SET status= $1, close_time = NOW() WHERE aitem_id = $2',['auctioned',this.product_id]);

    }

    update_status_for_rejected_buyers(final_buyer){



        return pool.query('WITH rejected_buyers(person_id) AS (SELECT person_id FROM bid WHERE aitem_id = $1 AND person_id <> $2 ) UPDATE bid SET status= $3 WHERE aitem_id = $1 and person_id IN (SELECT * from rejected_buyers)',[this.product_id,final_buyer,'rejected, removed']);


    }

    update_on_hold_balance_for_rejected_buyers(final_buyer){


        return pool.query('WITH rejected_buyers(person_id,bid_value) AS (SELECT person_id,bid_value FROM bid WHERE aitem_id = $1 AND person_id <> $2 ) UPDATE person SET amount_on_hold = amount_on_hold - (SELECT bid_value from rejected_buyers where rejected_buyers.person_id = person_id) WHERE person_id IN (SELECT person_id from rejected_buyers)',[this.product_id,final_buyer]);

    }

    update_status_for_accepted_buyer(final_buyer){



        return pool.query('UPDATE bid SET status= $3 WHERE  aitem_id = $1 and person_id = $2',[this.product_id,final_buyer,'accepted']);


    }


    delete_product(){
        
        return pool.query('DELETE FROM auction_item WHERE aitem_id = $1',[this.product_id]);

    }

    update_status(new_status){

        
        
        return pool.query('UPDATE auction_item SET status = $2 where aitem_id = $1',[this.product_id,new_status]);

    }


    


};