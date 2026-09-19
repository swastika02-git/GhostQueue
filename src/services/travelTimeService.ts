import { UserOrigin, TravelInfo, LocationItem, LocationWithTravel, WaitLevel } from '../types';

export const POPULAR_ORIGINS: UserOrigin[] = [
  {
    name: 'Park Street (Central Kolkata)',
    shortName: 'Park Street',
    latitude: 22.5510,
    longitude: 88.3525,
  },
  {
    name: 'Salt Lake Sector V (Tech Hub)',
    shortName: 'Sector V',
    latitude: 22.5700,
    longitude: 88.4320,
  },
  {
    name: 'Howrah Station (Riverfront West)',
    shortName: 'Howrah Stn',
    latitude: 22.5830,
    longitude: 88.3420,
  },
  {
    name: 'Jadavpur 8B (South Kolkata)',
    shortName: 'Jadavpur',
    latitude: 22.4980,
    longitude: 88.3710,
  },
  {
    name: 'New Town Action Area 1 (Rajarhat)',
    shortName: 'New Town',
    latitude: 22.5880,
    longitude: 88.4650,
  },
  {
    name: 'Garia Crossing (South Corridor)',
    shortName: 'Garia',
    latitude: 22.4650,
    longitude: 88.3840,
  },
  {
    name: 'Behala Chowrasta (South West)',
    shortName: 'Behala',
    latitude: 22.4920,
    longitude: 88.3150,
  },
  {
    name: 'Shyambazar 5-Point (North Kolkata)',
    shortName: 'Shyambazar',
    latitude: 22.6020,
    longitude: 88.3720,
  }
];

// Calculate Haversine distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Calculate realistic Kolkata travel time accounting for urban road circuity, peak hours, and river crossing
export function calculateTravelTime(
  origin: UserOrigin,
  destinationLat: number,
  destinationLng: number,
  hourOfDay: number = 14
): TravelInfo {
  const straightLineKm = calculateDistanceKm(
    origin.latitude,
    origin.longitude,
    destinationLat,
    destinationLng
  );

  // Kolkata road distance factor: roads curve through historic dense neighborhoods
  const roadKm = straightLineKm * 1.35;

  // Determine urban speed based on hour of day
  const isMorningPeak = hourOfDay >= 9 && hourOfDay <= 11;
  const isEveningPeak = hourOfDay >= 17 && hourOfDay <= 20;
  
  let averageSpeedKmh = 24; // default urban speed
  if (isMorningPeak || isEveningPeak) {
    averageSpeedKmh = 17; // peak congestion in Kolkata
  } else if (hourOfDay >= 21 || hourOfDay <= 6) {
    averageSpeedKmh = 34; // night/early morning fluid traffic
  }

  let travelMinutes = Math.round((roadKm / averageSpeedKmh) * 60);

  // Check if crossing Hooghly river (e.g. Howrah on west < 88.348 vs Kolkata east > 88.348)
  const isOriginWestOfRiver = origin.longitude < 88.345;
  const isDestWestOfRiver = destinationLng < 88.345;
  if (isOriginWestOfRiver !== isDestWestOfRiver) {
    // Add bridge transit penalty (Vidyasagar Setu or Howrah Bridge approaches)
    travelMinutes += 12;
  }

  // Minimum realistic travel time
  travelMinutes = Math.max(3, travelMinutes);

  return {
    distanceKm: parseFloat(roadKm.toFixed(1)),
    travelTimeMinutes: travelMinutes,
    transitMode: roadKm > 4 ? 'car' : 'transit',
  };
}

export function determineWaitLevel(currentWait: number, dataSource: string): WaitLevel {
  if (dataSource === 'learning' || currentWait <= 0) {
    return 'learning';
  }
  if (currentWait < 20) {
    return 'low';
  }
  if (currentWait <= 45) {
    return 'moderate';
  }
  return 'high';
}

export function enrichLocationWithTravel(
  location: LocationItem,
  origin: UserOrigin,
  hourOfDay: number = 14
): LocationWithTravel {
  const travelInfo = calculateTravelTime(origin, location.latitude, location.longitude, hourOfDay);
  const totalTimeMinutes = location.data_source === 'learning' 
    ? travelInfo.travelTimeMinutes 
    : travelInfo.travelTimeMinutes + location.current_wait;
  
  const waitLevel = determineWaitLevel(location.current_wait, location.data_source);

  return {
    ...location,
    travelInfo,
    totalTimeMinutes,
    waitLevel,
  };
}
