DROP TABLE if exists bid;
DROP TABLE if exists direct_sale_item_tags;
DROP TABLE if exists auction_item_tags;
DROP TABLE if exists direct_sale_item;
DROP TABLE if exists auction_item;
DROP TABLE if exists customer;
DROP TABLE if exists person;


CREATE TABLE person (
	person_id int,
	name text,
	email text,
	password_hashed text,
	phone_no text,
	role text check(role='manager' or role='customer' or role='admin'),
	primary key(person_id)
);

CREATE TABLE customer (
	person_id int,
	location geography(point,4326),
	city text,
	state text,
	balance float,
	amount_on_hold float check(amount_on_hold>=balance),
	sales int,
	sales_rating float check(sales_rating between 0 and 5),
	rated_sales int check(sales>=rated_sales),
	primary key(person_id),
	foreign key(person_id) references person on delete cascade
);

CREATE TABLE auction_item (
	aitem_id int,
	identifier text,
	name text,
	description text,
	price float,
	status text check(status='open' or status='closed' or status='auctioned' or 
		status='shipping' or status='shipped' or status='out-for-delivery' or status='delivered'),
	physial_product boolean,
	quantity int check(quantity>0),
	delivery_factor float check(delivery_factor>=0),
	best_price_bidder int,
	best_price float check(best_price is null or best_price>=price),
	start_time timestamp,
	close_time timestamp check(close_time>start_time),
	seller_id int not null,
	primary key(aitem_id), 
	foreign key(best_price_bidder) references customer on delete set null,
	foreign key(seller_id) references customer on delete cascade
);

CREATE TABLE direct_sale_item (
	ditem_id int,
	identifier text,
	name text,
	description text,
	price float,
	status text check(status='open' or status='closed' or status='sold' or 
		status='shipping' or status='shipped' or status='out-for-delivery' or status='delivered'),
	physial_product boolean,
	quantity int check(quantity>0),
	delivery_factor float check(delivery_factor>=0),
	seller_id int not null,
	buyer_id int,
	primary key(ditem_id),
	foreign key(seller_id) references customer on delete cascade,
	foreign key(buyer_id) references customer on delete set null
);

CREATE TABLE auction_item_tags (
	aitem_id int,
	tag text,
	primary key(aitem_id,tag),
	foreign key(aitem_id) references auction_item on delete cascade
);

CREATE TABLE direct_sale_item_tags (
	ditem_id int,
	tag text,
	primary key(ditem_id,tag),
	foreign key(ditem_id) references direct_sale_item on delete cascade
);

CREATE TABLE bid (
	aitem_id int,
	person_id int,
	auto_mode boolean,
	bid_limit float,
	bid_value float,
	status text check(status='rejected, item removed' or status='running' or status='accepted' or status='rejected'),
	time timestamp,
	primary key(aitem_id,person_id),
	foreign key(aitem_id) references auction_item on delete cascade,
	foreign key(person_id) references customer on delete cascade
);
