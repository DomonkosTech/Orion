import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApplicantTrackingSystem from '../ApplicantTrackingSystem';
import * as appApi from '../../../../Api/applicationApi';
import { toast } from 'react-hot-toast';

// Mock the API calls
vi.mock('../../../../Api/applicationApi', () => ({
  getApplicantsForAdvertisement: vi.fn(),
  updateApplicationStatus: vi.fn(),
  getResumeUrl: vi.fn(),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ApplicantTrackingSystem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/ats/1']}>
        <Routes>
          <Route path="/ats/:id" element={<ApplicantTrackingSystem />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should load and display applicants on mount', async () => {
    vi.mocked(appApi.getApplicantsForAdvertisement).mockResolvedValue({
      success: true,
      applicants: [
        {
          id: 1,
          user_id: 201,
          users: { fname: 'János', lname: 'Kovács', email: 'janos@test.com', birth_date: '1990-01-01', birth_place: 'Budapest' },
          click_count: { click_count: 5 }
        }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Kovács János/i)).toBeInTheDocument();
      expect(screen.getByText('janos@test.com')).toBeInTheDocument();
    });
  });

  it('should call accept API and show toast when accept button is clicked', async () => {
    vi.mocked(appApi.getApplicantsForAdvertisement).mockResolvedValue({
      success: true,
      applicants: [
        {
          id: 1,
          user_id: 201,
          users: { fname: 'János', lname: 'Kovács', email: 'janos@test.com', birth_date: '1990-01-01', birth_place: 'Budapest' },
          click_count: { click_count: 5 }
        }
      ]
    });
    vi.mocked(appApi.updateApplicationStatus).mockResolvedValue({ success: true });

    renderComponent();

    await waitFor(() => screen.getByText(/Kovács János/i));

    const acceptBtn = screen.getByTestId('accept-btn');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(appApi.updateApplicationStatus).toHaveBeenCalledWith(1, 'accepted');
      expect(toast.success).toHaveBeenCalled();
      // Verify applicant is removed from list (optimistic UI update in the component)
      expect(screen.queryByText(/Kovács János/i)).not.toBeInTheDocument();
    });
  });
});
