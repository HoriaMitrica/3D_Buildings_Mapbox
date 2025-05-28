import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap: React.FC = () => {
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

      // Add 3D buildings layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      // Add 3D buildings using Mapbox's built-in extrusion
      map.current.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#ff6b6b',
              '#aaa'
            ],
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
            'fill-extrusion-opacity': 0.8
          }
        },
        labelLayerId
      );

      // Add hover effect for buildings
      let hoveredBuildingId: string | number | undefined = undefined;

      map.current.on('mousemove', 'add-3d-buildings', (e) => {
        if (!map.current) return;
        
        if (e.features && e.features.length > 0) {
          if (hoveredBuildingId !== undefined) {
            map.current.setFeatureState(
              { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
              { hover: false }
            );
          }
          hoveredBuildingId = e.features[0].id;
          if (hoveredBuildingId !== undefined) {
            map.current.setFeatureState(
              { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
              { hover: true }
            );
          }
        }
      });

      map.current.on('mouseleave', 'add-3d-buildings', () => {
        if (!map.current) return;
        
        if (hoveredBuildingId !== undefined) {
          map.current.setFeatureState(
            { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
            { hover: false }
          );
        }
        hoveredBuildingId = undefined;
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'add-3d-buildings', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'add-3d-buildings', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    );

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

export default MapboxMap; 