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
}

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
  languages_spoken: string[] | null;
  preferred_areas: string[] | null;
  working_hours: string | null;
  status: string | null;
  gender: string | null;
  match_score?: number;
}

// Map service IDs to work types
const serviceToWorkType: Record<string, string> = {
  'cleaning': 'Domestic Help',
  'cooking': 'Cooking',
  'driver': 'Driving',
  'gardening': 'Gardening',
};

// Map preferred time to working hours
const timeToHours: Record<string, string[]> = {
  'morning': ['Morning', 'Full Day', 'Flexible'],
  'midday': ['Morning', 'Full Day', 'Flexible'],
  'afternoon': ['Evening', 'Full Day', 'Flexible'],
  'evening': ['Evening', 'Full Day', 'Flexible'],
  'flexible': ['Morning', 'Evening', 'Full Day', 'Flexible'],
};

function calculateMatchScore(worker: Worker, serviceType: string, preferredTime: string, address: string): number {
  let score = 0;
  const maxScore = 100;

  // 1. Service Type Match (40 points)
  const requiredWorkType = serviceToWorkType[serviceType];
  if (worker.work_type === requiredWorkType) {
    score += 40;
  }

  // 2. Availability/Working Hours Match (25 points)
  const acceptableHours = timeToHours[preferredTime] || timeToHours['flexible'];
  if (worker.working_hours && acceptableHours.includes(worker.working_hours)) {
    score += 25;
  } else if (!worker.working_hours) {
    // If no preference set, give partial score
    score += 10;
  }

  // 3. Area Match (20 points) - Check if address contains any preferred area
  if (worker.preferred_areas && worker.preferred_areas.length > 0) {
    const addressLower = address.toLowerCase();
    const areaMatch = worker.preferred_areas.some(area => 
      addressLower.includes(area.toLowerCase())
    );
    if (areaMatch) {
      score += 20;
    } else {
      // Partial score for having preferred areas set
      score += 5;
    }
  } else {
    // Workers with no area preference get partial score (more flexible)
    score += 10;
  }

  // 4. Experience Bonus (15 points)
  if (worker.years_experience) {
    if (worker.years_experience >= 5) {
      score += 15;
    } else if (worker.years_experience >= 3) {
      score += 10;
    } else if (worker.years_experience >= 1) {
      score += 5;
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

    const { bookingId, serviceType, preferredTime, address }: MatchRequest = await req.json();

    console.log('Matching workers for booking:', bookingId);
    console.log('Service type:', serviceType, 'Preferred time:', preferredTime);

    // Get all verified workers
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .eq('status', 'Verified')
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

    // Calculate match scores for all workers
    const workersWithScores = workers.map(worker => ({
      ...worker,
      match_score: calculateMatchScore(worker, serviceType, preferredTime, address),
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
        years_experience: worker.years_experience,
        languages_spoken: worker.languages_spoken,
        preferred_areas: worker.preferred_areas,
        working_hours: worker.working_hours,
        gender: worker.gender,
        match_score: worker.match_score,
      }));

    console.log(`Returning ${topWorkers.length} matched workers`);

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
