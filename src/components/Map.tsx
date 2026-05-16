import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import type { Dam } from '@/types/dam';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DamMarker from './DamMarker';
import { getDamSource, parseDamNumber } from '@/lib/dam-data';
import type { DamSource, DamSourceFilter } from '@/types/dam';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface MapProps {
  dams: Dam[];
  lastUpdate?: string;
  lastUpdates?: Partial<Record<DamSource, string>>;
  sourceFilter: DamSourceFilter;
  onSourceFilterChange: (source: DamSourceFilter) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const sourceLabels: Record<DamSourceFilter, string> = {
  all: "All",
  KSEB: "KSEB",
  Irrigation: "Irrigation",
};

const getSourceAccentClasses = (source: DamSourceFilter) => {
  switch (source) {
    case "KSEB":
      return "border-blue-500/40 text-blue-700 dark:text-blue-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600";
    case "Irrigation":
      return "border-teal-600/40 text-teal-700 dark:text-teal-300 data-[state=on]:bg-teal-600 data-[state=on]:text-white data-[state=on]:border-teal-600";
    default:
      return "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";
  }
};

const Map = ({ dams, lastUpdate, lastUpdates, sourceFilter, onSourceFilterChange }: MapProps) => {
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
                source={(markerDiv as any).source || 'KSEB'}
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
      const waterLevelPercentage = parseDamNumber(dam.data[0]?.storagePercentage) ?? 0;
      
      // Store data on the div for updates
      (markerDiv as any).damName = dam.name;
      (markerDiv as any).waterLevel = waterLevelPercentage;
      (markerDiv as any).source = getDamSource(dam);
      
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
          source={getDamSource(dam)}
          isCollapsed={mapboxMap.current.getZoom() < (viewportWidth < 768 ? 10 : 9)}
        />
      );

      // click handler
      markerDiv.addEventListener('click', () => {
        navigate(`/${encodeURIComponent(dam.name)}?source=${getDamSource(dam)}`);
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute bottom-1.5 left-1.5 z-[15] sm:bottom-2 sm:left-2"
      >
        <ToggleGroup
          type="single"
          value={sourceFilter}
          onValueChange={(value) => value && onSourceFilterChange(value as DamSourceFilter)}
          className="grid grid-cols-3 rounded-lg border border-border/60 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:bg-zinc-900/95"
        >
          {(["all", "KSEB", "Irrigation"] as DamSourceFilter[]).map((source) => (
            <ToggleGroupItem
              key={source}
              value={source}
              className={`h-8 rounded-md border border-transparent px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs ${getSourceAccentClasses(source)}`}
            >
              {sourceLabels[source]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </motion.div>
      {(lastUpdate || lastUpdates) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute right-3 sm:right-5 top-3 sm:top-5 z-[15]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-border/50 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/90 animate-pulse" />
            <span className="text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200 whitespace-nowrap font-medium">
              {lastUpdates?.KSEB && lastUpdates?.Irrigation
                ? `KSEB ${lastUpdates.KSEB} · Irrigation ${lastUpdates.Irrigation}`
                : `Updated ${lastUpdate || lastUpdates?.KSEB || lastUpdates?.Irrigation}`}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Map;
