
const pool= require('../utils/database');
module.exports = class Login{

    constructor( email){
        this.email = email;
        
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_user(password){
        return pool.query('SELECT person_id,name,email,password_hashed,phone_no,ST_X(location::geometry) as  X,ST_Y(location::geometry) as Y,balance,amount_on_hold FROM person where person.email = $1 and person.password_hashed = $2',[this.email,password]);

    }

    update_balance(credit){
        return pool.query('update person set balance = balance + $1 where email = $2',[credit,this.email]);
    }

    get_balance(){
        return pool.query('select balance,amount_on_hold from person where email = $1',[this.email]);
    }

    
    get_messages(id){
        return pool.query('(SELECT * from direct_item_messages  where person_id = $1) union (SELECT * from auction_item_messages where person_id = $1)  ',[id]);
    }

    add_auction_product(aitem_id,category,name,desc,price,seller_id,quantity,start_time,close_time)
    {
        return pool.query('Insert into auction_item(aitem_id,identifier,name,description,price,seller_id,status,physical_product,quantity,delivery_factor,start_time,close_time) values($1,$2,$3,$4,$5,$6,\'open\',true,$7,1,$8,$9);',[aitem_id,category,name,desc,price,seller_id,quantity,start_time,close_time]);

    }

    add_direct_product(ditem_id,category,name,desc,price,seller_id,quantity)
    {   console.log(ditem_id);
        console.log(name);
        console.log(seller_id);
        console.log(desc);
        console.log(quantity);
        console.log(category);
        console.log(price);
        return pool.query('INSERT INTO direct_sale_item(ditem_id,identifier,name,description,price,seller_id,status,physical_product,quantity,delivery_factor) values($1,$2,$3,$4,$5,$6,\'open\',true,$7,1.00) ',[ditem_id,category,name,desc,price,seller_id,quantity]);

    }

    get_new_aitem_id()
    {
        return pool.query('select * from auction_item order by aitem_id desc limit 1;');

    }

    get_new_ditem_id()
    {
        return pool.query('select * from direct_sale_item order by ditem_id desc limit 1;');

    }

    get_direct_search_results_sales(id)
    {
        return pool.query('select * from direct_sale_item where seller_id = $1;',[id]);
    }

    get_auction_search_results_sales(id)
    {
        return pool.query('select * from auction_item where seller_id = $1;',[id]);
    
    }

    get_direct_search_results_purchases(id)
    {
        return pool.query('select * from direct_sale_item where buyer_id = $1;',[id]);
    }

    get_auction_search_results_purchases(id)
    {
        return pool.query('select * from auction_item where best_bidder = $1;',[id]);
    
    }

};

