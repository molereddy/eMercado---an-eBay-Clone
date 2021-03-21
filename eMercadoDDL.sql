DROP TABLE if exists bid;
DROP TABLE if exists direct_sale_item_tags;
DROP TABLE if exists auction_item_tags;
DROP TABLE if exists direct_sale_item;
DROP TABLE if exists auction_item;
DROP TABLE if exists customer;
DROP TABLE if exists person;


CREATE TABLE person (
	person_id serial int,
	name varchar(25),
	email varchar(50) not null unique,
	password_hashed varchar(64),
	phone_no varchar(15),
	location geography(point,4326),
	balance float,
	amount_on_hold float check(amount_on_hold<=balance),
	primary key(person_id)
);



CREATE TABLE auction_item (
	aitem_id serial int,
	identifier varchar(32),
	name varchar(150),
	description text,
	price float,
	seller_id int not null,
	status varchar(20) check(status='open' or status='closed' or status='auctioned' or 
		status='shipping' or status='shipped' or status='out-for-delivery' or status='delivered'),
	physical_product boolean,
	quantity int default 1 check(quantity>0),
	delivery_factor float check(delivery_factor>=0),
	best_bidder int,
	best_bid float check(best_bid is null or best_bid>=price),
	start_time timestamp,
	close_time timestamp check(close_time>start_time),
	primary key(aitem_id), 
	foreign key(best_bidder) references customer on delete set null,
	foreign key(seller_id) references customer on delete cascade
);

CREATE TABLE direct_sale_item (
	ditem_id serial int,
	identifier varchar(32),
	name varchar(150),
	description text,
	price float,
	seller_id int not null,
	status varchar(25) check(status='open' or status='closed' or status='sold' or 
		status='shipping' or status='shipped' or status='out-for-delivery' or status='delivered'),
	physical_product boolean,
	quantity int default 1 check(quantity>0),
	delivery_factor float check(delivery_factor>=0),
	buyer_id int,
	primary key(ditem_id),
	foreign key(seller_id) references customer on delete cascade,
	foreign key(buyer_id) references customer on delete set null
);

CREATE TABLE auction_item_tags (
	identifier int,
	tag varchar(100),
	primary key(identifier,tag),
	foreign key(identifier) references auction_item on delete cascade
);

CREATE TABLE direct_sale_item_tags (
	identifier int,
	tag varchar(100),
	primary key(identifier,tag),
	foreign key(identifier) references direct_sale_item on delete cascade
);

-- need to ensure that on-hold balances are updated when products kept ofr sale are deleted
CREATE TABLE bid (
	aitem_id int,
	person_id int,
	auto_mode boolean,
	bid_limit float,
	bid_value float,
	status varchar(20) check(status='rejected, removed' or status='running' or status='accepted'),
	time timestamp,
	primary key(aitem_id,person_id),
	foreign key(aitem_id) references auction_item on delete cascade,
	foreign key(person_id) references customer on delete cascade
);
