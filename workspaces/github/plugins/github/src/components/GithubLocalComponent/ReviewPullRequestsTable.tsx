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

import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  makeStyles,
  Card,
  CardContent,
} from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { usernameApi } from '../../utils/usernameApi';
import { GitHubNoBorderIcon } from '../../utils/icon';
import { githubApiRef } from '../../api';

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: '8px',
    boxShadow: 'none',
    backgroundColor: '#FFFFFF',
    padding: '0px',
    height: '371px',
  },
  table: {
    minWidth: 650,
    boxShadow: 'none',
    border: 'none',
  },
  headerText: {
    fontWeight: 500,
    fontSize: 16,
    backgroundColor: '#F3F4F8',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  chip: {
    marginRight: theme.spacing(1),
    borderRadius: '8px',
    marginTop: '4px',
  },
  prIcon: {
    color: '#3B82F6',
  },
  row: {
    height: 'auto',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  header: {
    padding: '0px 16px',
    backgroundColor: '#F3F4F8',
  },
  cell: {
    padding: '0px 22px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'none',
  },
  tableContainer: {
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  },
}));

export const ReviewPullRequestsTable = () => {
  const classes = useStyles();

  const githubApi = useApi(githubApiRef);
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { profile } = usernameApi();
  const username = profile?.displayName;
  const email = profile?.email;
  const [error, setError] = useState<string | null>(null);

  const configApi = useApi(configApiRef);
  const org = configApi.getOptionalString('app.organisation');

  const fetchPRs = async () => {
    setLoading(true);
    setError(null);
    try {
      const prsMessageResponse = await githubApi.fetchAndStoreReviewPRs(
        username,
        email,
        org,
      );
      console.log('🚀 ~ fetchPRs ~ prsMessageResponse:', prsMessageResponse);

      const prs = await githubApi.getStoredReviewPRs();
      // const prs = await githubApi.getStoredReviewPRs(username, email, org);
      setPullRequests(prs);
      // setPullRequests(prs.pullRequests);
    } catch (e) {
      setError('Failed to fetch pull requests.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) {
      return;
    }
    fetchPRs();
    // }, [username]);
  }, [configApi, username]);

  if (!username || loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const calculateDaysAgo = (createdDate: string): string => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  return (
    <Card className={classes.card}>
      <CardContent style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Typography
          style={{
            marginBottom: '16px',
            fontWeight: 500,
            fontSize: 20,
            color: '#6A6A6A',
            paddingLeft: '20px',
          }}
        >
          Review PRs
        </Typography>
        <TableContainer
          component={Paper}
          className={classes.tableContainer}
          style={{ boxShadow: 'none' }}
        >
          <Table className={classes.table} aria-label="pen pull requests table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerText}>Title</TableCell>
                <TableCell className={classes.headerText}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pullRequests?.map((pr, index) => (
                <TableRow key={index} className={classes.row}>
                  <TableCell
                    className={classes.cell}
                    style={{
                      color: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    }}
                  >
                    <GitHubNoBorderIcon />
                    <a href={pr.url} target="_blank" rel="noopener noreferrer">
                      <Typography variant="body1">{pr.title}</Typography>
                    </a>
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {calculateDaysAgo(pr.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
