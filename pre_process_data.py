#!/bin/python
import csv
import json

def get_entry(row, headers, value_ids):
	entry = {}
	for i in value_ids:
		entry[headers[i]] = row[i]
	return entry

for i in range(1,48):
	matches = dict()
	filename = 'Data/master-zones-splitted/master-zones-'+str(i)+'.csv'
	with open('Data/master-zones-splitted/master-zones-1.csv', 'rb') as csvfile:
		reader = csv.reader(csvfile)
		headers = reader.next()
		value_ids = range(0,len(headers))
		value_ids.remove(3)

		for row in reader:
			if matches.has_key(row[3]):
				matches[row[3]].append(get_entry(row, headers, value_ids))
			else:
				matches[row[3]] = [get_entry(row, headers, value_ids)]

	with open('json/data'+str(i)+'.js', 'w') as outfile:
		outfile.write("matches = ")
		json.dump(matches, outfile)
