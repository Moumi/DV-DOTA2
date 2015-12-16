#!/bin/python
import csv
import json
import os

max_matches_per_tier = 5;
tiers = {"Normal":0, "High":0, "VeryHigh":0, "Pro":0}


def get_entry(row, headers, value_ids, types):
    entry = {}
    for i in value_ids:
            if row[i] == 'NA':
                return 0
            if types[i] == 'int':
                entry[headers[i]] = int(float(row[i]))
            elif types[i] == 'float':
                entry[headers[i]] = float(row[i])
            elif types[i] == 'string':
                entry[headers[i]] = str(row[i])
    return entry

if not os.path.exists("data"):
    os.makedirs("data")
if not os.path.exists("data/geoplot"):
    os.makedirs("data/geoplot")
if not os.path.exists("data/heatmap"):
    os.makedirs("data/heatmap")
if not os.path.exists("data/distance"):
    os.makedirs("data/distance")

headerstemp = []
# Read match data from csv
matches = dict()
print "Processing:"
for i in range(1,48):
    Continue = False
    for tier in tiers.keys():
        if tiers[tier] < max_matches_per_tier:
            Continue = True
    if not Continue:
        break;

    filename = '../Data/master-zones-'+str(i)+'.csv'
    with open(filename, 'rb') as csvfile:
        print " "+filename
        reader = csv.reader(csvfile)
        headers = reader.next()
        headerstemp = headers
        value_ids = [1,2,4,5,8,10]
        types = ['int', 'int', 'int', 'int' ,'string', 'string', 'int', 'int', 'int', 'float', 'string', 'string']

        for row in reader:
            entry = get_entry(row, headers, value_ids, types)
            if entry != 0:
                if matches.has_key(row[3]):
                    matches[row[3]].append(entry)
                elif tiers[row[10]] < max_matches_per_tier:
                        matches[row[3]] = [entry]
                        tiers[row[10]] += 1
                else:
                    pass

# Write a matches.js file which contains the names of all matches (to be read by combobox).
print "Writing:"
filename = 'data/matches.js'
with open(filename, 'w') as outfile:
    print " "+filename
    outfile.write("matches = ")
    match_info = []
    for match in matches.keys():
        entry = {}
        entry["match"] = match
        entry["tier"] = matches[match][0]["tier"]
        match_info.append(entry)
    json.dump(match_info, outfile)

# write match data of each match to a seperate file.
for match in matches:
    filename = 'data/geoplot/'+str(match)+'.js'
    with open(filename, 'w') as outfile:
        print " "+filename
        outfile.write("data = ")
        json.dump(matches[match][::5], outfile)

# Read master distance data from csvfile
master_distance = dict()
for match in matches:
    master_distance[match] = dict()

filename = "../Data/master-distance.csv"
print "Processing:"
with open(filename, 'rb') as csvfile:
    print " "+filename
    reader = csv.reader(csvfile)
    headers = reader.next() #[match   team   tsync   DD   Tier   Win Lose]
    types = ['int', 'string', 'int', 'float', 'string', 'int']
    #value_ids = range(0,len(headers))
    #value_ids.remove(0)
    value_ids = [2,3]
    for row in reader:
        if master_distance.has_key(row[0]):
            entry = get_entry(row, headers, value_ids, types)
            if entry != 0:
                if master_distance[row[0]].has_key(row[1]):
                    master_distance[row[0]][row[1]].append(entry)
                else:
                    master_distance[row[0]][row[1]] = [entry]

# write master-distance data of each match to a seperate file.
print "Writing"
for match in master_distance:
    distances = {}
    distances["radiant"] = master_distance[match]["radiant"][::5]
    distances["dire"] = master_distance[match]["dire"][::5]
    filename = 'data/distance/'+str(match)+'_master-distance.js'
    with open(filename, 'w') as outfile:
        print " "+filename
        outfile.write("distanceData = ")
        json.dump(distances, outfile)

# write heat data of each match to a seperate file.
print "Processing:\n heatmap"
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
                    is_set = True
                    break
                pass
            if not is_set:
                map_per_tsync[element].append({"x": tsync["x"], "y": tsync["y"], "count": 1})
        else:
            map_per_tsync[element] = [{"x": tsync["x"], "y": tsync["y"], "count": 1}]
    heatmap[match] = map_per_tsync

print "Writing:"
for match in heatmap:
    filename = 'data/heatmap/'+str(match)+'.js'
    with open(filename, 'w') as outfile:
        print " "+filename
        outfile.write("heatmapData = ")
        json.dump(heatmap[match], outfile)
print "Collected data from:"
for tier in tiers:
    print " "+tier+" tier: "+str(tiers[tier])+" matches"
