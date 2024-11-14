/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ReviewPullRequestsTable } from './ReviewPullRequestsTable';
import { fetchPRsWhereUserIsReviewer } from '../../api/githubApiGraphQL';
import { useApi } from '@backstage/core-plugin-api';
import { usernameApi } from '../../utils/usernameApi';

jest.mock('../../api/githubApiGraphQL');
jest.mock('../../utils/usernameApi');
jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('ReviewPullRequestsTable', () => {
  const mockPRsReview = [
    {
      title: 'Fix issue #125',
      createdAt: '2024-09-02T10:30:00Z',
      url: 'https://github.com/nineleaps/repo/pull/125',
    },
    {
      title: 'Implement new feature',
      createdAt: '2024-09-01T09:20:00Z',
      url: 'https://github.com/nineleaps/repo/pull/126',
    },
  ];

  const mockConfigApi = {
    getOptionalString: jest.fn().mockReturnValue('nineleaps'),
  };

  beforeEach(() => {
    (fetchPRsWhereUserIsReviewer as jest.Mock).mockResolvedValue({
      pullRequests: mockPRsReview,
    });
    (usernameApi as jest.Mock).mockReturnValue({
      profile: { displayName: 'kalyaniNakat' },
    });
    (useApi as jest.Mock).mockReturnValue(mockConfigApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner initially', () => {
    render(<ReviewPullRequestsTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders pull requests table after data is fetched', async () => {
    render(<ReviewPullRequestsTable />);

    await waitFor(() => expect(fetchPRsWhereUserIsReviewer).toHaveBeenCalled());

    expect(screen.getByText('Review PRs')).toBeInTheDocument();
    expect(screen.getByText('Fix issue #125')).toBeInTheDocument();
    expect(screen.getByText('Implement new feature')).toBeInTheDocument();
  });

  it('renders error message on fetch failure', async () => {
    (fetchPRsWhereUserIsReviewer as jest.Mock).mockRejectedValue(
      new Error('API error'),
    );

    render(<ReviewPullRequestsTable />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to fetch review pull requests/i),
      ).toBeInTheDocument(),
    );
  });
});
