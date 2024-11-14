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
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { GithubApiClient, githubApiRef } from './api';

export const githubFrontendPlugin = createPlugin({
  id: 'github',
  apis: [
    createApiFactory({
      api: githubApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ discoveryApi, configApi }) =>
        new GithubApiClient({ discoveryApi, configApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const GithubFrontendPage = githubFrontendPlugin.provide(
  createRoutableExtension({
    name: 'GithubFrontendPage',
    component: () =>
      import('./components/GithubLocalComponent/MyPullRequestsTable').then(
        m => m.MyPullRequestsTable,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const GithubReviewFrontendPage = githubFrontendPlugin.provide(
  createRoutableExtension({
    name: 'GithubReviewFrontendPage',
    component: () =>
      import('./components/GithubLocalComponent/ReviewPullRequestsTable').then(
        m => m.ReviewPullRequestsTable,
      ),
    mountPoint: rootRouteRef,
  }),
);
