import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import type { Dam } from '@/types/dam';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DamMarker from './DamMarker';

interface MapProps {
  dams: Dam[];
  lastUpdate?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ dams, lastUpdate }: MapProps) => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapboxMap = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapResize = () => {
      if (mapboxMap.current) {
        mapboxMap.current.resize();
      }
    };

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    mapboxMap.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [77.0394, 9.9956],
      zoom: 8.9,
      pitch: 0,
      bearing: 0,
      minZoom: 6,
      maxZoom: 15,
      doubleClickZoom: false,
      interactive: true
    });

    window.addEventListener('resize', handleMapResize);

    // Update markers when map moves
    mapboxMap.current.on('move', () => {
      const zoom = mapboxMap.current?.getZoom() || 0;
      const viewportWidth = window.innerWidth;
      const markers = document.querySelectorAll('.mapboxgl-marker');
      
      markers.forEach(marker => {
        const markerDiv = marker.querySelector('.dam-marker')?.parentElement;
        if (markerDiv) {
          const root = (markerDiv as any)._root;
          if (root) {
            root.render(
              <DamMarker 
                damName={(markerDiv as any).damName || ''}
                waterLevel={(markerDiv as any).waterLevel || 0}
                isCollapsed={zoom < (viewportWidth < 768 ? 10 : 9)}
              />
            );
          }
        }
      });
    });

    return () => {
      window.removeEventListener('resize', handleMapResize);
      if (mapboxMap.current) {
        mapboxMap.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapboxMap.current) return;

    // Update map on container resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapboxMap.current) {
        mapboxMap.current.resize();
      }
    });

    resizeObserver.observe(mapRef.current);

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => {
      const root = (marker as any)._root;
      if (root) {
        root.unmount();
      }
      marker.remove();
    });

    // Calculate marker scale based on viewport width
    const viewportWidth = window.innerWidth;
    const markerScale = viewportWidth < 768 ? 0.5 : 0.7;

    // Add markers for each dam
    dams.forEach(dam => {
      const markerDiv = document.createElement('div');
      markerDiv.style.transform = `scale(${markerScale})`; 
      const waterLevelPercentage = parseFloat(dam.data[0]?.storagePercentage || "0");
      
      // Store data on the div for updates
      (markerDiv as any).damName = dam.name;
      (markerDiv as any).waterLevel = waterLevelPercentage;
      
      const marker = new mapboxgl.Marker({
        element: markerDiv
      })
        .setLngLat([dam.longitude, dam.latitude])
        .addTo(mapboxMap.current!);

      // Initial render
      (markerDiv as any)._root = createRoot(markerDiv);
      (markerDiv as any)._root.render(
        <DamMarker 
          damName={dam.name} 
          waterLevel={waterLevelPercentage}
          isCollapsed={mapboxMap.current.getZoom() < (viewportWidth < 768 ? 10 : 9)}
        />
      );

      // click handler
      markerDiv.addEventListener('click', () => {
        navigate(`/${dam.name}`);
      });
    });

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newScale = newWidth < 768 ? 0.5 : 0.7;
      document.querySelectorAll('.mapboxgl-marker').forEach((marker) => {
        (marker as HTMLElement).style.transform = `scale(${newScale})`;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach(marker => {
        const root = (marker as any)._root;
        if (root) {
          root.unmount();
        }
        marker.remove();
      });
    };
  }, [dams, navigate]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} className="touch-none">
      <div ref={mapRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      {lastUpdate && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute right-3 sm:right-5 top-3 sm:top-5 z-[15]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-border/50 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/90 animate-pulse" />
            <span className="text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200 whitespace-nowrap font-medium">Updated {lastUpdate}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Map;
