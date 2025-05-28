import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import MapboxMap from './components/MapboxMap';
import ThreeboxMap from './components/ThreeboxMap';
import MapboxExample from './components/MapboxExample';
import GLTFDebugger from './components/GLTFDebugger';
import OBJMap from './components/OBJMap';
import ThreeboxLocalGLB from './components/ThreeboxLocalGLB';

function App() {
  const location = useLocation();
  const isExampleRoute = location.pathname === '/example';

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
      {!isExampleRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<MapboxMap />} />
        <Route path="/threebox" element={<ThreeboxMap />} />
        <Route path="/example" element={<MapboxExample />} />
        <Route path="/debug" element={<GLTFDebugger />} />
        <Route path="/obj" element={<OBJMap />} />
        <Route path="/threebox-local" element={<ThreeboxLocalGLB />} />
      </Routes>
    </div>
  );
}

export default App;
