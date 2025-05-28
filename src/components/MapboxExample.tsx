import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

declare global {
  interface Window {
    tb: any;
  }
}

const MapboxExample: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.97627, 40.75155],
      zoom: 15.4,
      pitch: 64.9,
      bearing: 172.5,
      antialias: true
    });

    mapRef.current.on('style.load', () => {
      if (!mapRef.current) return;

      mapRef.current.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
          window.tb = new Threebox(
            mapRef.current!,
            mapRef.current!.getCanvas().getContext('webgl')!,
            { defaultLights: true }
          );
          
          const scale = 3.2;
          const options = {
            obj: 'https://docs.mapbox.com/mapbox-gl-js/assets/metlife-building.gltf',
            type: 'gltf',
            scale: { x: scale, y: scale, z: 2.7 },
            units: 'meters',
            rotation: { x: 90, y: -90, z: 0 }
          };

          window.tb.loadObj(options, (model: any) => {
            model.setCoords([-73.976799, 40.754145]);
            model.setRotation({ x: 0, y: 0, z: 241 });
            window.tb.add(model);
          });
        },

        render: function () {
          if (window.tb) {
            window.tb.update();
          }
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        margin: 0,
        padding: 0
      }} 
    />
  );
};

export default MapboxExample; 