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

const ThreeboxLocalGLB: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [26.1025, 44.4268],
      zoom: 18,
      pitch: 60,
      bearing: 0,
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
          
          const scale = 1;
          const options = {
            obj: '/cantina.glb',
            type: 'glb',
            scale: scale,
            units: 'meters'
          };

          window.tb.loadObj(options, (model: any) => {
            console.log('Model loaded:', {
              type: model.type,
              children: model.children?.length,
              scale: model.scale,
              position: model.position,
              boundingBox: model.boundingBox
            });
            
            // Don't override model position - use its original metadata
            window.tb.add(model);
            
            console.log('Model at original position:', {
              coordinates: model.coordinates,
              position: model.position,
              scale: model.scale
            });
            
            // Focus camera on the model's actual location
            if (mapRef.current && model.coordinates) {
              const [lng, lat] = model.coordinates;
              mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 18,
                pitch: 60,
                bearing: 0
              });
              
              // Add marker at model's actual location
              new mapboxgl.Marker({ color: 'red' })
                .setLngLat([lng, lat])
                .addTo(mapRef.current);
            }
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

export default ThreeboxLocalGLB; 