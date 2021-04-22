
const pool= require('../utils/database');
module.exports = class Login{

    constructor( email){
        this.email = email;
        
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_user(password){
        return pool.query('SELECT * FROM person where person.email = $1 and person.password_hashed = $2',[this.email,password]);

    }

    update_balance(credit){
        return pool.query('update person set balance = balance + $1 where email = $2',[credit,this.email]);
    }

    get_balance(){
        return pool.query('select balance from person where email = $1',[this.email]);
    }

};

