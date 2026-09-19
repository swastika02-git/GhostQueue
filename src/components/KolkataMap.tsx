import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationWithTravel, UserOrigin } from '../types';
import { Locate, RotateCcw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Central Kolkata
    const map = L.map(mapContainerRef.current, {
      center: [22.5626, 88.3639],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    });

    // Use CartoDB Positron tiles for calm, soft, clutter-free pastel aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Map click sets custom origin
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickOrigin) {
        onMapClickOrigin({
          name: `Custom Point (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`,
          shortName: 'Pinned Location',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          isCustom: true,
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Origin Marker
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
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([userOrigin.latitude, userOrigin.longitude], {
      icon: originIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindTooltip(`<strong>You are here:</strong> ${userOrigin.shortName}`, {
      direction: 'top',
      offset: [0, -14],
      className: 'pastel-tooltip',
    });

    originMarkerRef.current = marker;
  }, [userOrigin]);

  // Update Location Markers
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
            <span style="font-size: 10px; opacity: 0.85;">⏱</span>
            <span>${waitText}</span>
          </div>
        `,
        iconSize: [52, 28],
        iconAnchor: [26, 14],
      });

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      marker.bindTooltip(`
        <div style="padding: 2px 4px; font-family: inherit;">
          <div style="font-weight: 700; font-size: 12px; color: #2D2938;">${loc.name}</div>
          <div style="font-size: 11px; color: #6C657E; margin-top: 1px;">
            ${loc.subcategory} · Total: ${loc.totalTimeMinutes}m (${loc.travelInfo.travelTimeMinutes}m travel + ${loc.current_wait}m wait)
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -14],
        className: 'pastel-tooltip',
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(loc);
      });

      marker.addTo(markersGroup);
    });
  }, [locations, selectedLocation, onSelectLocation]);

  // Pan to selected location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 14, {
      duration: 1.2,
    });
  }, [selectedLocation]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([22.5626, 88.3639], 12, { duration: 1 });
  };

  const handlePanToOrigin = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([userOrigin.latitude, userOrigin.longitude], 14, { duration: 1 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#FAF8F5] overflow-hidden">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handlePanToOrigin}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-soft border border-lavender-100 text-charcoal-700 hover:text-lavender-700 hover:bg-lavender-50 transition-all"
          title="Center on starting point"
          aria-label="Center on starting point"
        >
          <Locate className="w-4 h-4 text-lavender-600" />
        </button>

        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-soft border border-lavender-100 text-charcoal-700 hover:text-lavender-700 hover:bg-lavender-50 transition-all"
          title="Reset to Kolkata city view"
          aria-label="Reset to Kolkata city view"
        >
          <RotateCcw className="w-4 h-4 text-charcoal-500" />
        </button>
      </div>

      {/* Map Legend (Bottom Right on Desktop, Soft Pastel Badges) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-soft border border-lavender-100 text-xs hidden sm:flex items-center gap-3">
        <span className="font-bold text-charcoal-800 text-[11px] uppercase tracking-wider">Wait</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-low-dot" />
          <span className="text-charcoal-600 font-medium">&lt;20m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-moderate-dot" />
          <span className="text-charcoal-600 font-medium">20–45m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-high-dot" />
          <span className="text-charcoal-600 font-medium">&gt;45m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-learning-dot" />
          <span className="text-charcoal-600 font-medium">Learning</span>
        </div>
      </div>
    </div>
  );
};
