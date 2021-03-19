import csv
import os
import random
from hashlib import sha256

#hashing password
h = sha256()
h.update(b'R@^d0M~@$$#0%&')

#seeding constants used
seedphnomin=6000000000
seedphnomax=9999999999
seedpassword=h.hexdigest()
seedbalance=1000.0
seedlocation='SRID=4326;POINT(0 49)'
seedcity='somecitythatguylives'
seednumcust=100000 #updated during customer.csv construction
seedqtymax=5
seeddfmax=2
seedstarttime='2021-03-19 12:30:30'
seedendtime='2021-05-19 12:30:30'


#gen scripts

with open('Datagen/person.csv', 'w') as f:
    with open('Data/StateNames.csv', mode='r') as infile:
    	fields = ['person_id', 'name', 'email', 'password_hashed', 'phone_no', 'role']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	for row in csvreader:
    		phno = random.randint(seedphnomin,seedphnomax)
    		csvwriter.writerow([row[0],row[1],row[1]+'@emercado.com',seedpassword,phno,'customer'])
    		if(seednumcust<=int(row[0])):
    			break

with open('Datagen/customer.csv', 'w') as f:
    with open('Data/StateNames.csv', mode='r') as infile:
    	fields = ['person_id', 'location', 'city', 'state', 'balance', 'amount_on_hold', 'sales', 'sales_rating', 'rated_sales']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	for row in csvreader:
    		csvwriter.writerow([row[0],seedlocation,seedcity,row[4],seedbalance,0.0,0,0.0,0])
    		if(seednumcust<=int(row[0])):
    			break


with open('Datagen/auction_item.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','identifier','name','description','price','seller_id','status','physical_product','quantity','delivery_factor','best_bidder','best_bid','start_time','close_time']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: #discounted price is used as (base) price
    		if (row[7]==""):
    			continue
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[0],row[3],row[10].replace('\n', ' ').replace('"','\''),row[7],custid,'open','true',qty,df,'NULL','NULL',seedstarttime,seedendtime])
    		idx += 1

with open('Datagen/direct_sale_item.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','identifier','name','description','price','seller_id','status','physical_product','quantity','delivery_factor','buyer_id']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: #retail price is used as price
    		if (row[6]==""):
    			continue
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[0],row[3],row[10].replace('\n', ' ').replace('"','\''),row[6],custid,'open','true',qty,df,'NULL'])
    		idx += 1
            

with open('Datagen/auction_item_tags.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','tag']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: #discounted price is used as (base) price
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		for cat in catlist:
    			csvwriter.writerow([idx,cat])
    		idx += 1

with open('Datagen/direct_sale_item_tags.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','tag']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: #discounted price is used as (base) price
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		for cat in catlist:
    			csvwriter.writerow([idx,cat])
    		idx += 1    	