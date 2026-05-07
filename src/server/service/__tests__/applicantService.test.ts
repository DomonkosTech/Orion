import { describe, it, expect, vi, beforeEach } from 'vitest';

// Per-table response data (each test populates what tables return)
const tableData: Record<string, any[]> = [];
// Control whether from() returns an error
const tableErrors: Record<string, any> = {};

// Build a thenable chain that mimics supabase query builder
function makeChain(result: { data: any; error: any }) {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    order: vi.fn(() => chain),
    insert: vi.fn(() => Promise.resolve(result)),
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve(result)) })),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };

  // Make the chain itself thenable so `await supabase.from("t").select().eq()`
  // resolves to { data, error }
  chain.then = (resolve: any) => Promise.resolve(result).then(resolve);
  chain.catch = (reject: any) => Promise.resolve(result).catch(reject);

  return chain;
}

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const data = tableData[table];
      const error = tableErrors[table] || null;
      return makeChain({ data, error });
    }),
    rpc: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

vi.mock('../systemmessageService', () => ({
  createSystemMessage: vi.fn(),
}));

vi.mock('../userService', () => ({
  incrementResumeViews: vi.fn(),
}));

import {
  submitApplication,
  getUserApplications,
  getApplicantsForAdvertisement,
  rejectApplication,
  acceptApplication,
  getApplicantResumeUrl,
} from '../applicantService';
import { supabase } from '../../../lib/supabaseClient';
import { createSystemMessage } from '../systemmessageService';

