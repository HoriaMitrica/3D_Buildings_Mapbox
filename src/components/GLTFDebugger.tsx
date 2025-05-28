import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Threebox } from 'threebox-plugin';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ModelInfo {
  loaded: boolean;
  error?: string;
  boundingBox?: any;
  position?: [number, number, number];
  scale?: any;
  rotation?: any;
  metadata?: any;
}

const GLTFDebugger: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo>({ loaded: false });
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGLTFWithThreeJS = () => {
    addLog('🔍 Testing GLB file with Three.js GLTFLoader directly...');
    
    const loader = new GLTFLoader();
    loader.load(
      '/cantina.glb',
      (gltf) => {
        addLog('✅ Three.js GLTFLoader SUCCESS!');
        addLog(`Scene children: ${gltf.scene.children.length}`);
        addLog(`Animations: ${gltf.animations.length}`);
        addLog(`Cameras: ${gltf.cameras.length}`);
        addLog(`Asset generator: ${gltf.asset?.generator || 'Unknown'}`);
        addLog(`Asset version: ${gltf.asset?.version || 'Unknown'}`);
        
        // Check for geospatial extensions
        if (gltf.asset?.extensions) {
          addLog(`Extensions: ${Object.keys(gltf.asset.extensions).join(', ')}`);
        }
        
        // Log scene structure
        gltf.scene.traverse((child) => {
          if (child.userData && Object.keys(child.userData).length > 0) {
            addLog(`Child "${child.name}" userData: ${JSON.stringify(child.userData)}`);
          }
        });
        
        addLog('✅ GLB file is valid - issue is with Threebox compatibility');
      },
      (progress) => {
        addLog(`Three.js loading progress: ${Math.round((progress.loaded / progress.total) * 100)}%`);
      },
      (error: any) => {
        addLog(`❌ Three.js GLTFLoader error: ${error.message}`);
        addLog('This indicates the GLB file itself has issues');
      }
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...DEFAULT_MAP_CONFIG,
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      addLog('Map loaded, initializing Threebox...');

      const tb = new Threebox(
        map.current,
        map.current.getCanvas().getContext('webgl')!,
        { defaultLights: true }
      );

      map.current.addLayer({
        id: 'gltf-debugger',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
          addLog('Loading GLB model...');
          addLog('File path: /cantina.glb');
          
          // First, let's try to fetch the file to check if it exists
          fetch('/cantina.glb')
            .then(response => {
              addLog(`File fetch status: ${response.status} ${response.statusText}`);
              addLog(`File size: ${response.headers.get('content-length')} bytes`);
              addLog(`Content type: ${response.headers.get('content-type')}`);
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.arrayBuffer();
            })
            .then(buffer => {
              addLog(`File loaded successfully, size: ${buffer.byteLength} bytes`);
              
              // Now try to load with Threebox - let it use its own positioning metadata
              addLog('Starting Threebox loadObj...');
              
              // Add a timeout to detect if callback never fires
              let callbackFired = false;
              const timeoutId = setTimeout(() => {
                if (!callbackFired) {
                  addLog('⚠️ TIMEOUT: Threebox loadObj callback never fired after 10 seconds');
                  addLog('This suggests a parsing error or compatibility issue with the GLTF file');
                }
              }, 10000);
              
              try {
                // Add error handling for the loadObj call
                const loadResult: any = tb.loadObj({
                  obj: '/cantina.glb',
                  type: 'glb',
                  scale: 1,
                  units: 'meters'
                }, function(model: any) {
                  callbackFired = true;
                  clearTimeout(timeoutId);
                  addLog('✅ Threebox loadObj SUCCESS - model loaded!');
                  
                  try {
                    // Log all available properties on the model
                    addLog(`Model properties: ${Object.keys(model).join(', ')}`);
                    
                    // Extract model information
                    const info: ModelInfo = {
                      loaded: true,
                      boundingBox: model.boundingBox || model.geometry?.boundingBox,
                      position: model.coordinates || model.position || 'No position metadata',
                      scale: model.scale || { x: 1, y: 1, z: 1 },
                      rotation: model.rotation || { x: 0, y: 0, z: 0 },
                      metadata: {
                        type: model.type,
                        userData: model.userData,
                        name: model.name,
                        uuid: model.uuid
                      }
                    };

                    // Log detailed information
                    addLog(`Model type: ${model.type || 'Unknown'}`);
                    addLog(`Model name: ${model.name || 'Unnamed'}`);
                    
                    // Check if model has its own positioning
                    if (model.coordinates) {
                      addLog(`Model has coordinates: [${model.coordinates.join(', ')}]`);
                    } else if (model.position) {
                      addLog(`Model has position: [${model.position.x}, ${model.position.y}, ${model.position.z}]`);
                    } else {
                      addLog('⚠️ No positioning metadata found in model');
                    }
                    
                    if (model.boundingBox) {
                      const bb = model.boundingBox;
                      addLog(`Bounding box: min(${bb.min.x.toFixed(2)}, ${bb.min.y.toFixed(2)}, ${bb.min.z.toFixed(2)}) max(${bb.max.x.toFixed(2)}, ${bb.max.y.toFixed(2)}, ${bb.max.z.toFixed(2)})`);
                      
                      const size = {
                        width: bb.max.x - bb.min.x,
                        height: bb.max.y - bb.min.y,
                        depth: bb.max.z - bb.min.z
                      };
                      addLog(`Model dimensions: ${size.width.toFixed(2)}m × ${size.height.toFixed(2)}m × ${size.depth.toFixed(2)}m`);
                    } else {
                      addLog('⚠️ No bounding box found');
                    }

                    // Check for geospatial metadata
                    if (model.userData) {
                      addLog(`User data found: ${JSON.stringify(model.userData)}`);
                    } else {
                      addLog('No user data found');
                    }

                    // Add model to scene and position it at the university location
                    addLog('Adding model to scene...');
                    
                    // Check if model needs positioning (currently at [0, 0, 0])
                    if (model.coordinates && model.coordinates[0] === 0 && model.coordinates[1] === 0) {
                      addLog('Model is at [0, 0, 0] - positioning at Romanian university location');
                      model.setCoords([26.1025, 44.4268, 0]); // Bucharest coordinates
                      addLog('✅ Model positioned at [26.1025, 44.4268, 0]');
                    }
                    
                    tb.add(model);
                    
                    setModelInfo(info);
                    addLog('✅ Model added to scene successfully');

                  } catch (error) {
                    addLog(`❌ Error processing loaded model: ${error}`);
                    setModelInfo({ loaded: false, error: String(error) });
                  }
                });
                
                addLog(`Threebox loadObj call completed, returned: ${typeof loadResult}`);
                
                // Log properties of the returned object to understand what we're dealing with
                if (loadResult && typeof loadResult === 'object') {
                  addLog(`LoadResult properties: ${Object.keys(loadResult).join(', ')}`);
                  
                  // Check if it's a promise-like object
                  if ('then' in loadResult && typeof (loadResult as any).then === 'function') {
                    addLog('LoadResult appears to be a Promise');
                    (loadResult as any).then((result: any) => {
                      callbackFired = true;
                      clearTimeout(timeoutId);
                      addLog(`✅ Promise resolved: ${typeof result}`);
                      
                      // The promise resolved but callback didn't fire - this suggests parsing issues
                      if (result === undefined) {
                        addLog('⚠️ Promise resolved to undefined - this may indicate GLTF parsing failed');
                        addLog('The file loads but Threebox cannot parse it properly');
                        setModelInfo({ 
                          loaded: false, 
                          error: 'GLTF file loads but Threebox parsing failed (Promise resolved to undefined)' 
                        });
                        
                        // Automatically test with Three.js to see if it's a Threebox issue
                        setTimeout(() => {
                          testGLTFWithThreeJS();
                        }, 1000);
                      }
                    }).catch((error: any) => {
                      callbackFired = true;
                      clearTimeout(timeoutId);
                      addLog(`❌ Promise rejected: ${error}`);
                      setModelInfo({ loaded: false, error: String(error) });
                    });
                  }
                }
                
                addLog('Waiting for callback... (timeout in 10 seconds)');
                
              } catch (syncError) {
                callbackFired = true;
                clearTimeout(timeoutId);
                addLog(`❌ Synchronous error in loadObj: ${syncError}`);
                setModelInfo({ loaded: false, error: String(syncError) });
              }
            })
            .catch(error => {
              addLog(`File fetch error: ${error.message}`);
              setModelInfo({ loaded: false, error: error.message });
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
      
      {/* Debug Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: '350px',
        maxHeight: '80vh',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '12px',
        overflow: 'auto',
        zIndex: 1000
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>GLB Model Debug Info</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Status:</strong> {modelInfo.loaded ? '✅ Loaded' : '⏳ Loading...'}
          {modelInfo.error && <div style={{ color: 'red' }}>❌ Error: {modelInfo.error}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={testGLTFWithThreeJS}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔍 Test with Three.js GLTFLoader
          </button>
        </div>

        {modelInfo.loaded && (
          <div style={{ marginBottom: '15px' }}>
            <div><strong>Position:</strong> [{modelInfo.position?.join(', ')}]</div>
            <div><strong>Scale:</strong> {JSON.stringify(modelInfo.scale)}</div>
            <div><strong>Rotation:</strong> {JSON.stringify(modelInfo.rotation)}</div>
            {modelInfo.boundingBox && (
              <div><strong>Has Bounding Box:</strong> ✅ Yes</div>
            )}
          </div>
        )}

        <div>
          <strong>Debug Log:</strong>
          <div style={{
            maxHeight: '200px',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            padding: '8px',
            marginTop: '5px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            {debugLogs.map((log, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>{log}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
          <strong>Diagnosis & Solutions:</strong>
          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
            <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>
              🔍 Root Cause: GLTF File Corruption
            </div>
            <div style={{ color: '#856404', fontSize: '10px', lineHeight: '1.4' }}>
              Error: "Invalid typed array length: 117" indicates corrupted binary data in the GLTF file.
            </div>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <strong style={{ fontSize: '11px' }}>Recommended Solutions:</strong>
            <ol style={{ margin: '5px 0', paddingLeft: '15px', fontSize: '10px', lineHeight: '1.4' }}>
              <li><strong>Re-export the model:</strong> Use Blender, 3ds Max, or other 3D software to re-export as GLTF</li>
              <li><strong>Validate the file:</strong> Use <a href="https://gltf-viewer.donmccurdy.com/" target="_blank" style={{ color: '#007cba' }}>GLTF Viewer</a> to check for errors</li>
              <li><strong>Try GLB format:</strong> Export as .glb (binary GLTF) instead of .gltf</li>
              <li><strong>Check file integrity:</strong> Ensure the file wasn't corrupted during transfer</li>
              <li><strong>Use OBJ format:</strong> As a fallback, export as .obj + .mtl files</li>
            </ol>
          </div>
          
          <div style={{ marginTop: '10px', padding: '6px', backgroundColor: '#d1ecf1', borderRadius: '4px', fontSize: '10px' }}>
            <strong>Next Steps:</strong> Please re-export your 3D model using proper GLTF export settings, or try a different format like OBJ.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GLTFDebugger; 