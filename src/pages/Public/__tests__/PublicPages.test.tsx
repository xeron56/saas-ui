import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useRequest } from 'ahooks';
import { useLocation, useParams } from '@umijs/max';
import BlogDetail from '../BlogDetail';
import Contact from '../Contact';
import Home from '../Home';
import LegalPage from '../LegalPage';
import * as service from '../service';

jest.mock('ahooks', () => ({
  useRequest: jest.fn(),
}));

const mockUseLocation = useLocation as jest.Mock;
const mockUseParams = useParams as jest.Mock;
const mockUseRequest = useRequest as unknown as jest.Mock;

jest.mock('@umijs/max', () => {
  const React = require('react');
  return {
    useLocation: jest.fn(),
    useParams: jest.fn(),
    Link: (props: any) => React.createElement('a', { href: props.to }, props.children),
  };
});

jest.mock('../Shell', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('main', null, props.children),
  };
});

jest.mock('../service', () => ({
  getAvailablePlans: jest.fn(),
  getPublicBlog: jest.fn(),
  getPublicContact: jest.fn(),
  getPublicDataDeletion: jest.fn(),
  getPublicHome: jest.fn(),
  getPublicPrivacyPolicy: jest.fn(),
  getPublicTermsConditions: jest.fn(),
  sendPublicBlogComment: jest.fn(),
  sendPublicContact: jest.fn(),
}));

const homeReply = {
  data: {
    page_data: {
      headings: {
        hero_title: 'Tenant growth console',
        hero_subtitle: 'Plans, payments, and public signup are handled from Go services.',
      },
    },
    banners: [{ id: 'banner_1', title: 'SSLCommerz checkout', summary: 'Hosted payment ready' }],
    features: [
      { id: 'feature_1', title: 'Tenant billing', body: 'Automatic activation after payment' },
    ],
    interfaces: [],
    testimonials: [],
    recent_blogs: [],
  },
};

const plansReply = {
  items: [
    {
      key: 'starter',
      displayName: 'Starter Retail',
      features: [{ label: 'One branch' }],
      prices: [
        {
          id: 'price_starter',
          default: { text: 'BDT 1,250' },
          recurring: { interval: 'month', intervalCount: '1' },
        },
      ],
    },
  ],
};

const contactReply = {
  data: {
    page_data: {
      headings: {
        contact_us_title: 'Migration desk',
        contact_us_description: 'Talk to the team about plan setup.',
      },
    },
    general: {
      email: 'support@example.com',
      phone: '01700000000',
    },
  },
};

const legalReply = {
  data: {
    page: {
      key: 'privacy-policy',
      value: {
        title: 'Privacy after migration',
        body: 'Tenant data remains isolated in the new PostgreSQL-backed services.',
      },
    },
  },
};

const blogReply = {
  data: {
    blog: {
      id: 'blog_1',
      title: 'Migrated comment workflow',
      slug: 'migrated-comment-workflow',
      summary: 'Public blog comments now use the Go public-site API.',
      body: 'Readers can submit comments without the Laravel Blade page.',
      author_name: 'Migration Desk',
      published_at: '2026-05-24T10:00:00Z',
    },
    comments: [
      {
        id: 'comment_1',
        name: 'Existing Reader',
        email: 'reader@example.com',
        comment: 'This comment came from migrated storage.',
      },
    ],
  },
};

beforeEach(() => {
  mockUseLocation.mockReturnValue({ pathname: '/privacy-policy', search: '' });
  mockUseParams.mockReturnValue({ slug: 'migrated-comment-workflow' });
  mockUseRequest.mockImplementation((fn: unknown) => {
    if (fn === service.getPublicHome) {
      return { data: homeReply, loading: false };
    }
    if (fn === service.getAvailablePlans) {
      return { data: plansReply, loading: false };
    }
    if (fn === service.getPublicContact) {
      return { data: contactReply, loading: false };
    }
    if (fn === service.getPublicPrivacyPolicy) {
      return { data: legalReply, loading: false };
    }
    return { data: undefined, loading: false };
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders migrated public home content and SaaS plans', () => {
  render(React.createElement(Home));

  expect(screen.getByText('Tenant growth console')).toBeTruthy();
  expect(screen.getByText('SSLCommerz checkout')).toBeTruthy();
  expect(screen.getByText('Tenant billing')).toBeTruthy();
  expect(screen.getByText('Starter Retail')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Start setup' }).getAttribute('href')).toBe(
    '/user/register?plan_key=starter&price_id=price_starter',
  );
});

test('renders contact data from the public-site API', () => {
  render(React.createElement(Contact));

  expect(screen.getByText('Migration desk')).toBeTruthy();
  expect(screen.getByText('support@example.com')).toBeTruthy();
  expect(screen.getByText('01700000000')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Send message' })).toBeTruthy();
});

test('renders privacy policy content from migrated legal page data', async () => {
  render(React.createElement(LegalPage));

  await waitFor(() => {
    expect(screen.getByText('Privacy after migration')).toBeTruthy();
  });
  expect(
    screen.getByText('Tenant data remains isolated in the new PostgreSQL-backed services.'),
  ).toBeTruthy();
});

test('renders blog comments and submits through the public blog API', async () => {
  const refresh = jest.fn();
  const sendComment = service.sendPublicBlogComment as jest.Mock;
  sendComment.mockResolvedValue({
    message: 'Comment submitted.',
    data: { id: 'comment_2', name: 'New Reader', comment: 'Looks good.' },
  });
  mockUseRequest.mockImplementationOnce(() => ({
    data: blogReply,
    loading: false,
    error: undefined,
    refresh,
  }));

  render(React.createElement(BlogDetail));

  expect(screen.getByText('Migrated comment workflow')).toBeTruthy();
  expect(screen.getByText('This comment came from migrated storage.')).toBeTruthy();

  fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
    target: { value: 'New Reader' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
    target: { value: 'new.reader@example.com' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Comment' }), {
    target: { value: 'Looks good.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit comment' }));

  await waitFor(() => {
    expect(sendComment).toHaveBeenCalledWith('migrated-comment-workflow', {
      name: 'New Reader',
      email: 'new.reader@example.com',
      comment: 'Looks good.',
      blog_slug: 'migrated-comment-workflow',
    });
  });
  expect(refresh).toHaveBeenCalled();
});
