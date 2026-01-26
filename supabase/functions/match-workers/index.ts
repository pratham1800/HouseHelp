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
  'jain': 'vegetarian', // Jain maps to vegetarian as it's a subset
};

// Map preferred time to working hours (matching the worker registration form values)
const timeToHours: Record<string, string[]> = {
  'morning': ['morning', 'full_day'],
  'midday': ['morning', 'full_day'],
  'afternoon': ['evening', 'full_day'],
  'evening': ['evening', 'full_day'],
  'flexible': ['morning', 'evening', 'full_day'],
};

// Major cities for city-level matching
const majorCities = [
  'delhi', 'new delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
  'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'noida', 'gurgaon',
  'gurugram', 'chandigarh', 'kochi', 'indore', 'nagpur', 'ghaziabad', 'faridabad',
];

// City aliases (map variations to canonical names)
const cityAliases: Record<string, string> = {
  'bengaluru': 'bangalore',
  'bangalore': 'bangalore',
  'new delhi': 'delhi',
  'delhi': 'delhi',
  'gurugram': 'gurgaon',
  'gurgaon': 'gurgaon',
};

// Common Indian city names and areas for location matching
const locationKeywords = [
  // Major cities
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
];

// Extract city from address string
function extractCityFromAddress(address: string): string | null {
  const normalizedAddress = address.toLowerCase().trim();
  
  for (const city of majorCities) {
    if (normalizedAddress.includes(city)) {
      return cityAliases[city] || city;
    }
  }
  
  return null;
}

// Extract city from worker's preferred_areas or residential_address
function extractWorkerCity(worker: Worker): string | null {
  // Check preferred_areas first
  if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    for (const area of worker.preferred_areas) {
      const city = extractCityFromAddress(area);
      if (city) return city;
    }
  }
  
  // Check residential_address
  if (worker.residential_address) {
    const city = extractCityFromAddress(worker.residential_address);
    if (city) return city;
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

// Check if worker's location matches employer's location
function workerMatchesLocation(worker: Worker, employerAddress: string): boolean {
  const employerLocations = extractLocations(employerAddress);
  
  // If we can't determine employer location, don't filter strictly (allow all)
  if (employerLocations.length === 0) {
    console.log(`No location keywords found in employer address: "${employerAddress}"`);
    return true;
  }
  
  // Check worker's preferred_areas
  if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    const workerAreas = worker.preferred_areas.map(a => a.toLowerCase());
    const hasAreaMatch = employerLocations.some(loc => 
      workerAreas.some(area => area.includes(loc) || loc.includes(area))
    );
    if (hasAreaMatch) return true;
  }
  
  // Check worker's residential_address
  if (worker.residential_address) {
    const workerLocations = extractLocations(worker.residential_address);
    const hasResidentialMatch = employerLocations.some(loc => 
      workerLocations.some(wLoc => wLoc.includes(loc) || loc.includes(wLoc))
    );
    if (hasResidentialMatch) return true;
  }
  
  return false;
}

