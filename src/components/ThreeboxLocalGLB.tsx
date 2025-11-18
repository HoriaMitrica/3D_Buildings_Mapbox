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
  const modelRef = useRef<any>(null);

  // Static coordinates and rotation
  const coordinates = {
    lat: 44.462079,
    lng: 26.120902,
    alt: -0.9
  };

  const rotation = {
    x: 0,
    y: 0,
    z: 206.6 * (Math.PI / 180) // Convert degrees to radians
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.lng, coordinates.lat],
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
            obj: '/cantina5.0.glb',
            type: 'glb',
            scale: scale,
            units: 'meters',
            billboard: false
          };

          window.tb.loadObj(options, (model: any) => {


            modelRef.current = model;

            model.setCoords([coordinates.lng, coordinates.lat, coordinates.alt]);
            model.rotation.x = rotation.x;
            model.rotation.y = rotation.y;
            model.rotation.z = rotation.z;
            model.updateMatrix();

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
    </div>
  );
};

export default ThreeboxLocalGLB; 