export type CategoryType = 
  | 'all'
  | 'healthcare' 
  | 'government' 
  | 'transport' 
  | 'finance' 
  | 'education' 
  | 'services';

export type WaitLevel = 'low' | 'moderate' | 'high' | 'learning';

export type DataSourceType = 'community' | 'simulated' | 'learning';

export interface LocationItem {
  id: string;
  name: string;
  category: Exclude<CategoryType, 'all'>;
  subcategory: string;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  opening_hours: string;
  average_service_time: number; // in minutes
  historical_wait: number;      // baseline minutes
  current_wait: number;         // computed/estimated wait in minutes
  confidence: number;           // 0 to 100 percentage
  last_updated: string;         // formatted string e.g. "4 min ago" or "Just now"
  last_updated_timestamp: number; // epoch ms
  data_source: DataSourceType;
  observations_count: number;
  number_of_counters: number;
  active_counters: number;
  status: 'open' | 'closing_soon' | 'closed';
  popular_services?: string[];
  trend: number;                 // percentage change in last hour e.g. +18 or -10
  current_situation: string;    // qualitative snippet
  typical_wait: number;         // typical wait at current simulated slot
  hourly_curve?: number[];      // 24-hr profile (hours 0..23)
}

export interface ObservationRecord {
  id: string;
  location_id: string;
  wait_time: number;            // estimated wait in minutes reported
  timestamp: number;            // epoch ms
  reported_by: string;          // e.g. "Community member"
  people_visible?: number;
  active_counters?: number;
  service_type?: string;
  note?: string;
}

export interface UserOrigin {
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  isCustom?: boolean;
}

export interface TravelInfo {
  distanceKm: number;
  travelTimeMinutes: number;
  transitMode: 'car' | 'transit' | 'walk';
}

export interface LocationWithTravel extends LocationItem {
  travelInfo: TravelInfo;
  totalTimeMinutes: number; // travelTimeMinutes + current_wait
  waitLevel: WaitLevel;
}

export interface ComparisonCandidate {
  location: LocationItem;
  travelTimeMinutes: number;
  waitTimeMinutes: number;
  totalTimeMinutes: number;
  distanceKm: number;
  timeSavedAgainstBase: number;
  isFastestOverall: boolean;
  isNearest: boolean;
  isBase: boolean;
}

export interface ComparisonData {
  baseLocation: LocationItem;
  candidates: ComparisonCandidate[];
  fastestCandidate: ComparisonCandidate;
  nearestCandidate: ComparisonCandidate;
  maxTimeSaved: number;
  recommendationExplanation: string;
}

export interface PredictionBreakdown {
  baselineWait: number;
  observationsWeight: number;
  recentObservationsAvg: number;
  recentObservationsCount: number;
  counterDelayFactor: number;
  activeCounters: number;
  totalCounters: number;
  confidenceScore: number;
  confidenceFactors: {
    freshnessBoost: number;
    sampleCountBoost: number;
    variancePenalty: number;
  };
  explanationBulletPoints: string[];
}

export type SortFilterOption = 
  | 'fastest_total' 
  | 'lowest_wait' 
  | 'nearest' 
  | 'high_confidence' 
  | 'open_now';