// Check if worker matches the required subcategories
function workerMatchesSubcategories(
  worker: Worker,
  serviceType: string,
  subServices?: { id: string; name: string }[],
  dietaryPreference?: string
): boolean {
  // If no subcategories required, worker passes
  if ((!subServices || subServices.length === 0) && !dietaryPreference) {
    return true;
  }

  // If worker has no subcategories, they don't match specific requirements
  if (!worker.work_subcategories || worker.work_subcategories.length === 0) {
    return false;
  }

  // For cooking service, check dietary preference
  if (serviceType === 'cooking' && dietaryPreference) {
    const requiredDietarySubcategory = dietaryPreferenceMap[dietaryPreference];
    if (requiredDietarySubcategory) {
      const hasDietaryMatch = worker.work_subcategories.includes(requiredDietarySubcategory);
      if (!hasDietaryMatch) {
        console.log(`Worker ${worker.name} doesn't match dietary preference: ${dietaryPreference} -> ${requiredDietarySubcategory}`);
        return false;
      }
    }
  }

  // For cleaning service, check sub-services
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
  address: string,
  subServices?: { id: string; name: string }[],
  dietaryPreference?: string
): number {
  let score = 0;
  const maxScore = 100;

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
      score += 15; // Partial points if no specific subcategories required
    }
  }

  // 3. Location Match (30 points) - Higher priority for nearby workers
  const employerLocations = extractLocations(address);
  if (employerLocations.length > 0) {
    let locationScore = 0;
    
    // Check preferred_areas (25 points for area match)
    if (worker.preferred_areas && worker.preferred_areas.length > 0) {
      const workerAreas = worker.preferred_areas.map(a => a.toLowerCase());
      const hasAreaMatch = employerLocations.some(loc => 
        workerAreas.some(area => area.includes(loc) || loc.includes(area))
      );
      if (hasAreaMatch) locationScore = 30;
    }
    
    // Check residential_address (20 points for residential match if no area match)
    if (locationScore < 30 && worker.residential_address) {
      const workerLocations = extractLocations(worker.residential_address);
      const hasResidentialMatch = employerLocations.some(loc => 
        workerLocations.some(wLoc => wLoc.includes(loc) || loc.includes(wLoc))
      );
      if (hasResidentialMatch) locationScore = 25;
    }
    
    score += locationScore;
  } else {
    // No location info from employer, give partial score
    score += 10;
  }

  // 4. Availability/Working Hours Match (10 points)
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

  return Math.min(score, maxScore);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Extract dietary preference from sub-services for cooking
    let dietaryPreference: string | undefined;
    if (serviceType === 'cooking') {
      // Try to get dietary preference from booking details
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('sub_services')
        .eq('id', bookingId)
        .single();
      
      if (bookingData?.sub_services) {
        const subServicesData = bookingData.sub_services as { serviceDetails?: { dietaryPreference?: string } };
        dietaryPreference = subServicesData.serviceDetails?.dietaryPreference;
        console.log('Dietary preference from booking:', dietaryPreference);
      }
    }

    const extractedLocations = extractLocations(address);
    console.log('Extracted locations from address:', extractedLocations);

    // Get the required work type
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

// First filter by subcategory (strict requirement)
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

    // TIERED LOCATION MATCHING:
    // Tier 1: Exact location match (neighborhood/area level)
    // Tier 2: Same city match (fallback if no exact matches)
    
    const exactLocationWorkers = subcategoryMatchedWorkers.filter(worker => 
      workerMatchesLocation(worker, address)
    );
    
    console.log(`Tier 1 (exact location): ${exactLocationWorkers.length} workers`);

    let eligibleWorkers: Worker[];
    
    if (exactLocationWorkers.length > 0) {
      // Use exact location matches
      eligibleWorkers = exactLocationWorkers;
      console.log('Using Tier 1: Exact location matches');
    } else {
      // Fallback to same city matches
      const employerCity = extractCityFromAddress(address);
      console.log(`No exact matches. Falling back to city-level matching. Employer city: ${employerCity}`);
      
      if (employerCity) {
        const cityWorkers = subcategoryMatchedWorkers.filter(worker => {
          const workerCity = extractWorkerCity(worker);
          const cityMatch = workerCity === employerCity;
          if (cityMatch) {
            console.log(`Worker ${worker.name} matches city: ${workerCity}`);
          }
          return cityMatch;
        });
        
        console.log(`Tier 2 (same city): ${cityWorkers.length} workers`);
        eligibleWorkers = cityWorkers;
      } else {
        // If we can't determine city, return all subcategory-matched workers
        console.log('Could not determine employer city, using all subcategory-matched workers');
        eligibleWorkers = subcategoryMatchedWorkers;
      }
    }

    if (eligibleWorkers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matchedWorkers: [],
          message: 'No workers found in your area matching your service requirements'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate match scores for eligible workers
    const workersWithScores = eligibleWorkers.map(worker => ({
      ...worker,
      match_score: calculateMatchScore(worker, serviceType, preferredTime, address, subServices, dietaryPreference),
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

    console.log(`Returning ${topWorkers.length} matched workers`);
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
        message: `Found ${topWorkers.length} matching workers`
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
