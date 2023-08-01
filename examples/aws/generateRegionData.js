'use strict';

const fs = require('fs');

const rawdata = fs.readFileSync('aws-region-list.json');
const data = JSON.parse(rawdata);

// eslint-disable-next-line prettier/prettier
const regionLookup = {  "AK": "West",  "AL": "Southeast",  "AR": "Southeast",  "AZ": "Southwest",  "CA": "West",  "CO": "West",  "CT": "Northeast",  "DC": "Northeast",  "DE": "Northeast",  "FL": "Southeast",  "GA": "Southeast",  "HI": "West",  "IA": "Midwest",  "ID": "West",  "IL": "Midwest",  "IN": "Midwest",  "KS": "Midwest",  "KY": "Southeast",  "LA": "Southeast",  "MA": "Northeast",  "MD": "Northeast",  "ME": "Northeast",  "MI": "Midwest",  "MN": "Midwest",  "MO": "Midwest",  "MS": "Southeast",  "MT": "West",  "NC": "Southeast",  "ND": "Midwest",  "NE": "Midwest",  "NH": "Northeast",  "NJ": "Northeast",  "NM": "Southwest",  "NV": "West",  "NY": "Northeast",  "OH": "Midwest",  "OK": "Southwest",  "OR": "West",  "PA": "Northeast",  "RI": "Northeast",  "SC": "Southeast",  "SD": "Midwest",  "TN": "Southeast",  "TX": "Southwest",  "UT": "West",  "VA": "Southeast",  "VT": "Northeast",  "WA": "West",  "WI": "Midwest",  "WV": "Southeast",  "WY": "West" };

/*
 * example output
  {
    "awsRegion": "us-east-1",
    "regionDescription": "AWS us-east-1",
    "regionCity": "Ashburn",
    "regionState": "VA",
    "regionZip": "20147",
    "regionCountry": "USA",
    "geoLat": "39.0005066",
    "geoLng": "-77.4794089",
    "statusQueryGuid": "MjQyNzM4MnxBUE18QVBQTElDQVRJT058MzQ1MTg3MDg3",
    "workloadGuid": "MjQyNzM4MnxOUjF8V09SS0xPQUR8NjE5MzA",
    "runbookURL": "https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit",
    "contact": "throck@newrelic.com"
  }
*/

const mapLocations = data.reduce((p, v) => {
  const {
    geoLat,
    geoLng,
    awsRegion,
    regionAddress,
    regionCity,
    regionState,
    regionZip,
    regionCountry,
    regionDescription,
    statusQueryGuid,
    workloadGuid,
    contact,
    runbookURL
  } = v;

  const mapLocation = {
    externalId: awsRegion,
    title: awsRegion,
    location: {
      municipality: regionCity,
      region: regionState,
      country: regionCountry,
      postalCode: regionZip,
      description: regionDescription,
      lat: geoLat,
      lng: geoLng
    },
    query:
      `FROM Transaction SELECT average(duration) FACET entityGuid, appName WHERE entityGuid in ('${statusQueryGuid}')`,
    entities: [
      {
        guid: workloadGuid,
        entityType: 'WORKLOAD_ENTITY'
      }
    ],
    contactEmail: contact,
    runbookUrl: runbookURL
  };

  p.push(mapLocation);
  return p;
}, []);
// console.log(JSON.stringify(mapLocations, null, 2))

const byRegion = mapLocations.reduce((p, v) => {
  const state = v.location.region;
  const region = regionLookup[state];
  // console.log(region);

  if (!p[region]) {
    p[region] = [];
  }

  p[region].push(v);

  return p;
}, {});
// console.log(JSON.stringify(byRegion, null, 2));

Object.entries(byRegion).forEach(([k, v]) => {
  const fileName = `sample-data-${k.toLowerCase()}.json`;
  const fileOutput = {
    items: v
  };
  const fileData = JSON.stringify(fileOutput, null, 2);
  fs.writeFileSync(fileName, fileData);
});
