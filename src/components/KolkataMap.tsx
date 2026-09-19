import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationWithTravel, UserOrigin } from '../types';
import { Locate, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface KolkataMapProps {
  locations: LocationWithTravel[];
  selectedLocation: LocationWithTravel | null;
  onSelectLocation: (loc: LocationWithTravel) => void;
  userOrigin: UserOrigin;
  onMapClickOrigin?: (origin: UserOrigin) => void;
}

export const KolkataMap: React.FC<KolkataMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  userOrigin,
  onMapClickOrigin,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5450, 88.3650], // Centered on Kolkata urban zone
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add high-reliability OpenStreetMap tile layer with soft pastel tone filter
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'pastel-map-tiles',
    }).addTo(map);

    // Add fallback in case tile server is unreachable
    tileLayer.on('tileerror', () => {
      // Tiles can retry automatically
    });

    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Force size recalculation to prevent blank/gray map
    const invalidateTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Attach ResizeObserver to keep tiles crisp upon panel toggling or window resizing
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Map click to change origin
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickOrigin) {
        onMapClickOrigin({
          name: `Pinned Location (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`,
          shortName: 'Pinned Point',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          isCustom: true,
        });
      }
    });

    return () => {
      clearTimeout(invalidateTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Origin Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
    }

    const originIcon = L.divIcon({
      className: 'ghostqueue-origin-wrapper',
      html: `
        <div class="origin-marker-pin" title="Starting point: ${userOrigin.name}">
          <div style="width: 7px; height: 7px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const marker = L.marker([userOrigin.latitude, userOrigin.longitude], {
      icon: originIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindTooltip(`<strong>You are here:</strong> ${userOrigin.shortName}`, {
      direction: 'top',
      offset: [0, -12],
      className: 'pastel-tooltip',
    });

    originMarkerRef.current = marker;
  }, [userOrigin]);

  // Sync Location Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const waitText = loc.data_source === 'learning' ? '?' : `${loc.current_wait}m`;
      const waitClass = `wait-${loc.waitLevel} ${isSelected ? 'is-selected' : ''}`;

      const icon = L.divIcon({
        className: 'ghostqueue-marker',
        html: `
          <div class="marker-pill ${waitClass}">
            <span style="font-size: 10px;">⏱</span>
            <span>${waitText}</span>
          </div>
        `,
        iconSize: [50, 26],
        iconAnchor: [25, 13],
      });

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon,
        zIndexOffset: isSelected ? 800 : 200,
      });

      marker.bindTooltip(`
        <div style="font-family: inherit; max-width: 220px;">
          <div style="font-weight: 700; font-size: 12px; color: #2D2938;">${loc.name}</div>
          <div style="font-size: 11px; color: #6C657E; margin-top: 2px;">
            ${loc.subcategory} · ${loc.area}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #7563A7; margin-top: 3px;">
            Total: ${loc.totalTimeMinutes}m (${loc.travelInfo.travelTimeMinutes}m travel + ${loc.current_wait}m wait)
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -12],
        className: 'pastel-tooltip',
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(loc);
      });

      marker.addTo(markersGroup);
    });
  }, [locations, selectedLocation, onSelectLocation]);

  // Pan to selected location smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 14, {
      duration: 1.0,
    });
  }, [selectedLocation]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([22.5450, 88.3650], 12, { duration: 0.8 });
  };

  const handlePanToOrigin = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([userOrigin.latitude, userOrigin.longitude], 14, { duration: 0.8 });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-[#FAF8F5] overflow-hidden select-none">
      {/* Absolute Leaflet Container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0" 
      />

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={handlePanToOrigin}
          className="p-2 bg-white/95 backdrop-blur-md rounded-xl shadow-soft border border-lavender-100 text-charcoal-700 hover:text-lavender-700 hover:bg-lavender-50 transition-all"
          title="Center on starting location"
          aria-label="Center on starting location"
        >
          <Locate className="w-4 h-4 text-lavender-600" />
        </button>

        <button
          onClick={handleRecenter}
          className="p-2 bg-white/95 backdrop-blur-md rounded-xl shadow-soft border border-lavender-100 text-charcoal-700 hover:text-lavender-700 hover:bg-lavender-50 transition-all"
          title="Reset to Kolkata city view"
          aria-label="Reset to Kolkata city view"
        >
          <RotateCcw className="w-4 h-4 text-charcoal-500" />
        </button>

        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-soft border border-lavender-100 overflow-hidden mt-1">
          <button
            onClick={handleZoomIn}
            className="p-2 text-charcoal-600 hover:bg-lavender-50 hover:text-lavender-700 transition-colors border-b border-lavender-100/60"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-charcoal-600 hover:bg-lavender-50 hover:text-lavender-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom Left, Soft Pastel Badges) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-soft border border-lavender-100 text-xs flex items-center gap-2.5 pointer-events-none">
        <span className="font-bold text-charcoal-800 text-[10px] uppercase tracking-wider">Queue:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-status-low-dot" />
          <span className="text-[11px] text-charcoal-600 font-medium">&lt;20m</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-status-moderate-dot" />
          <span className="text-[11px] text-charcoal-600 font-medium">20–45m</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-status-high-dot" />
          <span className="text-[11px] text-charcoal-600 font-medium">&gt;45m</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-status-learning-dot" />
          <span className="text-[11px] text-charcoal-600 font-medium">Learning</span>
        </div>
      </div>
    </div>
  );
};
