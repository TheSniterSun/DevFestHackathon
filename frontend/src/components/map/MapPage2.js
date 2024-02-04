import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import * as csv2geojson from 'csv2geojson';
import * as turf from '@turf/turf';

import './map.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicGFlYiIsImEiOiJjbHM3MWRwaW4wemZ1MmptdDdyNGgwczU0In0.qcDplwnjXuZJqCs-0lqTLg';

function MapboxMap() {
    
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-73.935, 40.730],
      zoom: 10,
      transformRequest: (url, resourceType) => {
        var isMapboxRequest =
          url.slice(8, 22) === "api.mapbox.com" ||
          url.slice(10, 26) === "tiles.mapbox.com";
        return {
          url: isMapboxRequest
            ? url.replace("?", "?pluginName=sheetMapper&")
            : url
        };
      }
    });

    const fetchData = async () => {
      try {
        const response = await axios.get('https://docs.google.com/spreadsheets/d/1yzDftjjU1xpEdLXdgNZR7fK5gvIotPVYu40RSVr1Y4k/gviz/tq?tqx=out:csv&sheet=mapbox_spreadsheet');

        // console.log(response.data); // Check the actual CSV data

        csv2geojson.csv2geojson(response.data, {
          latfield: 'Latitude',
          lonfield: 'Longitude',
          delimiter: ','
        }, function (err, data) {

          if (err) throw new Error(err);
          map.on('load', () => {
            map.addSource('points', {
              type: 'geojson',
              data: data
            });
            map.addLayer({
              id: 'csvData',
              type: 'symbol',
              source: 'points',
              layout: {
                'icon-image': 'drinking-water-15',
                'icon-size': 1.5
              }
            });
            // Add more map functionalities as needed
          });
        });
      } catch (error) {
        console.error('Error fetching or processing data:', error);


      }
    };

    fetchData();

    return () => map.remove(); // Clean up map instance on component unmount
  }, []);

  return (<>

    <br />

    <h1>Interactive Map</h1>

    <div className="map-container">
        <div id="map" style={{position: 'relative', top: '-75px'}}></div>
    </div>
    
    </>);
};

export default MapboxMap;
