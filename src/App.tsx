import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { KolkataMap } from './components/KolkataMap';
import { LocationCard } from './components/LocationCard';
import { ComparisonModal } from './components/ComparisonModal';
import { ReportWaitModal } from './components/ReportWaitModal';
import { WhyEstimateModal } from './components/WhyEstimateModal';
import { TimeTravelController } from './components/TimeTravelController';
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

export function App() {
  // State
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_KOLKATA_LOCATIONS);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [userOrigin, setUserOrigin] = useState<UserOrigin>(POPULAR_ORIGINS[0]); // Park Street default
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSort, setActiveSort] = useState<SortFilterOption>('fastest_total');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>('gov-kasba-rto'); // Kasba RTO default for instant demo
  
  // Time simulation (Defaults to 15:00 = 3 PM Tuesday as highlighted in prompt example)
  const [simulatedHour, setSimulatedHour] = useState<number>(15);
  const [isLiveTime, setIsLiveTime] = useState<boolean>(false);

  // Modal states
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isWhyEstimateOpen, setIsWhyEstimateOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isFutureVisionOpen, setIsFutureVisionOpen] = useState<boolean>(false);

  const [activeModalLocation, setActiveModalLocation] = useState<LocationWithTravel | null>(null);

  // Load stored community observations from localStorage on mount
  useEffect(() => {
    const stored = getStoredObservations();
    setObservations(stored);
  }, []);

  // Enrich all locations with dynamic wait calculations and travel times
  const enrichedLocations: LocationWithTravel[] = useMemo(() => {
    return locations.map((loc) => {
      // Run transparent prediction engine calculation
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

      // Open now filter
      if (activeSort === 'open_now' && item.status !== 'open') {
        return false;
      }

      return true;
    });

    // Sorting
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

  // Generate Comparison Data
  const comparisonData: ComparisonData | null = useMemo(() => {
    const target = activeModalLocation || selectedLocation;
    if (!target) return null;
    return generateComparison(target, enrichedLocations);
  }, [activeModalLocation, selectedLocation, enrichedLocations]);

  // Generate Prediction Breakdown
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

    // Update observations state
    setObservations((prev) => [newRecord, ...prev]);

    // Update the specific location's observations count and last updated timestamp in state
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

  const handleResetLive = () => {
    const nowHour = new Date().getHours();
    setSimulatedHour(nowHour);
    setIsLiveTime(true);
  };

  const handleHourChange = (newHour: number) => {
    setSimulatedHour(newHour);
    setIsLiveTime(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-800 font-sans selection:bg-lavender-200">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentOrigin={userOrigin}
        onSelectOrigin={setUserOrigin}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenFutureVision={() => setIsFutureVisionOpen(true)}
        totalLocationsCount={locations.length}
      />

      {/* 2. Landing Hero Section */}
      <HeroSection
        onExploreMap={() => {
          const mapEl = document.getElementById('kolkata-map-section');
          mapEl?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onSelectQuickSearch={(q) => setSearchQuery(q)}
      />

      {/* 3. Category & Filter Controls */}
      <CategoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        totalFilteredCount={filteredLocations.length}
      />

      {/* 4. Main Map & Intelligence Section */}
      <main id="kolkata-map-section" className="flex-1 flex flex-col relative min-h-[580px] lg:min-h-[640px]">
        {/* Full-width Kolkata Map */}
        <div className="w-full h-full min-h-[580px] lg:min-h-[640px] relative">
          <KolkataMap
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
            userOrigin={userOrigin}
            onMapClickOrigin={setUserOrigin}
          />

          {/* Floating Time Travel Controller (Top Center of Map) */}
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:left-6 z-10 max-w-sm sm:max-w-md">
            <TimeTravelController
              simulatedHour={simulatedHour}
              onHourChange={handleHourChange}
              onResetLive={handleResetLive}
              isLive={isLiveTime}
            />
          </div>

          {/* Floating Selected Location Card (Desktop: Top Right, Mobile: Bottom Overlay) */}
          {selectedLocation && (
            <div className="absolute z-20 right-4 top-20 sm:top-4 bottom-4 sm:bottom-auto max-h-[88%] sm:max-h-[82vh] overflow-y-auto w-[calc(100%-32px)] sm:w-auto">
              <LocationCard
                location={selectedLocation}
                onClose={() => setSelectedLocationId(null)}
                onOpenCompare={(loc) => {
                  setActiveModalLocation(loc);
                  setIsCompareOpen(true);
                }}
                onOpenReport={(loc) => {
                  setActiveModalLocation(loc);
                  setIsReportOpen(true);
                }}
                onOpenWhyEstimate={(loc) => {
                  setActiveModalLocation(loc);
                  setIsWhyEstimateOpen(true);
                }}
                simulatedHour={simulatedHour}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer info bar */}
      <footer className="bg-cream-200/80 border-t border-lavender-100 py-2.5 px-4 text-center text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>GhostQueue</strong> — Kolkata's Waiting-Time Intelligence Layer. Built for urban decision making.
          </span>
          <div className="flex items-center gap-3 text-[11px] text-charcoal-400">
            <span>Seeded with 100+ Kolkata Hubs</span>
            <span>•</span>
            <button 
              onClick={() => setIsFutureVisionOpen(true)}
              className="hover:text-lavender-700 underline underline-offset-2"
            >
              City-Wide Waiting Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        data={comparisonData}
        onSelectCandidate={(cand) => setSelectedLocationId(cand.id)}
      />

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
