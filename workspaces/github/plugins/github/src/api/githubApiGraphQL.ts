// /*
//  * Copyright 2024 The Backstage Authors
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// import { graphql } from '@octokit/graphql';
// import { ConfigApi } from '@backstage/core-plugin-api';

// let graphqlWithAuth: ReturnType<typeof graphql.defaults>;

// export interface PullRequest {
//   title: string;
//   url: string;
//   state: string;
//   repositoryNameWithOwner: string;
//   repositoryOwnerLogin: string;
//   authorLogin: string;
//   createdAt: string;
// }

// export interface PullRequestReview {
//   title: string;
//   url: string;
//   state: string;
//   repositoryNameWithOwner: string;
//   repositoryOwnerLogin: string;
//   authorLogin: string;
//   createdAt: string;
// }

// async function initializeGraphqlWithAuth(configApi: ConfigApi): Promise<void> {
//   const token = configApi.getOptionalString('github.token');

//   if (!token) {
//     throw new Error('GitHub token is not defined in the config');
//   }

//   graphqlWithAuth = graphql.defaults({
//     headers: {
//       authorization: `token ${token}`,
//     },
//   });
// }

// export async function fetchPRsWhereUserIsReviewer(
//   configApi: ConfigApi,
//   login: string,
//   organization: string,
//   cursor?: string,
// ): Promise<{
//   pullRequests: PullRequestReview[];
//   hasNextPage: boolean;
//   endCursor: string | null;
// }> {
//   try {
//     await initializeGraphqlWithAuth(configApi);
//     const query = `
//       query($org: String!, $cursor: String) {
//         organization(login: $org) {
//           repositories(first: 50, after: $cursor) {
//             nodes {
//               name
//               pullRequests(first: 100, states: OPEN) {
//                 nodes {
//                   title
//                   url
//                   state
//                   createdAt
//                   author {
//                     login
//                   }
//                   reviewRequests(first: 50) {
//                     nodes {
//                       requestedReviewer {
//                         ... on User {
//                           login
//                         }
//                       }
//                     }
//                   }
//                   reviews(first: 10) {
//                     nodes {
//                       author {
//                         login
//                       }
//                       state
//                     }
//                   }
//                   repository {
//                     nameWithOwner
//                     owner {
//                       login
//                     }
//                   }
//                 }
//                 pageInfo {
//                   hasNextPage
//                   endCursor
//                 }
//               }
//             }
//             pageInfo {
//               hasNextPage
//               endCursor
//             }
//           }
//         }
//       }
//     `;

//     const variables = { org: organization, cursor };
//     let hasNextPage = true;
//     let allPRs: PullRequestReview[] = [];

//     while (hasNextPage) {
//       const result = await graphqlWithAuth(query, variables);

//       result.organization.repositories.nodes.forEach((repo: any) => {
//         repo.pullRequests.nodes.forEach((pr: any) => {
//           if (
//             pr.reviewRequests.nodes.some(
//               (request: any) => request.requestedReviewer?.login === login,
//             ) ||
//             pr.reviews.nodes.some(
//               (review: any) => review.author.login === login,
//             )
//           ) {
//             allPRs.push({
//               title: pr.title,
//               url: pr.url,
//               state: pr.state,
//               repositoryNameWithOwner: pr.repository.nameWithOwner,
//               repositoryOwnerLogin: pr.repository.owner.login,
//               authorLogin: pr.author.login,
//               createdAt: pr.createdAt,
//             });
//           }
//         });
//       });

//       hasNextPage = result.organization.repositories.pageInfo.hasNextPage;
//       variables.cursor = result.organization.repositories.pageInfo.endCursor;
//     }

//     return { pullRequests: allPRs, hasNextPage, endCursor: variables.cursor };
//   } catch (error) {
//     console.error('Error fetching PRs in organization:', error);
//     return { pullRequests: [], hasNextPage: false, endCursor: null };
//   }
// }

// export async function fetchPRsByUserInOrg(
//   configApi: ConfigApi,
//   login: string,
//   organization: string,
//   cursor?: string,
//   direction: 'next' | 'prev' = 'next',
// ): Promise<{
//   pullRequests: PullRequest[];
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
//   endCursor: string | null;
//   startCursor: string | null;
// }> {
//   try {
//     await initializeGraphqlWithAuth(configApi);

//     const query = `
//       query($login: String!, $cursor: String) {
//         user(login: $login) {
//           pullRequests(first: 100, states: OPEN, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
//             nodes {
//               title
//               url
//               state
//               repository {
//                 nameWithOwner
//                 owner {
//                   login
//                 }
//               }
//               author {
//                 login
//               }
//               createdAt
//             }
//             pageInfo {
//               hasNextPage
//               hasPreviousPage
//               startCursor
//               endCursor
//             }
//           }
//         }
//       }
//     `;

//     const variables = { login, cursor };
//     const result = await graphqlWithAuth(query, variables);

//     const pullRequests = result.user.pullRequests.nodes.filter(
//       (pr: any) =>
//         pr.repository.owner.login === organization ||
//         pr.repository.owner.login.toLowerCase('en-US') ===
//           login.toLowerCase('en-US'),
//     );

//     return {
//       pullRequests: pullRequests.map((pr: any) => ({
//         title: pr.title,
//         url: pr.url,
//         state: pr.state,
//         repositoryNameWithOwner: pr.repository.nameWithOwner,
//         repositoryOwnerLogin: pr.repository.owner.login,
//         authorLogin: pr.author.login,
//         createdAt: pr.createdAt,
//       })),
//       hasNextPage: result.user.pullRequests.pageInfo.hasNextPage,
//       hasPreviousPage: result.user.pullRequests.pageInfo.hasPreviousPage,
//       endCursor: result.user.pullRequests.pageInfo.endCursor,
//       startCursor: result.user.pullRequests.pageInfo.startCursor,
//     };
//   } catch (error) {
//     console.error('Error fetching PRs raised by user:', error);
//     return {
//       pullRequests: [],
//       hasNextPage: false,
//       hasPreviousPage: false,
//       endCursor: null,
//       startCursor: null,
//     };
//   }
// }
