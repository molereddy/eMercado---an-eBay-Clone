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
seednumcust=10000 #updated during customer.csv construction
seedqtymax=5
seeddfmax=2
seedstarttime='2021-03-19 12:30:30'
seedendtime='2021-05-19 12:30:30'

namesizelimit = 150
tagsizelimit = 100

#filtering StateNames.csv to remove duplicate names
with open('Data/namesnoduplicates.csv', 'w') as f:
    with open('Data/StateNames.csv', mode='r') as infile:
    	fields = ['person_id', 'name']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	seenname = set() # set for fast O(1) amortized lookup
    	idx=1
    	for row in csvreader:
    		if(row[1] in seenname):
    			continue
    		csvwriter.writerow([idx,row[1]])
    		seenname.add(row[1])
    		idx += 1

#gen scripts

with open('Datagen/person.csv', 'w') as f:
    with open('Data/namesnoduplicates.csv', mode='r') as infile:
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
    with open('Data/namesnoduplicates.csv', mode='r') as infile:
    	fields = ['person_id', 'location', 'balance', 'amount_on_hold', 'sales', 'sales_rating', 'rated_sales']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	for row in csvreader:
    		csvwriter.writerow([row[0],seedlocation,seedbalance,0.0,0,0.0,0])
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
    		if (len(row[3])>namesizelimit):
    			continue
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[0],row[3],row[10].replace('\n', ' ').replace('"','').replace('\'',''),row[7],custid,'open','true',qty,df,'NULL','NULL',seedstarttime,seedendtime])
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
    		if (len(row[3])>namesizelimit):
    			continue
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[0],row[3],row[10].replace('\n', ' ').replace('"','').replace('\'',''),row[6],custid,'open','true',qty,df,'NULL'])
    		idx += 1
            

with open('Datagen/auction_item_tags.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','tag']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: 
    		if (row[6]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		seenpair = set()
    		for cat in catlist:
    			if cat in seenpair:
    				continue
    			if (len(cat)>tagsizelimit):
    				continue
    			csvwriter.writerow([idx,cat])
    			seenpair.add(cat)
    		idx += 1

with open('Datagen/direct_sale_item_tags.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','tag']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
    	for row in csvreader: 
    		if (row[6]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		seenpair = set()
    		for cat in catlist:
    			if cat in seenpair:
    				continue
    			if (len(cat)>tagsizelimit):
    				continue
    			csvwriter.writerow([idx,cat])
    			seenpair.add(cat)
    		idx += 1   	