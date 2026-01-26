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

// Map preferred time to working hours (matching the worker registration form values)
const timeToHours: Record<string, string[]> = {
  'morning': ['morning', 'full_day'],
  'midday': ['morning', 'full_day'],
  'afternoon': ['evening', 'full_day'],
  'evening': ['evening', 'full_day'],
  'flexible': ['morning', 'evening', 'full_day'],
};

// Extract city/location from address
function extractLocation(address: string): string[] {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Common Indian city names and areas
  const majorCities = [
    'delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 
    'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'noida', 
    'gurgaon', 'gurugram', 'chandigarh', 'kochi', 'indore', 'nagpur',
    'koramangala', 'hsr layout', 'whitefield', 'indiranagar', 'jayanagar',
    'marathahalli', 'electronic city', 'btm layout', 'jp nagar', 'hebbal'
  ];
  
  const matchedLocations: string[] = [];
  for (const city of majorCities) {
    if (normalizedAddress.includes(city)) {
      matchedLocations.push(city);
    }
  }
  
  return matchedLocations;
}

// Strict filtering: Check if worker has ALL required subcategories
function workerHasAllSubcategories(
  worker: Worker,
  serviceType: string,
  requiredSubcategories?: { id: string; name: string }[]
): boolean {
  // If no subcategories are required, all workers pass this filter
  if (!requiredSubcategories || requiredSubcategories.length === 0) {
    return true;
  }

  // Check work type match first
  const requiredWorkType = serviceToWorkType[serviceType];
  if (worker.work_type !== requiredWorkType) {
    return false;
  }

  // If worker has no subcategories, they don't match
  if (!worker.work_subcategories || worker.work_subcategories.length === 0) {
    return false;
  }

  // Worker must have ALL required subcategory IDs
  const requiredSubcategoryIds = requiredSubcategories.map(s => s.id);
  const hasAllSubcategories = requiredSubcategoryIds.every(
    subId => worker.work_subcategories!.includes(subId)
  );

  return hasAllSubcategories;
}

function calculateMatchScore(
  worker: Worker, 
  serviceType: string, 
  preferredTime: string, 
  address: string,
  subServices?: { id: string; name: string }[]
): number {
  let score = 0;
  const maxScore = 100;

  // 1. Service Type Match (30 points - reduced to make room for subcategories)
  const requiredWorkType = serviceToWorkType[serviceType];
  if (worker.work_type === requiredWorkType) {
    score += 30;
  }

  // 2. Subcategory Match (20 points) - NEW
  if (subServices && subServices.length > 0 && worker.work_subcategories && worker.work_subcategories.length > 0) {
    // IDs match directly, so use booking sub-service IDs to check worker subcategories
    const requiredSubcategoryIds = subServices.map(s => s.id);
    
    // Count how many required subcategories the worker can do
    const matchedSubcategories = requiredSubcategoryIds.filter(
      subId => worker.work_subcategories!.includes(subId)
    );
    
    if (matchedSubcategories.length === requiredSubcategoryIds.length) {
      // Worker can do ALL requested subcategories
      score += 20;
    } else if (matchedSubcategories.length > 0) {
      // Partial match - proportional score
      score += Math.round((matchedSubcategories.length / requiredSubcategoryIds.length) * 15);
    }
    // No match = 0 points
  } else if (!subServices || subServices.length === 0) {
    // If no subcategories requested, give partial points
    score += 10;
  }

  // 3. Availability/Working Hours Match (15 points - adjusted)
  const acceptableHours = timeToHours[preferredTime] || timeToHours['flexible'];
  if (worker.working_hours && acceptableHours.includes(worker.working_hours)) {
    score += 15;
  } else if (!worker.working_hours) {
    // If no preference set, give partial score
    score += 6;
  }

  // 4. Location/Area Match (25 points) - PRIORITIZE MANUAL LOCATION INPUT
  const inputLocations = extractLocation(address);
  
  if (inputLocations.length > 0 && worker.preferred_areas && worker.preferred_areas.length > 0) {
    // Check if worker's preferred areas match any of the input locations
    const workerAreas = worker.preferred_areas.map(area => area.toLowerCase());
    
    // Direct location match gets full points
    const hasDirectMatch = inputLocations.some(loc => 
      workerAreas.some(area => area.includes(loc) || loc.includes(area))
    );
    
    if (hasDirectMatch) {
      score += 25;
    } else {
      // Check if address string contains any worker preferred area
      const addressLower = address.toLowerCase();
      const areaMatch = worker.preferred_areas.some(area => 
        addressLower.includes(area.toLowerCase())
      );
      if (areaMatch) {
        score += 20;
      } else {
        // No location match - significant penalty
        score += 0;
      }
    }
  } else if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    // No specific location in input, check general area match
    const addressLower = address.toLowerCase();
    const areaMatch = worker.preferred_areas.some(area => 
      addressLower.includes(area.toLowerCase())
    );
    if (areaMatch) {
      score += 20;
    } else {
      score += 5;
    }
  } else {
    // Workers with no area preference get partial score (more flexible)
    score += 8;
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

    console.log('Matching workers for booking:', bookingId);
    console.log('Service type:', serviceType, 'Preferred time:', preferredTime, 'Address:', address);
    console.log('Sub-services requested:', subServices);
    console.log('Extracted locations from address:', extractLocation(address));

    // Get all verified workers (status can be 'verified' or 'Verified')
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .or('status.eq.verified,status.eq.Verified')
      .is('assigned_customer_id', null); // Only unassigned workers

    if (workersError) {
      console.error('Error fetching workers:', workersError);
      throw workersError;
    }

    console.log(`Found ${workers?.length || 0} verified, unassigned workers`);

    if (!workers || workers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          matchedWorkers: [],
          message: 'No available workers found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STRICT FILTERING: Only include workers who have ALL required subcategories
    const eligibleWorkers = workers.filter(worker => 
      workerHasAllSubcategories(worker, serviceType, subServices)
    );

    console.log(`After strict subcategory filtering: ${eligibleWorkers.length} eligible workers out of ${workers.length} total`);

    if (eligibleWorkers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          matchedWorkers: [],
          message: 'No workers found matching the required subcategories' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate match scores only for eligible workers
    const workersWithScores = eligibleWorkers.map(worker => ({
      ...worker,
      match_score: calculateMatchScore(worker, serviceType, preferredTime, address, subServices),
    }));

    // Sort by match score and get top 5
    const topWorkers = workersWithScores
      .filter(w => w.match_score > 0) // Only workers with some match
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
    console.log('Top workers with subcategories:', topWorkers.map(w => ({ 
      name: w.name, 
      subcategories: w.work_subcategories,
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
