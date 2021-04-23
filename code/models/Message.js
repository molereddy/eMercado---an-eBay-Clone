
const pool= require('../utils/database');
module.exports = class Message{

    constructor(item_id,person_id,title,text,timestamp){
        this.item_id = item_id;
        this.person_id = person_id;
        this.text = text;
        this.title = title;
        this.timestamp = timestamp;

        
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    send_direct_message(){
        return pool.query('INSERT INTO direct_item_messages(ditem_id,person_id,title,message_text,message_time) values($1,$2,$3,$4,$5)',[this.item_id,this.person_id,this.title,this.text,this.timestamp]);
    }
    
    send_auction_message(){
        return pool.query('INSERT INTO auction_item_messages(aitem_id,person_id,title,message_text,message_time) values($1,$2,$3,$4,$5)',[this.item_id,this.person_id,this.title,this.text,this.timestamp]);
    }

    
    
};

