import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  bookingId: string;
  serviceType: string;
  preferredTime: string;
  address: string;
  subServices?: { id: string; name: string }[];
  dietaryPreference?: string;
}

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  work_subcategories: string[] | null;
  years_experience: number | null;
  languages_spoken: string[] | null;
  preferred_areas: string[] | null;
  residential_address: string | null;
  working_hours: string | null;
  status: string | null;
  gender: string | null;
  match_score?: number;
}

// Map service IDs to work types (matching the worker registration form values)
const serviceToWorkType: Record<string, string> = {
  'cleaning': 'domestic_help',
  'cooking': 'cooking',
  'driver': 'driving',
  'gardening': 'gardening',
};

// Map dietary preference from booking form to worker subcategory IDs
const dietaryPreferenceMap: Record<string, string> = {
  'veg': 'vegetarian',
  'egg': 'eggitarian',
  'nonveg': 'non_vegetarian',
  'jain': 'vegetarian',
};

// Map preferred time to working hours
const timeToHours: Record<string, string[]> = {
  'morning': ['morning', 'full_day'],
  'midday': ['morning', 'full_day'],
  'afternoon': ['evening', 'full_day'],
  'evening': ['evening', 'full_day'],
  'flexible': ['morning', 'evening', 'full_day'],
};

// Major cities for location matching
const majorCities = [
  'delhi', 'new delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
  'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'noida', 'gurgaon',
  'gurugram', 'chandigarh', 'kochi', 'indore', 'nagpur', 'ghaziabad', 'faridabad',
  // Uttarakhand cities
  'dehradun', 'haridwar', 'rishikesh', 'roorkee', 'haldwani', 'nainital', 'mussoorie',
  // UP cities
  'agra', 'varanasi', 'kanpur', 'allahabad', 'prayagraj', 'meerut', 'mathura',
  // Rajasthan cities  
  'udaipur', 'jodhpur', 'ajmer', 'kota', 'bikaner',
  // Gujarat cities
  'surat', 'vadodara', 'rajkot', 'gandhinagar',
  // MP cities
  'bhopal', 'gwalior', 'jabalpur',
  // Other major cities
  'visakhapatnam', 'vijayawada', 'coimbatore', 'madurai', 'mysore', 'mangalore',
  'bhubaneswar', 'patna', 'ranchi', 'raipur', 'thiruvananthapuram', 'kozhikode',
];

// State/region names for broader matching
const stateRegions = [
  'uttarakhand', 'delhi ncr', 'haryana', 'uttar pradesh', 'rajasthan', 'punjab',
  'maharashtra', 'karnataka', 'tamil nadu', 'kerala', 'telangana', 'andhra pradesh',
  'west bengal', 'gujarat', 'madhya pradesh', 'bihar', 'jharkhand', 'odisha',
  'chhattisgarh', 'assam', 'himachal pradesh', 'jammu', 'kashmir', 'goa',
];

// City aliases
const cityAliases: Record<string, string> = {
  'bengaluru': 'bangalore',
  'bangalore': 'bangalore',
  'new delhi': 'delhi',
  'delhi': 'delhi',
  'gurugram': 'gurgaon',
  'gurgaon': 'gurgaon',
  'prayagraj': 'allahabad',
};

// Map cities to their states/regions
const cityToRegion: Record<string, string> = {
  'delhi': 'delhi ncr',
  'noida': 'delhi ncr',
  'gurgaon': 'delhi ncr',
  'ghaziabad': 'delhi ncr',
  'faridabad': 'delhi ncr',
  'mumbai': 'maharashtra',
  'pune': 'maharashtra',
  'nagpur': 'maharashtra',
  'bangalore': 'karnataka',
  'mysore': 'karnataka',
  'mangalore': 'karnataka',
  'chennai': 'tamil nadu',
  'coimbatore': 'tamil nadu',
  'madurai': 'tamil nadu',
  'hyderabad': 'telangana',
  'kolkata': 'west bengal',
  'ahmedabad': 'gujarat',
  'surat': 'gujarat',
  'vadodara': 'gujarat',
  'jaipur': 'rajasthan',
  'udaipur': 'rajasthan',
  'jodhpur': 'rajasthan',
  'lucknow': 'uttar pradesh',
  'kanpur': 'uttar pradesh',
  'varanasi': 'uttar pradesh',
  'agra': 'uttar pradesh',
  'dehradun': 'uttarakhand',
  'haridwar': 'uttarakhand',
  'rishikesh': 'uttarakhand',
  'roorkee': 'uttarakhand',
  'haldwani': 'uttarakhand',
  'nainital': 'uttarakhand',
  'chandigarh': 'punjab',
  'kochi': 'kerala',
  'thiruvananthapuram': 'kerala',
  'bhopal': 'madhya pradesh',
  'indore': 'madhya pradesh',
  'patna': 'bihar',
  'ranchi': 'jharkhand',
  'bhubaneswar': 'odisha',
  'raipur': 'chhattisgarh',
};

