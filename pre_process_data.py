#!/bin/python
import csv
import json

max_output_files = 5;

def get_entry(row, headers, value_ids, types):
    entry = {}
    for i in value_ids:
            if types[i] == 'int':
                entry[headers[i]] = int(float(row[i]))
            elif types[i] == 'float':
                entry[headers[i]] = float(row[i])
            elif types[i] == 'string':
                entry[headers[i]] = str(row[i])
    return entry

headerstemp = []
# Read match data from csv
matches = dict()
for i in range(1,48):
    if not (len(matches.keys()) < max_output_files):
            break
    filename = 'master-zones-splitted/master-zones-'+str(i)+'.csv'
    with open(filename, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        headers = reader.next()
        headerstemp = headers
        value_ids = range(0,len(headers))
        types = ['int', 'int', 'int', 'int' ,'string', 'string', 'int', 'int', 'int', 'float', 'string', 'string']
        value_ids.remove(3)

        for row in reader:
            if matches.has_key(row[3]):
                matches[row[3]].append(get_entry(row, headers, value_ids, types))
            elif len(matches.keys()) < max_output_files:
                matches[row[3]] = [get_entry(row, headers, value_ids, types)]
            else:
                break

# Write a matches.js file which contains the names of all matches (to be read by combobox).
with open('data/matches.js', 'w') as outfile:
    outfile.write("matches = ")
    json.dump(matches.keys(), outfile)

# write match data of each match to a seperate file.
for match in matches:
    with open('data/geoplot/'+str(match)+'.js', 'w') as outfile:
        outfile.write("data = ")
        json.dump(matches[match], outfile)

# Read master distance data from csvfile
master_distance = dict()
for match in matches:
    master_distance[match] = dict()

with open('master-distance/master-distance.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    headers = reader.next() #[match   team   tsync   DD   Tier   Win Lose]
    types = ['int', 'string', 'int', 'float', 'string', 'int']
    #value_ids = range(0,len(headers))
    #value_ids.remove(0)
    value_ids = [2,3]
    for row in reader:
        if master_distance.has_key(row[0]):
            if master_distance[row[0]].has_key(row[1]):
                master_distance[row[0]][row[1]].append(get_entry(row, headers, value_ids, types))
            else:
                master_distance[row[0]][row[1]] = [get_entry(row, headers, value_ids, types)]

# write master-distance data of each match to a seperate file.
for match in master_distance:
    with open('data/distance/'+str(match)+'_master-distance.js', 'w') as outfile:
        outfile.write("distanceData = ")
        json.dump(master_distance[match], outfile)

# write heat data of each match to a seperate file.
heatmap = dict()
counts = []
for match in matches:
    map_per_tsync = dict()
    for tsync in matches[match]:
        element = tsync["tsync"]
        if map_per_tsync.has_key(element):
            is_set = False
            for entry in map_per_tsync[element]:
                if entry["x"] == tsync["x"] and entry["y"] == tsync["y"]:
                    entry["count"] += 1
                    print entry["count"]
                    is_set = True
                    break
                pass
            if not is_set:
                map_per_tsync[element].append({"x": tsync["x"], "y": tsync["y"], "count": 1})
        else:
            map_per_tsync[element] = [{"x": tsync["x"], "y": tsync["y"], "count": 1}]
    heatmap[match] = map_per_tsync

for match in heatmap:
    with open('data/heatmap/'+str(match)+'.js', 'w') as outfile:
        outfile.write("heatmapData = ")
        json.dump(heatmap[match], outfile)