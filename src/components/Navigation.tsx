import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navStyle: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '250px'
  };

  const linkStyle: React.CSSProperties = {
    display: 'block',
    padding: '8px 12px',
    margin: '4px 0',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    fontSize: '14px'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    backgroundColor: '#007cbf',
    color: 'white'
  };

  return (
    <nav style={navStyle}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
        3D Buildings Map Examples
      </h2>
      
      <Link 
        to="/" 
        style={location.pathname === '/' ? activeLinkStyle : linkStyle}
      >
        🏢 3D Buildings (Main)
      </Link>
      
      <Link 
        to="/threebox" 
        style={location.pathname === '/threebox' ? activeLinkStyle : linkStyle}
      >
        🎲 Threebox Objects
      </Link>
      
      <Link 
        to="/example" 
        style={location.pathname === '/example' ? activeLinkStyle : linkStyle}
      >
        🏗️ Mapbox Example (GLTF)
      </Link>
      
      <Link 
        to="/debug" 
        style={location.pathname === '/debug' ? activeLinkStyle : linkStyle}
      >
        🔍 GLTF Debugger
      </Link>
      
      <Link 
        to="/obj" 
        style={location.pathname === '/obj' ? activeLinkStyle : linkStyle}
      >
        📦 OBJ Loader
      </Link>
      
      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#666'
      }}>
        Click to switch between examples
      </div>
    </nav>
  );
};

export default Navigation; 