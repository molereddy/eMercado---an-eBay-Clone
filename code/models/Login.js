
const pool= require('../utils/database');
module.exports = class Login{

    constructor( email,password){
        this.email = email;
        this.password = password;
    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_user(){
        return pool.query('SELECT * FROM person where person.email = $1 and person.password_hashed = $2',[this.email,this.password]);

    }

};

