import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const OBJMap: React.FC = () => {
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

      setStatus('Loading OBJ model...');

      const tb = new Threebox(
        map.current,
        map.current.getCanvas().getContext('webgl')!,
        { defaultLights: true }
      );

      map.current.addLayer({
        id: 'obj-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
          // Try to load OBJ file (if available)
          tb.loadObj({
            obj: '/models/buildings/cantinaUTCB.obj', // OBJ version
            mtl: '/models/buildings/cantinaUTCB.mtl', // Material file
            type: 'obj',
            scale: 1,
            units: 'meters'
          }, function(model: any) {
            setStatus('✅ OBJ Model loaded successfully!');
            
            // Position the model at the university location
            model.setCoords([26.1025, 44.4268, 0]); // Bucharest coordinates
            tb.add(model);
          });
        },
        render: function () {
          tb.update();
        }
      });
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
      
      {/* Status Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <strong>OBJ Model Loader</strong>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          Status: {status}
        </div>
        <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>
          Alternative to corrupted GLTF file
        </div>
      </div>
    </div>
  );
};

export default OBJMap; 