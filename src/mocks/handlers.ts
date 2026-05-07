import { http, HttpResponse } from 'msw';

export const handlers = [
  // --- AUTH handlers ---
  http.get('*/api/auth/status', () => {
    return HttpResponse.json({
      loggedIn: true,
      userType: 'user',
      fname: 'Test',
      lname: 'User',
    });
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const { email } = await request.json() as any;
    if (email === 'error@example.com') {
      return HttpResponse.json({ success: false, error: 'Hibás jelszó' }, { status: 401 });
    }
    return HttpResponse.json({ success: true, userType: 'user' });
  }),

  // --- ADVERTISEMENT handlers ---
  http.get('*/api/advertisements/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    
    const mockJobs = [
      {
        id: 1,
        title: 'Szoftverfejlesztő',
        position: 'Developer',
        location: 'Budapest',
        hourly_wage: 3500,
        company_name: 'TechCo',
        is_active: true,
      },
      {
        id: 2,
        title: 'UI/UX Designer',
        position: 'Designer',
        location: 'Debrecen',
        hourly_wage: 3000,
        company_name: 'DesignFlow',
        is_active: true,
      }
    ];

    let filtered = mockJobs;
    if (q) {
      filtered = mockJobs.filter(j => j.title.toLowerCase().includes(q.toLowerCase()));
    }

    return HttpResponse.json({
      success: true,
      advertisements: filtered,
      totalCount: filtered.length
    });
  }),

  http.post('*/api/OrionAI', async ({ request }) => {
    const { userinput } = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 101,
          title: `AI Match: ${userinput}`,
          position: 'AI Specialist',
          location: 'Remote',
          hourly_wage: 5000,
          company_name: 'AI Hub',
          is_active: true
        }
      ]
    });
  }),

  // --- APPLICATION / ATS handlers ---
  http.get('*/api/advertisements/:id/applications', () => {
    return HttpResponse.json({
      success: true,
      applicants: [
        {
          id: 1,
          user_id: 201,
          last_updated: new Date().toISOString(),
          users: {
            fname: 'János',
            lname: 'Kovács',
            email: 'janos@example.com',
            phone_number: '06301234567',
            birth_place: 'Budapest',
            birth_date: '1995-05-10',
            address: 'Példa utca 1.',
            nationality: 'Magyar',
            short_bio: 'Tapasztalt szoftverfejlesztő vagyok.',
            qualifications: 'BSc Computer Science'
          },
          click_count: { click_count: 42 }
        }
      ]
    });
  }),

  http.patch('*/api/applications/:id/status', async ({ request }) => {
    const { status } = await request.json() as any;
    return HttpResponse.json({ success: true, status });
  }),

  // --- JOB DETAIL handlers ---
  http.get('*/api/advertisements/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      advertisement: {
        id: Number(id),
        title: 'Teszt Állás',
        position: 'Fejlesztő',
        location: 'Budapest',
        hourly_wage: '3500',
        tasks: 'Feladatok leírása',
        requirements: 'Követelmények',
        job_description: 'Részletes leírás',
        company_id: 1,
        is_active: true,
        company: { name: 'Teszt Kft.' },
      },
    });
  }),

  http.patch('*/api/advertisements/:id/views', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('*/api/applications', () => {
    return HttpResponse.json({ success: true });
  }),
];
