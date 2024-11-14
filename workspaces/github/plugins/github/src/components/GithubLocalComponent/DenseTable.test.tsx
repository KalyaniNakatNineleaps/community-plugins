import React from 'react';
import { render, screen } from '@testing-library/react';
import DenseTable from './DenseTable';

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  Table: jest.fn(({ columns, data, title }) => (
    <div>
      <h1>{title}</h1>
      <table>
        <thead>
          <tr>
            {columns.map((column: any) => (
              <th key={column.field}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, index: number) => (
            <tr key={index}>
              {columns.map((column: any) => (
                <td key={column.field}>{row[column.field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )),
}));

describe('DenseTable', () => {
  const mockIssues = [
    {
      id: '1',
      key: 'ISSUE-1',
      fields: {
        summary: 'Issue Summary 1',
        status: { name: 'Open' },
        assignee: { displayName: 'User A' },
        reporter: { displayName: 'Reporter A' },
      },
    },
    {
      id: '2',
      key: 'ISSUE-2',
      fields: {
        summary: 'Issue Summary 2',
        status: { name: 'Closed' },
        assignee: { displayName: 'User B' },
        reporter: { displayName: 'Reporter B' },
      },
    },
  ];

  it('renders the table with correct title', () => {
    render(<DenseTable issues={mockIssues} />);
    expect(screen.getByText('Github Issues')).toBeInTheDocument();
  });

  it('renders the correct column headers', () => {
    render(<DenseTable issues={mockIssues} />);
    
    const headers = ['Key', 'Summary', 'Status', 'Assignee', 'Reporter'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders the correct data in the table rows', () => {
    render(<DenseTable issues={mockIssues} />);

    expect(screen.getByText('ISSUE-1')).toBeInTheDocument();
    expect(screen.getByText('Issue Summary 1')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('User A')).toBeInTheDocument();
    expect(screen.getByText('Reporter A')).toBeInTheDocument();

    expect(screen.getByText('ISSUE-2')).toBeInTheDocument();
    expect(screen.getByText('Issue Summary 2')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('User B')).toBeInTheDocument();
    expect(screen.getByText('Reporter B')).toBeInTheDocument();
  });

  it('handles empty issues list correctly', () => {
    render(<DenseTable issues={[]} />);
    expect(screen.getByText('Github Issues')).toBeInTheDocument();
    // Since we are mocking the Table component, check for the absence of any row data.
    expect(screen.queryByRole('row', { name: /ISSUE-/i })).not.toBeInTheDocument();
  });
});
