import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestWorker {
  name: string;
  email: string;
  phone: string;
  work_type: string;
  years_experience: number;
  languages_spoken: string[];
  preferred_areas: string[];
  working_hours: string;
  gender: string;
  age: number;
  residential_address: string;
}

const testWorkers: TestWorker[] = [
  {
    name: 'Sunita Devi',
    email: 'sunita@test.com',
    phone: '+91 98765 11111',
    work_type: 'cooking',
    years_experience: 8,
    languages_spoken: ['Hindi', 'English'],
    preferred_areas: ['Koramangala', 'HSR Layout', 'BTM Layout'],
    working_hours: 'morning',
    gender: 'female',
    age: 35,
    residential_address: 'Koramangala, Bangalore',
  },
  {
    name: 'Ramu Kumar',
    email: 'ramu@test.com',
    phone: '+91 98765 22222',
    work_type: 'cooking',
    years_experience: 5,
    languages_spoken: ['Hindi', 'Kannada'],
    preferred_areas: ['Whitefield', 'Marathahalli', 'ITPL'],
    working_hours: 'full_day',
    gender: 'male',
    age: 42,
    residential_address: 'Whitefield, Bangalore',
  },
  {
    name: 'Venkatesh Rao',
    email: 'venkatesh@test.com',
    phone: '+91 98765 33333',
    work_type: 'driving',
    years_experience: 10,
    languages_spoken: ['Hindi', 'Kannada', 'English'],
    preferred_areas: ['Indiranagar', 'Koramangala', 'MG Road'],
    working_hours: 'full_day',
    gender: 'male',
    age: 38,
    residential_address: 'Indiranagar, Bangalore',
  },
  {
    name: 'Mohammad Salim',
    email: 'salim@test.com',
    phone: '+91 98765 44444',
    work_type: 'driving',
    years_experience: 7,
    languages_spoken: ['Hindi', 'Urdu', 'English'],
    preferred_areas: ['JP Nagar', 'Jayanagar', 'Banashankari'],
    working_hours: 'evening',
    gender: 'male',
    age: 45,
    residential_address: 'JP Nagar, Bangalore',
  },
  {
    name: 'Lakshmi Bai',
    email: 'lakshmi@test.com',
    phone: '+91 98765 55555',
    work_type: 'gardening',
    years_experience: 12,
    languages_spoken: ['Hindi', 'Kannada'],
    preferred_areas: ['HSR Layout', 'Sarjapur', 'Bellandur'],
    working_hours: 'morning',
    gender: 'female',
    age: 48,
    residential_address: 'HSR Layout, Bangalore',
  },
  {
    name: 'Prakash Nair',
    email: 'prakash@test.com',
    phone: '+91 98765 66666',
    work_type: 'gardening',
    years_experience: 6,
    languages_spoken: ['Hindi', 'Malayalam', 'English'],
    preferred_areas: ['Koramangala', 'Indiranagar', 'Whitefield'],
    working_hours: 'full_day',
    gender: 'male',
    age: 40,
    residential_address: 'Koramangala, Bangalore',
  },
  {
    name: 'Meena Kumari',
    email: 'meena@test.com',
    phone: '+91 98765 77777',
    work_type: 'domestic_help',
    years_experience: 9,
    languages_spoken: ['Hindi', 'Telugu'],
    preferred_areas: ['Marathahalli', 'Whitefield', 'ITPL'],
    working_hours: 'morning',
    gender: 'female',
    age: 36,
    residential_address: 'Marathahalli, Bangalore',
  },
  {
    name: 'Savitri Devi',
    email: 'savitri@test.com',
    phone: '+91 98765 88888',
    work_type: 'domestic_help',
    years_experience: 4,
    languages_spoken: ['Hindi', 'Kannada'],
    preferred_areas: ['Electronic City', 'HSR Layout', 'BTM Layout'],
    working_hours: 'full_day',
    gender: 'female',
    age: 32,
    residential_address: 'Electronic City, Bangalore',
  },
  {
    name: 'Rajesh Singh',
    email: 'rajesh@test.com',
    phone: '+91 98765 99999',
    work_type: 'driving',
    years_experience: 15,
    languages_spoken: ['Hindi', 'English', 'Punjabi'],
    preferred_areas: ['MG Road', 'Brigade Road', 'Koramangala'],
    working_hours: 'full_day',
    gender: 'male',
    age: 50,
    residential_address: 'MG Road, Bangalore',
  },
  {
    name: 'Kamala Bai',
    email: 'kamala@test.com',
    phone: '+91 98765 00000',
    work_type: 'domestic_help',
    years_experience: 6,
    languages_spoken: ['Hindi', 'Kannada'],
    preferred_areas: ['Whitefield', 'Marathahalli', 'ITPL'],
    working_hours: 'morning',
    gender: 'female',
    age: 38,
    residential_address: 'Whitefield, Bangalore',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role key to create users
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const password = '0987654321';
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const worker of testWorkers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const userExists = existingUsers?.users?.some(u => u.email === worker.email);

        if (userExists) {
          results.push({ email: worker.email, success: false, error: 'User already exists' });
          continue;
        }

        // Create auth user with worker role metadata
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: worker.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: worker.name,
            signup_portal: 'worker',
          },
        });

        if (authError) {
          results.push({ email: worker.email, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Create worker record
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .insert({
            name: worker.name,
            phone: worker.phone,
            work_type: worker.work_type,
            years_experience: worker.years_experience,
            languages_spoken: worker.languages_spoken,
            preferred_areas: worker.preferred_areas,
            working_hours: worker.working_hours,
            gender: worker.gender,
            age: worker.age,
            residential_address: worker.residential_address,
            status: 'verified',
            has_whatsapp: true,
          })
          .select()
          .single();

        if (workerError) {
          results.push({ email: worker.email, success: false, error: `Worker insert: ${workerError.message}` });
          continue;
        }

        // Link worker to auth user via worker_auth table
        const { error: workerAuthError } = await supabase
          .from('worker_auth')
          .insert({
            user_id: userId,
            worker_id: workerData.id,
          });

        if (workerAuthError) {
          results.push({ email: worker.email, success: false, error: `Worker auth: ${workerAuthError.message}` });
          continue;
        }

        results.push({ email: worker.email, success: true });
      } catch (err) {
        results.push({ email: worker.email, success: false, error: String(err) });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Created ${successful} test workers, ${failed} failed`,
        password: password,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error seeding test workers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
