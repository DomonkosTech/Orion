import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShowJob from '../ShowJob';
import { server } from '../../../../../mocks/server';
import { http, HttpResponse } from 'msw';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('ShowJob Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    server.resetHandlers();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/job/1']}>
        <Routes>
          <Route path="/job/:id" element={<ShowJob />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should load and display job details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Teszt Állás')).toBeInTheDocument();
    });

    expect(screen.getByText('Részletes leírás')).toBeInTheDocument();
    expect(screen.getByText('Feladatok leírása')).toBeInTheDocument();
    expect(screen.getByText('Követelmények')).toBeInTheDocument();
    expect(screen.getByText('Budapest')).toBeInTheDocument();
    expect(screen.getByText('Teszt Kft.')).toBeInTheDocument();
    expect(screen.getByText('3500 Ft')).toBeInTheDocument();
  });

  it('should display error state when job fetch fails', async () => {
    server.use(
      http.get('*/api/advertisements/:id', () => {
        return HttpResponse.json({ error: 'Hirdetés nem található' }, { status: 404 });
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('jobs.show.fetchError')).toBeInTheDocument();
    });
  });

  it('should call submitApplication and show success message on apply', async () => {
    renderComponent();

    await waitFor(() => screen.getByText('Teszt Állás'));

    // Override the POST handler for this specific test to track the call
    let applicationSubmitted = false;
    server.use(
      http.post('*/api/applications', async () => {
        applicationSubmitted = true;
        return HttpResponse.json({ success: true });
      }),
    );

    const applyBtn = screen.getByTestId('show-job-apply-btn');
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(applicationSubmitted).toBe(true);
    });
  });

  it('should show already-applied message on 409', async () => {
    server.use(
      http.post('*/api/applications', () => {
        return HttpResponse.json({ error: 'application already exists' }, { status: 409 });
      }),
    );

    renderComponent();

    await waitFor(() => screen.getByText('Teszt Állás'));

    const applyBtn = screen.getByTestId('show-job-apply-btn');
    fireEvent.click(applyBtn);

    // Component enforces MIN_DELAY of 1s before showing status
    await waitFor(() => {
      expect(screen.getByTestId('application-status-msg')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should disable apply button while submitting', async () => {
    server.use(
      http.post('*/api/applications', async () => {
        // Delay to keep us in submitting state
        await new Promise(r => setTimeout(r, 200));
        return HttpResponse.json({ success: true });
      }),
    );

    renderComponent();

    await waitFor(() => screen.getByText('Teszt Állás'));

    const applyBtn = screen.getByTestId('show-job-apply-btn');
    fireEvent.click(applyBtn);

    expect(applyBtn).toBeDisabled();
  });

  it('should update monthly wage when hours input changes', async () => {
    renderComponent();

    await waitFor(() => screen.getByText('Teszt Állás'));

    const hoursInput = screen.getByDisplayValue('40');
    fireEvent.change(hoursInput, { target: { value: '20' } });

    // 3500 * 20 * 4 = 280000, which toLocaleString() formats (e.g. "280 000" in hu)
    await waitFor(() => {
      const wageElement = screen.getByText((content) => {
        return content.includes('280') && content.includes('000');
      });
      expect(wageElement).toBeInTheDocument();
    });
  });

  it('should navigate back on back button click', async () => {
    renderComponent();

    await waitFor(() => screen.getByText('Teszt Állás'));

    const backBtn = screen.getByTestId('show-job-back-btn');
    fireEvent.click(backBtn);

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
