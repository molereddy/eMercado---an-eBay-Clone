 \copy public.person FROM './Datagen/person.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
 \copy public.customer FROM './Datagen/customer.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
 \copy public.auction_item FROM './Datagen/auction_item.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
 \copy public.direct_sale_item FROM './Datagen/direct_sale_item.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
 \copy public.auction_item_tags FROM './Datagen/auction_item_tags.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
 \copy public.direct_sale_item_tags FROM './Datagen/direct_sale_item_tags.csv' DELIMITER ',' CSV HEADER NULL 'NULL' QUOTE '"' ESCAPE '''';