// Location keywords for area-level matching
const locationKeywords = [
  ...majorCities,
  // Delhi NCR areas
  'dwarka', 'rohini', 'pitampura', 'janakpuri', 'lajpat nagar', 'saket',
  'greater kailash', 'vasant kunj', 'mayur vihar', 'preet vihar', 'karol bagh',
  // Bangalore areas
  'koramangala', 'hsr layout', 'whitefield', 'indiranagar', 'jayanagar',
  'marathahalli', 'electronic city', 'btm layout', 'jp nagar', 'hebbal',
  'yelahanka', 'banashankari', 'rajajinagar', 'malleswaram', 'basaveshwaranagar',
  'panathur', 'kadabeesanahalli', 'bellandur', 'sarjapur',
  // Mumbai areas
  'andheri', 'bandra', 'juhu', 'powai', 'thane', 'navi mumbai', 'malad',
  'goregaon', 'borivali', 'kandivali', 'dadar', 'lower parel', 'worli',
  // State regions
  ...stateRegions,
];

// Extract city from address
function extractCityFromAddress(address: string): string | null {
  const normalizedAddress = address.toLowerCase().trim();
  for (const city of majorCities) {
    if (normalizedAddress.includes(city)) {
      return cityAliases[city] || city;
    }
  }
  return null;
}

// Extract state/region from address
function extractRegionFromAddress(address: string): string | null {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Check if a state/region is mentioned directly
  for (const region of stateRegions) {
    if (normalizedAddress.includes(region)) {
      return region;
    }
  }
  
  // If a city is found, get its region
  const city = extractCityFromAddress(address);
  if (city && cityToRegion[city]) {
    return cityToRegion[city];
  }
  
  return null;
}

// Extract city from worker's location
function extractWorkerCity(worker: Worker): string | null {
  if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    for (const area of worker.preferred_areas) {
      const city = extractCityFromAddress(area);
      if (city) return city;
    }
  }
  if (worker.residential_address) {
    return extractCityFromAddress(worker.residential_address);
  }
  return null;
}

// Extract region from worker's location
function extractWorkerRegion(worker: Worker): string | null {
  if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    for (const area of worker.preferred_areas) {
      const region = extractRegionFromAddress(area);
      if (region) return region;
    }
  }
  if (worker.residential_address) {
    return extractRegionFromAddress(worker.residential_address);
  }
  return null;
}

// Extract locations from address
function extractLocations(address: string): string[] {
  const normalizedAddress = address.toLowerCase().trim();
  const matchedLocations: string[] = [];
  for (const keyword of locationKeywords) {
    if (normalizedAddress.includes(keyword)) {
      matchedLocations.push(keyword);
    }
  }
  return matchedLocations;
}

// STRICT location matching - returns match level
function getLocationMatchLevel(worker: Worker, employerAddress: string): 'exact' | 'city' | 'region' | 'none' {
  const employerCity = extractCityFromAddress(employerAddress);
  const employerRegion = extractRegionFromAddress(employerAddress);
  const employerLocations = extractLocations(employerAddress);
  
  const workerCity = extractWorkerCity(worker);
  const workerRegion = extractWorkerRegion(worker);
  
  // Check for exact area/neighborhood match
  if (employerLocations.length > 0) {
    if (worker.preferred_areas && worker.preferred_areas.length > 0) {
      const workerAreas = worker.preferred_areas.map(a => a.toLowerCase());
      const hasAreaMatch = employerLocations.some(loc => 
        workerAreas.some(area => area.includes(loc) || loc.includes(area))
      );
      if (hasAreaMatch) return 'exact';
    }
    
    if (worker.residential_address) {
      const workerLocations = extractLocations(worker.residential_address);
      const hasResidentialMatch = employerLocations.some(loc => 
        workerLocations.some(wLoc => wLoc.includes(loc) || loc.includes(wLoc))
      );
      if (hasResidentialMatch) return 'exact';
    }
  }
  
  // Check city-level match
  if (employerCity && workerCity && employerCity === workerCity) {
    return 'city';
  }
  
  // Check region/state-level match
  if (employerRegion && workerRegion && employerRegion === workerRegion) {
    return 'region';
  }
  
  return 'none';
}

