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

import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';

export interface GithubIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
}

export interface GithubApi {
  listIssues: () => Promise<GithubIssue[]>;
}
type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export const githubApiRef = createApiRef<GithubApi>({
  id: 'plugin.github.service',
});

// export class GithubApiClient implements GithubApi {
//   async listIssues(): Promise<GithubIssue[]> {
//     return [];
//   }
// }

export class GithubApiClient {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async fetchAndStorePRs(
    username: string,
    email: string,
    organization: string,
  ) {
    const proxyUrl = await this.discoveryApi.getBaseUrl('github');
    const body = { login: username, email: email, organization: organization };

    const response = await fetch(`${proxyUrl}/fetch-pull-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log('🚀 ~ GithubApiClient ~ response:', response);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch and store my PRs: ${response.statusText}`,
      );
    }
    const responseJSON = await response.json();
    return responseJSON;
  }

  async getStoredPRs() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('github');

    const response = await fetch(`${proxyUrl}/pull-requests`);

    if (!response.ok) {
      throw new Error(`Failed to fetch my PRs: ${response.statusText}`);
    }
    return await response.json();
  }

  async fetchAndStoreReviewPRs(
    username: string,
    email: string,
    organization: string,
  ) {
    const proxyUrl = await this.discoveryApi.getBaseUrl('github');
    const body = { login: username, email: email, organization: organization };

    const response = await fetch(`${proxyUrl}/fetch-pull-requests-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch and store review PRs: ${response.statusText}`,
      );
    }
    const responseJSON = await response.json();
    return responseJSON;
  }

  async getStoredReviewPRs() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('github');

    const response = await fetch(`${proxyUrl}/pull-requests-review`);

    if (!response.ok) {
      throw new Error(`Failed to fetch review PRs: ${response.statusText}`);
    }
    return await response.json();
  }
}