describe('applicantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(tableData).forEach(k => delete tableData[k]);
    Object.keys(tableErrors).forEach(k => delete tableErrors[k]);
  });

  // ─── submitApplication ────────────────────────────────────────

  describe('submitApplication', () => {
    it('should return error if application already exists', async () => {
      tableData['job_applications'] = [{ id: 5 }];

      const result = await submitApplication(1, '10');

      expect(result).toEqual({ error: 'application already exists' });
    });

    it('should insert and return success for new application', async () => {
      tableData['job_applications'] = null; // maybeSingle returns null

      const result = await submitApplication(1, '10');

      expect(result).toEqual({ success: true });
      expect(supabase.from).toHaveBeenCalledWith('job_applications');
    });
  });

  // ─── getUserApplications ───────────────────────────────────────

  describe('getUserApplications', () => {
    it('should return submits from job_applications and works from employees', async () => {
      // Track which tables are requested and return the right data
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'job_applications') {
          return makeChain({
            data: [{ id: 1, status: 'submitted', advertisement: { title: 'Dev' } }],
            error: null,
          });
        }
        if (table === 'employees') {
          return makeChain({
            data: [{ id: 1, position: 'Dev', job_title: 'Szoftverfejlesztő', hourly_wage: 3500, hire_date: '2025-01-01', company: { name: 'TechCo' } }],
            error: null,
          });
        }
        return makeChain({ data: null, error: null });
      });

      const result = await getUserApplications(1);

      expect(result.submit).toHaveLength(1);
      expect(result.work).toHaveLength(1);
      expect(result.submit[0].status).toBe('submitted');
      expect(result.work[0].job_title).toBe('Szoftverfejlesztő');
    });

    it('should return empty arrays when no data', async () => {
      (supabase.from as any).mockImplementation(() =>
        makeChain({ data: null, error: null })
      );

      const result = await getUserApplications(1);

      expect(result.submit).toEqual([]);
      expect(result.work).toEqual([]);
    });
  });

  // ─── getApplicantsForAdvertisement ──────────────────────────────

  describe('getApplicantsForAdvertisement', () => {
    it('should deny access when ad does not belong to company', async () => {
      // First .from("advertisement") returns null → access denied
      (supabase.from as any).mockReturnValue(
        makeChain({ data: null, error: null })
      );

      const result = await getApplicantsForAdvertisement('1', 999);

      expect(result).toEqual({ error: 'Access denied or advertisement not found.' });
    });

    it('should return mapped applicants with click_count', async () => {
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'advertisement') {
          return makeChain({ data: { id: '1' }, error: null });
        }
        return makeChain({
          data: [{
            id: 10,
            user_id: 201,
            users: { fname: 'János', lname: 'Kovács' },
            advertisement: { click_count: 42 },
          }],
          error: null,
        });
      });

      const result = await getApplicantsForAdvertisement('1', 1);

      expect(result.applicants).toBeDefined();
      expect(result.applicants![0].click_count).toEqual({ click_count: 42 });
    });
  });

  // ─── rejectApplication ──────────────────────────────────────────

  describe('rejectApplication', () => {
    it('should reject an application successfully', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: { status: 'submitted', advertisement: { company_id: 1 } }, error: null })
      );

      const result = await rejectApplication('1', 1);

      expect(result).toEqual({ success: true });
    });

    it('should return 404 when application is null', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: null, error: null })
      );

      const result = await rejectApplication('999', 1);

      expect(result).toEqual({ error: 'Application not found', status: 404 });
    });

    it('should return 403 when company does not own the application', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: { status: 'submitted', advertisement: { company_id: 2 } }, error: null })
      );

      const result = await rejectApplication('1', 1);

      expect(result).toEqual({
        error: 'Unauthorized: You do not have permission to reject this application.',
        status: 403,
      });
    });

    it('should reject when application is not in submitted status', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: { status: 'accepted', advertisement: { company_id: 1 } }, error: null })
      );

      const result = await rejectApplication('1', 1);

      expect(result).toEqual({ error: 'Application not found', status: 404 });
    });
  });

  // ─── acceptApplication ──────────────────────────────────────────

  describe('acceptApplication', () => {
    it('should accept an application, create employee and send system message', async () => {
      const applicationData = {
        id: 1,
        last_updated: '2025-01-01',
        status: 'submitted',
        advertisement: {
          company_id: 1,
          position: 'Fejlesztő',
          title: 'Szoftverfejlesztő',
          hourly_wage: 3500,
        },
        user_id: 201,
      };

      (supabase.from as any).mockReturnValue(
        makeChain({ data: applicationData, error: null })
      );

      const result = await acceptApplication('1', 1);

      expect(result).toEqual({ success: true });
      expect(createSystemMessage).toHaveBeenCalledWith(
        201,
        'Gratulálunk!',
        expect.stringContaining('Fejlesztő'),
        'USER'
      );
    });

    it('should return 404 when application not found', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: null, error: null })
      );

      const result = await acceptApplication('999', 1);

      expect(result).toEqual({ error: 'Application not found', status: 404 });
    });

    it('should return 403 when company does not own the application', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({
          data: {
            id: 1,
            status: 'submitted',
            advertisement: { company_id: 2, position: 'Dev', title: 'Dev', hourly_wage: 3000 },
            user_id: 201,
          },
          error: null,
        })
      );

      const result = await acceptApplication('1', 1);

      expect(result).toEqual({
        error: 'Unauthorized: This application belongs to another company.',
        status: 403,
      });
    });

    it('should reject when application is not in submitted status', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({
          data: {
            id: 1,
            status: 'rejected',
            advertisement: { company_id: 1, position: 'Dev', title: 'Dev', hourly_wage: 3000 },
            user_id: 201,
          },
          error: null,
        })
      );

      const result = await acceptApplication('1', 1);

      expect(result).toEqual({ error: 'Application not found', status: 404 });
    });
  });

  // ─── getApplicantResumeUrl ──────────────────────────────────────

  describe('getApplicantResumeUrl', () => {
    it('should return signed URL for valid resume access', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({
          data: { user_id: 201, advertisement: { company_id: 1 } },
          error: null,
        })
      );

      (supabase.storage.from as any).mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: [{ name: 'resume.pdf', metadata: { size: 1024 } }],
          error: null,
        }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.url/resume.pdf' },
          error: null,
        }),
      });

      const result = await getApplicantResumeUrl('1', 1);

      expect(result).toMatchObject({
        success: true,
        url: 'https://signed.url/resume.pdf',
      });
    });

    it('should return 404 when application not found', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({ data: null, error: null })
      );

      const result = await getApplicantResumeUrl('999', 1);

      expect(result).toEqual({ error: 'Application not found', status: 404 });
    });

    it('should return 403 when company does not own the application', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({
          data: { user_id: 201, advertisement: { company_id: 2 } },
          error: null,
        })
      );

      const result = await getApplicantResumeUrl('1', 1);

      expect(result).toEqual({
        error: 'Unauthorized: You do not have permission to view this resume.',
        status: 403,
      });
    });

    it('should return 404 when no resume file found in storage', async () => {
      (supabase.from as any).mockReturnValue(
        makeChain({
          data: { user_id: 201, advertisement: { company_id: 1 } },
          error: null,
        })
      );

      (supabase.storage.from as any).mockReturnValue({
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        createSignedUrl: vi.fn(),
      });

      const result = await getApplicantResumeUrl('1', 1);

      expect(result).toEqual({ error: 'Resume file not found.', status: 404 });
    });
  });
});
