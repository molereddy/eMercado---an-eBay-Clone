DROP table if exists direct_item_messages;
DROP table if exists auction_item_messages;
DROP TABLE if exists bid;
DROP TABLE if exists direct_sale_item_tags;
DROP TABLE if exists auction_item_tags;
DROP TABLE if exists direct_sale_item;
DROP TABLE if exists auction_item;
DROP TABLE if exists person;

CREATE TABLE person (
	person_id serial,
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
	aitem_id serial,
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
	foreign key(best_bidder) references person on delete set null,
	foreign key(seller_id) references person on delete cascade
);

CREATE TABLE direct_sale_item (
	ditem_id serial,
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
	foreign key(seller_id) references person on delete cascade,
	foreign key(buyer_id) references person on delete set null
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

-- need to ensure that on-hold balances are updated when products kept on sale are deleted
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
	foreign key(person_id) references person on delete cascade
);

CREATE TABLE direct_item_messages(
	message_id 	serial,
	person_id	int,
	ditem_id	int,
	title		varchar(30),
	message_text text,
	message_time timestamp,
	primary key(message_id),
	foreign key(ditem_id) references direct_sale_item on delete cascade,
	foreign key(person_id) references person on delete cascade
);

CREATE TABLE auction_item_messages(
	message_id 	serial,
	person_id	int,
	aitem_id	int,
	title		varchar(30),
	message_text text,
	message_time timestamp,
	primary key(message_id),
	foreign key(aitem_id) references auction_item on delete cascade,
	foreign key(person_id) references person on delete cascade
);

CREATE index receipt_user_1 ON direct_item_messages(person_id);
CREATE index receipt_user_2 ON auction_item_messages(person_id);
CREATE INDEX auslr_idx ON auction_item(seller_id);
CREATE INDEX dsslr_idx ON direct_sale_item(seller_id);
CREATE INDEX dsbyr_idx ON direct_sale_item(buyer_id);
CREATE INDEX autag_idx ON auction_item_tags(tag);
CREATE INDEX dstag_idx ON direct_sale_item_tags(tag);
