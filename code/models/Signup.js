
const pool= require('../utils/database');
module.exports = class Signup{

    constructor(id,name,email,password,phone_no,latitude,longitude,balance){
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone_no = phone_no;
        this.balance  = balance;
        this.latitude = latitude;
        this.longitude = longitude;
        this.personid = id; 


    }

    // add_prod(){
    //     return pool.query('INSERT INTO products(title, price, image, quantity) VALUES ($1, $2, $3, $4);', [this.title, this.price, this.image, this.quantity]);
    // }
    get_personid()
    {
        return pool.query('select * from person order by person_id desc limit 1;');

    }
    insert_user(){
        return pool.query('INSERT INTO person(person_id,name,email,password_hashed,phone_no,location,balance,amount_on_hold) VALUES ($8,$1,$2,$3,$4,ST_setSRid(st_makePOINT($5,$6),4326),$7,0)',[this.name,this.email,this.password,this.phone_no,this.latitude,this.longitude,this.balance,this.personid]);

    }

};

