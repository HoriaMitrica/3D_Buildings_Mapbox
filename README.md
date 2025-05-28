# 3D Buildings Mapbox App

A React application that displays 3D buildings on an interactive Mapbox map using Mapbox GL JS and Threebox for custom 3D objects.

## Features

- 🏢 **3D Buildings**: Displays extruded 3D buildings from Mapbox's building data
- 🎯 **Interactive Hover Effects**: Buildings highlight when you hover over them
- 🗺️ **Navigation Controls**: Pan, zoom, rotate, and tilt the map
- 📍 **Geolocation**: Find your current location on the map
- 🔄 **Fullscreen Mode**: View the map in fullscreen
- 🎨 **Custom 3D Objects**: Support for adding custom 3D models with Threebox

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- A Mapbox access token (free at [mapbox.com](https://account.mapbox.com/access-tokens/))

## Setup Instructions

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd 3D_Buildings_Mapbox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Mapbox Access Token**:
   - Get a free access token from [Mapbox](https://account.mapbox.com/access-tokens/)
   - Open `src/config/mapbox.ts`
   - Replace `'YOUR_MAPBOX_ACCESS_TOKEN'` with your actual token:
   ```typescript
   export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InlvdXJhY2Nlc3N0b2tlbiJ9...';
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── MapboxMap.tsx      # Main map component with 3D buildings
│   └── ThreeboxMap.tsx    # Alternative component with custom 3D objects
├── config/
│   └── mapbox.ts          # Mapbox configuration and settings
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Available Components

### MapboxMap
The main component that displays:
- 3D extruded buildings from Mapbox data
- Interactive hover effects (buildings turn red on hover)
- Navigation controls
- Geolocation control
- Fullscreen control

### ThreeboxMap
An alternative component that includes:
- All features from MapboxMap
- Custom animated 3D objects (cube and sphere)
- Demonstrates Threebox integration

To use ThreeboxMap instead, replace the import in `App.tsx`:
```typescript
import ThreeboxMap from './components/ThreeboxMap';
// Then use <ThreeboxMap /> instead of <MapboxMap />
```

## Customization

### Map Styles
You can change the map style by modifying `DEFAULT_MAP_CONFIG` in `src/config/mapbox.ts`:
```typescript
export const DEFAULT_MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/dark-v11', // Try different styles
  // ... other config
};
```

Available styles:
- `streets-v12` (default)
- `outdoors-v12`
- `light-v11`
- `dark-v11`
- `satellite-v9`
- `satellite-streets-v12`

### Map Location
Change the default location by updating the `center` coordinates:
```typescript
center: [-74.006, 40.7128] // [longitude, latitude]
```

### Building Colors
Modify the building colors in the `fill-extrusion-color` paint property in `MapboxMap.tsx`.

## Dependencies

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Mapbox GL JS**: Interactive maps
- **Threebox**: 3D objects integration
- **@types/mapbox-gl**: TypeScript definitions

## Troubleshooting

### Map not loading
- Ensure your Mapbox access token is valid and properly set
- Check the browser console for any error messages
- Verify your internet connection

### 3D buildings not appearing
- Make sure you're zoomed in enough (zoom level 15+)
- Try different locations (some areas may not have building data)
- Check that the map style supports 3D buildings

### TypeScript errors
- Run `npm run build` to check for build errors
- Ensure all dependencies are properly installed

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Threebox Documentation](https://github.com/jscastro76/threebox)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
