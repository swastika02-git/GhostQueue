import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KolkataMap } from './components/KolkataMap';
import { RightPanel } from './components/RightPanel';
import { ReportWaitModal } from './components/ReportWaitModal';
import { WhyEstimateModal } from './components/WhyEstimateModal';
import { FutureVisionModal } from './components/FutureVisionModal';

import { INITIAL_KOLKATA_LOCATIONS } from './data/kolkataLocations';
import { POPULAR_ORIGINS, enrichLocationWithTravel } from './services/travelTimeService';
import { calculatePredictedWait, generateComparison } from './services/predictionEngine';
import { getStoredObservations, saveObservation } from './services/storageService';
import { 
  LocationItem, 
  LocationWithTravel, 
  UserOrigin, 
  CategoryType, 
  SortFilterOption, 
  ComparisonData, 
  PredictionBreakdown,
  ObservationRecord 
} from './types';
import { MapPin, List, Sparkles } from 'lucide-react';

export function App() {
  // Core State
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_KOLKATA_LOCATIONS);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [userOrigin, setUserOrigin] = useState<UserOrigin>(POPULAR_ORIGINS[0]); // Park Street default
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Section 3: "Fastest overall" should be the default because this is GhostQueue's differentiating feature
  const [activeSort, setActiveSort] = useState<SortFilterOption>('fastest_total');
  
  // Default selected location for immediate demonstration (Kasba RTO)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>('gov-kasba-rto');
  
  // Time simulation
  const [simulatedHour, setSimulatedHour] = useState<number>(15); // 3 PM Tuesday

  // Mobile View Toggle ('map' | 'panel')
  const [mobileView, setMobileView] = useState<'map' | 'panel'>('map');

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isWhyEstimateOpen, setIsWhyEstimateOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isFutureVisionOpen, setIsFutureVisionOpen] = useState<boolean>(false);
  const [activeModalLocation, setActiveModalLocation] = useState<LocationWithTravel | null>(null);

  // Load stored community observations from localStorage
  useEffect(() => {
    const stored = getStoredObservations();
    setObservations(stored);
  }, []);

  // Enrich all locations with dynamic wait estimates & travel calculations
  const enrichedLocations: LocationWithTravel[] = useMemo(() => {
    return locations.map((loc) => {
      const prediction = calculatePredictedWait(loc, observations, simulatedHour, 2);
      
      const updatedLoc: LocationItem = {
        ...loc,
        current_wait: prediction.predictedWait,
        confidence: prediction.confidence,
        data_source: prediction.dataSource,
      };

      return enrichLocationWithTravel(updatedLoc, userOrigin, simulatedHour);
    });
  }, [locations, observations, simulatedHour, userOrigin]);

  // Filter and sort locations
  const filteredLocations: LocationWithTravel[] = useMemo(() => {
    let result = enrichedLocations.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSubcat = item.subcategory.toLowerCase().includes(q);
        const matchArea = item.area.toLowerCase().includes(q);
        const matchAddress = item.address.toLowerCase().includes(q);
        const matchServices = item.popular_services?.some((s) => s.toLowerCase().includes(q)) ?? false;
        if (!matchName && !matchSubcat && !matchArea && !matchAddress && !matchServices) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    result.sort((a, b) => {
      if (activeSort === 'fastest_total') {
        return a.totalTimeMinutes - b.totalTimeMinutes;
      }
      if (activeSort === 'lowest_wait') {
        return a.current_wait - b.current_wait;
      }
      if (activeSort === 'nearest') {
        return a.travelInfo.distanceKm - b.travelInfo.distanceKm;
      }
      if (activeSort === 'high_confidence') {
        return b.confidence - a.confidence;
      }
      return a.totalTimeMinutes - b.totalTimeMinutes;
    });

    return result;
  }, [enrichedLocations, selectedCategory, searchQuery, activeSort]);

  // Selected Location object
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return enrichedLocations.find((l) => l.id === selectedLocationId) || null;
  }, [selectedLocationId, enrichedLocations]);

  // Comparison Data for currently selected location
  const comparisonData: ComparisonData | null = useMemo(() => {
    if (!selectedLocation) return null;
    return generateComparison(selectedLocation, enrichedLocations);
  }, [selectedLocation, enrichedLocations]);

  // Prediction Breakdown for explainability
  const predictionBreakdown: PredictionBreakdown | null = useMemo(() => {
    const target = activeModalLocation || selectedLocation;
    if (!target) return null;
    const res = calculatePredictedWait(target, observations, simulatedHour, 2);
    return res.breakdown;
  }, [activeModalLocation, selectedLocation, observations, simulatedHour]);

  // Handle community report submission
  const handleObservationSubmit = (
    locationId: string,
    waitTimeMinutes: number,
    peopleVisible?: number,
    activeCounters?: number,
    serviceType?: string,
    note?: string
  ) => {
    const newRecord = saveObservation({
      location_id: locationId,
      wait_time: waitTimeMinutes,
      reported_by: 'Community member',
      people_visible: peopleVisible,
      active_counters: activeCounters,
      service_type: serviceType,
      note,
    });

    setObservations((prev) => [newRecord, ...prev]);

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            observations_count: loc.observations_count + 1,
            last_updated: 'Just now',
            last_updated_timestamp: Date.now(),
            data_source: 'community',
          };
        }
        return loc;
      })
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FAF8F5] text-charcoal-800 font-sans overflow-hidden">
      {/* 1. COMPACT FUNCTIONAL NAVBAR (No giant hero section!) */}
      <Navbar
        currentOrigin={userOrigin}
        onSelectOrigin={setUserOrigin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        totalCount={filteredLocations.length}
        simulatedHour={simulatedHour}
        onHourChange={setSimulatedHour}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenFutureVision={() => setIsFutureVisionOpen(true)}
      />

      {/* 2. MAP-FIRST MAIN WORKSPACE (Desktop: Map Left, Panel Right) */}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-0 w-full overflow-hidden">
        {/* LEFT / MAIN: Real Interactive Kolkata Leaflet Map */}
        <div className={`flex-1 h-full min-h-0 relative ${mobileView === 'panel' ? 'hidden lg:block' : 'block'}`}>
          <KolkataMap
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => {
              setSelectedLocationId(loc.id);
              setMobileView('panel');
            }}
            userOrigin={userOrigin}
            onMapClickOrigin={setUserOrigin}
          />
        </div>

        {/* RIGHT: Compact Intelligent Panel (Search results / Selected location / Comparison) */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] h-full shrink-0 shadow-soft-lg z-20 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          <RightPanel
            selectedLocation={selectedLocation}
            onClearSelectedLocation={() => setSelectedLocationId(null)}
            locations={filteredLocations}
            onSelectLocation={(loc) => {
              setSelectedLocationId(loc.id);
              setMobileView('panel');
            }}
            onOpenReport={(loc) => {
              setActiveModalLocation(loc);
              setIsReportOpen(true);
            }}
            onOpenWhyEstimate={(loc) => {
              setActiveModalLocation(loc);
              setIsWhyEstimateOpen(true);
            }}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            simulatedHour={simulatedHour}
            comparisonData={comparisonData}
          />
        </div>

        {/* Mobile Floating View Switcher Button */}
        <div className="lg:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'panel' : 'map')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-charcoal-900 text-white font-bold text-xs shadow-soft-xl"
          >
            {mobileView === 'map' ? (
              <>
                <List className="w-4 h-4 text-lavender-300" />
                <span>View Locations List</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>View Kolkata Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODALS */}
      <ReportWaitModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        location={activeModalLocation || selectedLocation}
        onSubmitReport={handleObservationSubmit}
      />

      <WhyEstimateModal
        isOpen={isWhyEstimateOpen || isHowItWorksOpen}
        onClose={() => {
          setIsWhyEstimateOpen(false);
          setIsHowItWorksOpen(false);
        }}
        location={activeModalLocation || selectedLocation || enrichedLocations[0]}
        breakdown={predictionBreakdown}
      />

      <FutureVisionModal
        isOpen={isFutureVisionOpen}
        onClose={() => setIsFutureVisionOpen(false)}
      />
    </div>
  );
}

export default App;
