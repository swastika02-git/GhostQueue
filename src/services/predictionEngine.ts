import { 
  LocationItem, 
  LocationWithTravel, 
  ObservationRecord, 
  PredictionBreakdown, 
  ComparisonData, 
  ComparisonCandidate 
} from '../types';

/**
 * Predict wait time using exponential decay for observation freshness,
 * historical diurnal curve, and counter capacity.
 */
export function calculatePredictedWait(
  location: LocationItem,
  observations: ObservationRecord[],
  hourOfDay: number = 14,
  _dayOfWeek: number = 2 // 2 = Tuesday
): {
  predictedWait: number;
  confidence: number;
  dataSource: LocationItem['data_source'];
  breakdown: PredictionBreakdown;
} {
  // If location has learning status and no observations
  const locObservations = observations.filter(o => o.location_id === location.id);

  if (location.data_source === 'learning' && locObservations.length === 0) {
    return {
      predictedWait: 0,
      confidence: 20,
      dataSource: 'learning',
      breakdown: {
        baselineWait: location.historical_wait,
        observationsWeight: 0,
        recentObservationsAvg: 0,
        recentObservationsCount: 0,
        counterDelayFactor: 1,
        activeCounters: location.active_counters,
        totalCounters: location.number_of_counters,
        confidenceScore: 20,
        confidenceFactors: {
          freshnessBoost: 0,
          sampleCountBoost: 0,
          variancePenalty: 0,
        },
        explanationBulletPoints: [
          'We are still learning this location',
          'Awaiting first 2 verified community observations',
          `Standard baseline service time is ~${location.average_service_time} min per token`,
        ],
      },
    };
  }

  // 1. Historical baseline for this hour
  const hourlyCurve = location.hourly_curve;
  const baselineForHour = (hourlyCurve && hourlyCurve[hourOfDay] !== undefined && hourlyCurve[hourOfDay] > 0)
    ? hourlyCurve[hourOfDay]
    : location.historical_wait;

  // 2. Process observations with time-decay weighting
  const now = Date.now();
  let totalWeightedWait = 0;
  let totalWeight = 0;
  let freshCount = 0;

  for (const obs of locObservations) {
    const ageMinutes = Math.max(0, (now - obs.timestamp) / (60 * 1000));
    // Exponential half-life of 45 minutes
    const weight = Math.exp(-ageMinutes / 45);
    totalWeightedWait += obs.wait_time * weight;
    totalWeight += weight;
    if (ageMinutes <= 60) {
      freshCount++;
    }
  }

  // If there are synthetic/seeded observations on the location itself, blend them
  if (locObservations.length === 0 && location.observations_count > 0) {
    totalWeightedWait = location.current_wait * 1.5;
    totalWeight = 1.5;
    freshCount = location.observations_count;
  }

  const recentAvg = totalWeight > 0 ? totalWeightedWait / totalWeight : baselineForHour;

  // 3. Counter capacity factor
  const counterRatio = location.number_of_counters > 0 
    ? location.active_counters / location.number_of_counters 
    : 1;
  
  // If active counters are down, wait times inflate
  const counterDelayMultiplier = counterRatio < 0.6 ? 1.25 : counterRatio < 0.8 ? 1.1 : 1.0;

  // 4. Blend historical baseline and recent observations
  // More observations -> higher weight on observations
  const obsBlendRatio = Math.min(0.85, totalWeight * 0.35);
  const rawPredictedWait = (baselineForHour * (1 - obsBlendRatio) + recentAvg * obsBlendRatio) * counterDelayMultiplier;
  const finalPredictedWait = Math.max(2, Math.round(rawPredictedWait));

  // 5. Confidence Score Calculation
  let confidence = 55; // baseline confidence
  let freshnessBoost = 0;
  let sampleCountBoost = 0;
  let variancePenalty = 0;

  if (freshCount > 0) {
    freshnessBoost = Math.min(25, freshCount * 5);
  }
  sampleCountBoost = Math.min(15, (locObservations.length + location.observations_count) * 2);

  // If counter capacity is severely reduced, slight penalty for instability
  if (counterRatio < 0.5) {
    variancePenalty = 8;
  }

  confidence = Math.min(96, Math.max(30, confidence + freshnessBoost + sampleCountBoost - variancePenalty));

  const isCommunity = locObservations.length > 0 || location.data_source === 'community';

  const bullets: string[] = [
    `${freshCount > 0 ? freshCount : location.observations_count} recent observations recorded (weighted by freshness)`,
    `Tuesday ${hourOfDay > 12 ? hourOfDay - 12 : hourOfDay} ${hourOfDay >= 12 ? 'PM' : 'AM'} historical pattern: ~${baselineForHour} min`,
    `Counter capacity: ${location.active_counters} of ${location.number_of_counters} counters currently active`,
    `Service speed: avg ${location.average_service_time} min per transaction`
  ];

  return {
    predictedWait: finalPredictedWait,
    confidence,
    dataSource: isCommunity ? 'community' : 'simulated',
    breakdown: {
      baselineWait: baselineForHour,
      observationsWeight: parseFloat(obsBlendRatio.toFixed(2)),
      recentObservationsAvg: Math.round(recentAvg),
      recentObservationsCount: freshCount,
      counterDelayFactor: parseFloat(counterDelayMultiplier.toFixed(2)),
      activeCounters: location.active_counters,
      totalCounters: location.number_of_counters,
      confidenceScore: confidence,
      confidenceFactors: {
        freshnessBoost,
        sampleCountBoost,
        variancePenalty,
      },
      explanationBulletPoints: bullets,
    },
  };
}

