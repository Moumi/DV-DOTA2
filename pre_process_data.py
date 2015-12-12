#!/bin/python
import csv
import json

max_output_files = 5;

def get_entry(row, headers, value_ids):
	entry = {}
	for i in value_ids:
		entry[headers[i]] = row[i]
	return entry

# Read match data from csv
matches = dict()
for i in range(1,48):
	if not (len(matches.keys()) < max_output_files):
            break
	filename = 'master-zones-splitted/master-zones-'+str(i)+'.csv'
	with open(filename, 'rb') as csvfile:
		reader = csv.reader(csvfile)
		headers = reader.next()
		value_ids = range(0,len(headers))
		value_ids.remove(3)

		for row in reader:
			if matches.has_key(row[3]):
				matches[row[3]].append(get_entry(row, headers, value_ids))
			elif len(matches.keys()) < max_output_files:
				matches[row[3]] = [get_entry(row, headers, value_ids)]
                        else:
                            break

# Write a matches.js file which contains the names of all matches (to be read by combobox).
with open('data/matches.js', 'w') as outfile:
    outfile.write("matches = ")
    json.dump(matches.keys(), outfile)

# write match data of each match to a seperate file.
for match in matches:
    with open('data/'+str(match)+'.js', 'w') as outfile:
        outfile.write("data = ")
        json.dump(matches[match], outfile)

# Read master distance data from csvfile
master_distance = dict()
for match in matches:
    master_distance[match] = []

with open('master-distance/master-distance.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    headers = reader.next()
    value_ids = range(0,len(headers))
    value_ids.remove(0)
    for row in reader:
        if master_distance.has_key(row[0]):
                master_distance[row[0]].append(get_entry(row, headers, value_ids))

# write master-distance data of each match to a seperate file.
for match in master_distance:
    with open('data/'+str(match)+'_master-distance.js', 'w') as outfile:
        outfile.write("distanceData = ")
        json.dump(master_distance[match], outfile)