// Check subcategory match
function workerMatchesSubcategories(
  worker: Worker,
  serviceType: string,
  subServices?: { id: string; name: string }[],
  dietaryPreference?: string
): boolean {
  if ((!subServices || subServices.length === 0) && !dietaryPreference) {
    return true;
  }

  if (!worker.work_subcategories || worker.work_subcategories.length === 0) {
    return false;
  }

  if (serviceType === 'cooking' && dietaryPreference) {
    const requiredDietarySubcategory = dietaryPreferenceMap[dietaryPreference];
    if (requiredDietarySubcategory && !worker.work_subcategories.includes(requiredDietarySubcategory)) {
      console.log(`Worker ${worker.name} doesn't match dietary preference: ${dietaryPreference}`);
      return false;
    }
  }

  if (serviceType === 'cleaning' && subServices && subServices.length > 0) {
    const requiredSubcategoryIds = subServices.map(s => s.id);
    const hasAllSubcategories = requiredSubcategoryIds.every(
      subId => worker.work_subcategories!.includes(subId)
    );
    if (!hasAllSubcategories) {
      console.log(`Worker ${worker.name} doesn't have all required cleaning subcategories`);
      return false;
    }
  }

  return true;
}

function calculateMatchScore(
  worker: Worker,
  serviceType: string,
  preferredTime: string,
  locationLevel: 'exact' | 'city' | 'region' | 'none',
  subServices?: { id: string; name: string }[],
  dietaryPreference?: string
): number {
  let score = 0;

  // 1. Service Type Match (25 points)
  const requiredWorkType = serviceToWorkType[serviceType];
  if (worker.work_type === requiredWorkType) {
    score += 25;
  }

  // 2. Subcategory Match (25 points)
  if (worker.work_subcategories && worker.work_subcategories.length > 0) {
    if (serviceType === 'cooking' && dietaryPreference) {
      const requiredDietarySubcategory = dietaryPreferenceMap[dietaryPreference];
      if (requiredDietarySubcategory && worker.work_subcategories.includes(requiredDietarySubcategory)) {
        score += 25;
      }
    } else if (serviceType === 'cleaning' && subServices && subServices.length > 0) {
      const requiredSubcategoryIds = subServices.map(s => s.id);
      const matchedCount = requiredSubcategoryIds.filter(
        subId => worker.work_subcategories!.includes(subId)
      ).length;
      score += Math.round((matchedCount / requiredSubcategoryIds.length) * 25);
    } else {
      score += 15;
    }
  }

  // 3. Location Match (30 points) - based on match level
  switch (locationLevel) {
    case 'exact':
      score += 30;
      break;
    case 'city':
      score += 25;
      break;
    case 'region':
      score += 15;
      break;
    default:
      score += 0;
  }

  // 4. Working Hours Match (10 points)
  const acceptableHours = timeToHours[preferredTime] || timeToHours['flexible'];
  if (worker.working_hours && acceptableHours.includes(worker.working_hours)) {
    score += 10;
  } else if (!worker.working_hours) {
    score += 5;
  }

  // 5. Experience Bonus (10 points)
  if (worker.years_experience) {
    if (worker.years_experience >= 5) {
      score += 10;
    } else if (worker.years_experience >= 3) {
      score += 7;
    } else if (worker.years_experience >= 1) {
      score += 4;
    }
  }

  return Math.min(score, 100);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId, serviceType, preferredTime, address, subServices }: MatchRequest = await req.json();

    console.log('=== Worker Matching Request ===');
    console.log('Booking ID:', bookingId);
    console.log('Service type:', serviceType);
    console.log('Preferred time:', preferredTime);
    console.log('Address:', address);
    console.log('Sub-services:', JSON.stringify(subServices));

    // Extract employer location info
    const employerCity = extractCityFromAddress(address);
    const employerRegion = extractRegionFromAddress(address);
    console.log('Employer city:', employerCity);
    console.log('Employer region:', employerRegion);

    // If we can't determine ANY location info, return empty - location is required for matching
    if (!employerCity && !employerRegion) {
      console.log('Cannot determine employer location - no matches possible');
      return new Response(
        JSON.stringify({
          success: true,
          matchedWorkers: [],
          message: 'Unable to determine your location. Please provide a valid city or area in your address for worker matching.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract dietary preference for cooking
    let dietaryPreference: string | undefined;
    if (serviceType === 'cooking') {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('sub_services')
        .eq('id', bookingId)
        .single();
      
      if (bookingData?.sub_services) {
        const subServicesData = bookingData.sub_services as { serviceDetails?: { dietaryPreference?: string } };
        dietaryPreference = subServicesData.serviceDetails?.dietaryPreference;
        console.log('Dietary preference:', dietaryPreference);
      }
    }

    // Get required work type
    const requiredWorkType = serviceToWorkType[serviceType];
    console.log('Required work type:', requiredWorkType);

    // Get all verified workers of the required work type
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .eq('work_type', requiredWorkType)
      .or('status.eq.verified,status.eq.Verified')
      .is('assigned_customer_id', null);

    if (workersError) {
      console.error('Error fetching workers:', workersError);
      throw workersError;
    }

    console.log(`Found ${workers?.length || 0} verified, unassigned workers of type ${requiredWorkType}`);

    if (!workers || workers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matchedWorkers: [],
          message: 'No available workers found for this service type'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter by subcategory first
    const subcategoryMatchedWorkers = workers.filter(worker => {
      const subcategoryMatch = workerMatchesSubcategories(worker, serviceType, subServices, dietaryPreference);
      if (!subcategoryMatch) {
        console.log(`Worker ${worker.name} filtered out: Subcategory mismatch`);
        return false;
      }
      return true;
    });

    console.log(`After subcategory filtering: ${subcategoryMatchedWorkers.length} workers`);

    if (subcategoryMatchedWorkers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matchedWorkers: [],
          message: 'No workers found matching your service requirements'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STRICT LOCATION MATCHING - only workers in the same city/region
    const locationMatchedWorkers: { worker: Worker; level: 'exact' | 'city' | 'region' }[] = [];
    
    for (const worker of subcategoryMatchedWorkers) {
      const matchLevel = getLocationMatchLevel(worker, address);
      if (matchLevel !== 'none') {
        locationMatchedWorkers.push({ worker, level: matchLevel });
        console.log(`Worker ${worker.name} matched at ${matchLevel} level`);
      } else {
        console.log(`Worker ${worker.name} filtered out: No location match (employer: ${employerCity || employerRegion}, worker: ${extractWorkerCity(worker) || extractWorkerRegion(worker)})`);
      }
    }

    console.log(`After location filtering: ${locationMatchedWorkers.length} workers`);

    if (locationMatchedWorkers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matchedWorkers: [],
          message: `No workers found in ${employerCity || employerRegion}. We're expanding our network - please check back later.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate scores and sort
    const workersWithScores = locationMatchedWorkers.map(({ worker, level }) => ({
      ...worker,
      match_score: calculateMatchScore(worker, serviceType, preferredTime, level, subServices, dietaryPreference),
    }));

    // Sort by match score and get top 5
    const topWorkers = workersWithScores
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 5)
      .map(worker => ({
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        work_type: worker.work_type,
        work_subcategories: worker.work_subcategories,
        years_experience: worker.years_experience,
        languages_spoken: worker.languages_spoken,
        preferred_areas: worker.preferred_areas,
        working_hours: worker.working_hours,
        gender: worker.gender,
        match_score: worker.match_score,
      }));

    console.log(`Returning ${topWorkers.length} matched workers from ${employerCity || employerRegion}`);
    console.log('Top workers:', topWorkers.map(w => ({
      name: w.name,
      subcategories: w.work_subcategories,
      areas: w.preferred_areas,
      score: w.match_score
    })));

    return new Response(
      JSON.stringify({
        success: true,
        matchedWorkers: topWorkers,
        message: `Found ${topWorkers.length} matching workers in ${employerCity || employerRegion}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in match-workers function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        matchedWorkers: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
