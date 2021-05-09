import csv
import os
import random
from hashlib import sha256

#seeding constants used
seedphnomin=6000000000
seedphnomax=9999999999
seedbalance=1000.0
seedloccount=5
seedlocations=['SRID=4326;POINT(83.2185 17.6868)','SRID=4326;POINT(78.4867 17.3850)','SRID=4326;POINT(80.6480 16.5062)','SRID=4326;POINT(72.8777 19.0760)','SRID=4326;POINT(77.4977 27.2046)']
seednumcust=10000 #updated during customer.csv construction
seedqtymax=5
seeddfmax=3
seeddfvalues=[0,0.08,0.125,0.25]
seedstarttime='2021-03-19 12:30:30'
seedendtime='2021-05-19 12:30:30'

namesizelimit = 150
tagsizelimit = 100
taglimit = 3

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
    	fields = ['person_id', 'name', 'email', 'password_hashed', 'phone_no', 'location', 'balance', 'amount_on_hold']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	for row in csvreader:
    		phno = random.randint(seedphnomin,seedphnomax)
            locidx = random.randint(0,seedloccount-1)
    		csvwriter.writerow([row[0],row[1],row[1]+'@emercado.com',"298fc689",phno,seedlocations[locidx],seedbalance,0.0])
    		if(seednumcust<=int(row[0])):
    			break

# with open('Datagen/customer.csv', 'w') as f:
#     with open('Data/namesnoduplicates.csv', mode='r') as infile:
#     	fields = ['person_id', 'location', 'balance', 'amount_on_hold', 'sales', 'sales_rating', 'rated_sales']
#     	csvwriter = csv.writer(f)  
#     	csvwriter.writerow(fields)
#     	csvreader = csv.reader(infile)
#     	header = next(csvreader)  
#     	for row in csvreader:
#     		csvwriter.writerow([row[0],seedlocation,seedbalance,0.0,0,0.0,0])
#     		if(seednumcust<=int(row[0])):
#     			break


with open('Datagen/auction_item.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','name','description','price','seller_id','status','physical_product','quantity','delivery_factor','best_bidder','best_bid','start_time','close_time']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
        dnames = dict()
    	for row in csvreader: #discounted price is used as (base) price
    		if (row[7]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
            if row[3] in dnames:
                dnames[row[3]] += 1
                if dnames[row[3]] > 3:
                    continue
            else:
                dnames[row[3]] = 1
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[3],row[10].replace('\n', ' ').replace('"','').replace('\'',''),row[7],custid,'open','true',qty,seeddfvalues[df],'NULL','NULL',seedstarttime,seedendtime])
    		idx += 1

with open('Datagen/direct_sale_item.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','name','description','price','seller_id','status','physical_product','quantity','delivery_factor','buyer_id']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
        dnames = dict()
    	for row in csvreader: #retail price is used as price
    		if (row[6]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
            if row[3] in dnames:
                dnames[row[3]] += 1
                if dnames[row[3]] > 3:
                    continue
            else:
                dnames[row[3]] = 1
    		custid = random.randint(1,seednumcust)
    		qty = random.randint(1,seedqtymax)
    		df = random.randint(0,seeddfmax)
    		csvwriter.writerow([idx,row[3],row[10].replace('\n', ' ').replace('"','').replace('\'',''),row[6],custid,'open','true',qty,df,'NULL'])
    		idx += 1
            

with open('Datagen/auction_item_tags.csv', 'w') as f:
    with open('Data/flipkart_com-ecommerce_sample.csv', mode='r') as infile:
    	fields = ['aitem_id','tag']
    	csvwriter = csv.writer(f)  
    	csvwriter.writerow(fields)
    	csvreader = csv.reader(infile)
    	header = next(csvreader)  
    	idx = 1
        dnames = dict()
    	for row in csvreader: 
    		if (row[6]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
            if row[3] in dnames:
                dnames[row[3]] += 1
                if dnames[row[3]] > 3:
                    continue
            else:
                dnames[row[3]] = 1
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		seenpair = set()
    		tagcnt = 0
            for cat in catlist:
                if tagcnt >= taglimit:
                    break
                if cat in seenpair:
                    continue
                if (len(cat)>tagsizelimit):
                    continue
                csvwriter.writerow([idx,cat])
                tagcnt += 1
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
        dnames = dict()
    	for row in csvreader: 
    		if (row[6]==""):
    			continue
    		if (len(row[3])>namesizelimit):
    			continue
            if row[3] in dnames:
                dnames[row[3]] += 1
                if dnames[row[3]] > 3:
                    continue
            else:
                dnames[row[3]] = 1
    		cattree = row[4]
    		catlist = cattree.strip('["] ').split(" >> ")
    		seenpair = set()
            tagcnt = 0
    		for cat in catlist:
                if tagcnt >= taglimit:
                    break
    			if cat in seenpair:
    				continue
    			if (len(cat)>tagsizelimit):
    				continue
    			csvwriter.writerow([idx,cat])
                tagcnt += 1
    			seenpair.add(cat)
    		idx += 1   	