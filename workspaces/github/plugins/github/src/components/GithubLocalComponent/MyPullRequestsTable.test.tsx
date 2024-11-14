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
import { ApiProvider } from '@backstage/core-app-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { MyPullRequestsTable } from './MyPullRequestsTable';
import { fetchPRsByUserInOrg } from '../../api/githubApiGraphQL';
import { usernameApi } from '../../utils/usernameApi';

// Mock the API and username API
jest.mock('../../api/githubApiGraphQL');
jest.mock('../../utils/usernameApi');

describe('MyPullRequestsTable', () => {
  const mockPRs = [
    {
      title: 'Fix issue #123',
      createdAt: '2024-09-01T12:34:56Z',
      url: 'https://github.com/nineleaps/repo/pull/123',
    },
    {
      title: 'Add new feature',
      createdAt: '2024-08-28T08:15:00Z',
      url: 'https://github.com/nineleaps/repo/pull/124',
    },
  ];

  const mockConfigApi = {
    getOptionalString: () => 'nineleaps',
  };

  beforeEach(() => {
    (fetchPRsByUserInOrg as jest.Mock).mockResolvedValue({
      pullRequests: mockPRs,
    });
    (usernameApi as jest.Mock).mockReturnValue({
      profile: { displayName: 'kalyaniNakat' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithApiProvider = (ui: React.ReactNode) => {
    const apis = [[configApiRef, mockConfigApi]];
    return render(<ApiProvider apis={new Map(apis)}>{ui}</ApiProvider>);
  };

  it('renders loading spinner initially', () => {
    renderWithApiProvider(<MyPullRequestsTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders pull requests table after data is fetched', async () => {
    renderWithApiProvider(<MyPullRequestsTable />);

    await waitFor(() => expect(fetchPRsByUserInOrg).toHaveBeenCalled());

    expect(screen.getByText('Open PRs')).toBeInTheDocument();
    expect(screen.getByText('Fix issue #123')).toBeInTheDocument();
    expect(screen.getByText('Add new feature')).toBeInTheDocument();
  });

  it('renders error message on fetch failure', async () => {
    (fetchPRsByUserInOrg as jest.Mock).mockRejectedValue(
      new Error('API error'),
    );

    renderWithApiProvider(<MyPullRequestsTable />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to fetch pull requests/i),
      ).toBeInTheDocument(),
    );
  });
});