/**
 * Compare a base location with alternative locations of similar service type
 * to identify fastest overall and calculate exact time saved!
 */
export function generateComparison(
  baseLocation: LocationWithTravel,
  allLocations: LocationWithTravel[]
): ComparisonData {
  // Find related candidates: same category or subcategory
  const sameSubcategory = allLocations.filter(
    l => l.id !== baseLocation.id && l.subcategory === baseLocation.subcategory && l.status === 'open'
  );

  let candidatesPool = sameSubcategory;
  if (candidatesPool.length < 2) {
    // fallback to same category
    candidatesPool = allLocations.filter(
      l => l.id !== baseLocation.id && l.category === baseLocation.category && l.status === 'open'
    );
  }

  // Sort candidates by total time
  const scoredCandidates: ComparisonCandidate[] = [
    {
      location: baseLocation,
      travelTimeMinutes: baseLocation.travelInfo.travelTimeMinutes,
      waitTimeMinutes: baseLocation.current_wait,
      totalTimeMinutes: baseLocation.totalTimeMinutes,
      distanceKm: baseLocation.travelInfo.distanceKm,
      timeSavedAgainstBase: 0,
      isFastestOverall: false,
      isNearest: false,
      isBase: true,
    }
  ];

  for (const item of candidatesPool) {
    const timeSaved = baseLocation.totalTimeMinutes - item.totalTimeMinutes;
    scoredCandidates.push({
      location: item,
      travelTimeMinutes: item.travelInfo.travelTimeMinutes,
      waitTimeMinutes: item.current_wait,
      totalTimeMinutes: item.totalTimeMinutes,
      distanceKm: item.travelInfo.distanceKm,
      timeSavedAgainstBase: timeSaved,
      isFastestOverall: false,
      isNearest: false,
      isBase: false,
    });
  }

  // Identify fastest total and nearest
  let fastest = scoredCandidates[0];
  let nearest = scoredCandidates[0];

  for (const c of scoredCandidates) {
    if (c.totalTimeMinutes < fastest.totalTimeMinutes) {
      fastest = c;
    }
    if (c.distanceKm < nearest.distanceKm) {
      nearest = c;
    }
  }

  // Mark flags
  fastest.isFastestOverall = true;
  nearest.isNearest = true;

  // Sort by total time ascending for clear presentation
  scoredCandidates.sort((a, b) => a.totalTimeMinutes - b.totalTimeMinutes);

  const maxTimeSaved = Math.max(0, baseLocation.totalTimeMinutes - fastest.totalTimeMinutes);

  let explanation = '';
  if (fastest.location.id === baseLocation.id) {
    explanation = `${baseLocation.name} is already your fastest available option across Kolkata!`;
  } else {
    const extraTravel = fastest.travelTimeMinutes - baseLocation.travelInfo.travelTimeMinutes;
    const waitDifference = baseLocation.current_wait - fastest.waitTimeMinutes;
    
    if (extraTravel > 0) {
      explanation = `${fastest.location.name} is ${extraTravel} min further away, but has a ${waitDifference} min shorter wait — saving you ~${maxTimeSaved} minutes overall.`;
    } else {
      explanation = `${fastest.location.name} is both closer and faster, saving you ~${maxTimeSaved} minutes total time.`;
    }
  }

  return {
    baseLocation,
    candidates: scoredCandidates.slice(0, 5), // top 5 alternatives
    fastestCandidate: fastest,
    nearestCandidate: nearest,
    maxTimeSaved,
    recommendationExplanation: explanation,
  };
}
