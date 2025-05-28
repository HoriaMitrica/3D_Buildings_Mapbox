import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const ThreeboxMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...DEFAULT_MAP_CONFIG,
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      setStatus('Initializing Threebox...');

      try {
        const tb = new Threebox(
          map.current,
          map.current.getCanvas().getContext('webgl')!,
          { defaultLights: true }
        );

        let threeboxInstance = tb;

        map.current.addLayer({
          id: 'custom-threebox-model',
          type: 'custom',
          renderingMode: '3d',
          onAdd: function () {
            setStatus('Loading GLB model...');
            
            try {
              threeboxInstance.loadObj({
                obj: '/cantina.glb',
                type: 'glb',
                scale: 20,
                units: 'meters'
              }, function(model: any) {
                try {
                  setStatus('✅ Model loaded! Positioning...');
                  
                  console.log('Model properties:', {
                    type: model.type,
                    name: model.name,
                    children: model.children?.length,
                    boundingBox: model.boundingBox,
                    scale: model.scale,
                    position: model.position
                  });
                  
                  model.setCoords([26.1025, 44.4268, 0]);
                  
                  model.setScale(20);
                  
                  if (model.setObjectScale) {
                    model.setObjectScale(2000);
                  }
                  
                  model.setCoords([26.1025, 44.4268, 0]);
                  
                  console.log('After scaling and positioning:', {
                    scale: model.scale,
                    position: model.position,
                    coordinates: model.coordinates
                  });
                  
                  threeboxInstance.add(model);
                  
                  if (map.current) {
                    new mapboxgl.Marker({ color: 'red' })
                      .setLngLat([26.1025, 44.4268])
                      .addTo(map.current);
                  }
                  
                  if (map.current) {
                    map.current.flyTo({
                      center: [26.1025, 44.4268],
                      zoom: 18,
                      pitch: 60,
                      bearing: 0
                    });
                  }
                  
                  setStatus('✅ Model added! Camera moved to location. Look for a large scaled model.');
                } catch (error) {
                  console.error('Error adding model:', error);
                  setStatus(`❌ Error adding model: ${error}`);
                }
              });
            } catch (error) {
              console.error('Error loading GLB:', error);
              setStatus(`❌ Error loading GLB: ${error}`);
            }
          },
          render: function () {
            try {
              if (threeboxInstance) {
                threeboxInstance.update();
              }
            } catch (error) {
              console.error('Error in render:', error);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing Threebox:', error);
        setStatus(`❌ Error initializing Threebox: ${error}`);
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div 
        ref={mapContainer} 
        style={{
          width: '100%',
          height: '100vh',
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <strong>Threebox GLB Loader</strong>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          Status: {status}
        </div>
      </div>
    </div>
  );
};

export default ThreeboxMap;
