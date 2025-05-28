import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const ThreeboxMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...DEFAULT_MAP_CONFIG
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      // Add 3D buildings layer first
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      // Add 3D buildings
      map.current.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );

      // Initialize Threebox for custom 3D objects
      const tb = new Threebox(
        map.current,
        map.current.getCanvas().getContext('webgl'),
        {
          defaultLights: true,
        }
      );

      // Add a custom layer for Threebox objects
      map.current.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
          // Create a simple 3D cube
          const cube = tb.cube({
            width: 50,
            height: 50,
            depth: 50,
            color: 0xff0000,
            material: 'MeshLambertMaterial'
          });

          // Position the cube at University of Bucharest coordinates
          cube.setCoords([26.1025, 44.4268, 100]);
          tb.add(cube);

          // Create a sphere
          const sphere = tb.sphere({
            radius: 25,
            color: 0x00ff00,
            material: 'MeshLambertMaterial'
          });

          // Position sphere near the university
          sphere.setCoords([26.1035, 44.4268, 150]);
          tb.add(sphere);

          // Animate the objects
          const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            sphere.rotation.x += 0.02;
            sphere.rotation.z += 0.01;
            
            tb.update();
            requestAnimationFrame(animate);
          };
          animate();
        },
        render: function () {
          tb.update();
        }
      });
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '100vh' 
      }} 
    />
  );
};

export default ThreeboxMap; 