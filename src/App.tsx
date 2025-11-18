import { Routes, Route } from 'react-router-dom';
import ThreeboxLocalGLB from './components/ThreeboxLocalGLB';

function App() {

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
      {/* {!isExampleRoute && <Navigation />} */}
      <Routes>
        {/* <Route path="/" element={<MapboxMap />} />
         <Route path="/threebox" element={<ThreeboxMap />} />
        <Route path="/example" element={<MapboxExample />} />
        <Route path="/debug" element={<GLTFDebugger />} />
        <Route path="/obj" element={<OBJMap />} /> */} 
        <Route path="/" element={<ThreeboxLocalGLB />} />
      </Routes>
    </div>
  );
}

export default App;
