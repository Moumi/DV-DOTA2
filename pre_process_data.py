#!/bin/python
import csv
import json

max_output_files = 5;

def get_entry(row, headers, value_ids):
	entry = {}
	for i in value_ids:
		entry[headers[i]] = row[i]
	return entry

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

with open('data/matches.js', 'w') as outfile:
    outfile.write("data = ")
    json.dump(matches.keys(), outfile)

for match in matches:
    with open('data/'+str(match)+'.js', 'w') as outfile:
        outfile.write("data = ")
        json.dump(matches[match], outfile)
