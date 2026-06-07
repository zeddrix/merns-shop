import Meta from '../components/Meta';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import {
  ABOUT_KEYWORDS,
  DEVELOPER_GITHUB_REPO_URL,
  DEVELOPER_LINKEDIN_URL,
  DEVELOPER_PORTFOLIO_URL,
  PRODUCTION_SITE_URL,
  ROBOTS_INDEX_FOLLOW
} from '../constants/seo';
import { buildAboutJsonLd, buildAboutMetaDescription, buildAboutTitle } from '../utils/seoMeta';

const HIGHLIGHTS = [
  {
    title: 'Storefront',
    body: '~170 products and 500+ variants with filters, reviews, search, and responsive layouts.'
  },
  {
    title: 'Checkout',
    body: 'Guest and registered flows with PayPal sandbox payments and httpOnly cookie auth.'
  },
  {
    title: 'Admin',
    body: 'Products, orders, and users CRUD with order fulfillment and privilege management.'
  },
  {
    title: 'PWA and push',
    body: 'Installable app, offline shell, service-worker updates, and order push notifications.'
  },
  {
    title: 'SEO',
    body: 'Canonical URLs, Open Graph, sitemap, JSON-LD, and crawler-friendly HTML.'
  },
  {
    title: 'Testing',
    body: 'Playwright E2E journeys and Vitest unit/integration suites with ATDD workflow.'
  }
] as const;

const TECH_STACK = [
  { name: 'React', version: '19' },
  { name: 'Express', version: '5' },
  { name: 'MongoDB', version: '7 / Atlas M0' },
  { name: 'TypeScript', version: '5.8' },
  { name: 'Vite', version: '6' },
  { name: 'Redux Toolkit', version: '2.6' },
  { name: 'Mongoose', version: '9' },
  { name: 'Playwright', version: '1.57' },
  { name: 'Vitest', version: '3' },
  { name: 'Workbox', version: '7.4' },
  { name: 'Node.js', version: '22' },
  { name: 'Render', version: 'free tier' }
] as const;

const AboutScreen = () => {
  const metaTitle = buildAboutTitle();
  const metaDescription = buildAboutMetaDescription();

  return (
    <>
      <Meta
        title={metaTitle}
        description={metaDescription}
        canonicalPath="/about"
        robots={ROBOTS_INDEX_FOLLOW}
        keywords={ABOUT_KEYWORDS}
        jsonLd={buildAboutJsonLd(metaDescription)}
      />
      <div className="about-page" data-testid="about-page">
        <h1 data-testid="about-heading">About Zeddrix Fabian</h1>
        <p className="about-intro">
          I am <span data-testid="about-developer">Zeddrix Fabian</span>, a full-stack developer,
          and {DISPLAY_BRAND_NAME} is my featured portfolio project — a production-style electronics
          store that demonstrates real e-commerce flows, modern MERN tooling, and rigorous automated
          testing.
        </p>

        <section className="about-section" data-testid="about-highlights">
          <h2>What {DISPLAY_BRAND_NAME} demonstrates</h2>
          <div className="about-highlights-grid">
            {HIGHLIGHTS.map((item) => (
              <article key={item.title} className="about-highlight-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" data-testid="about-tech-stack">
          <h2>Tech stack</h2>
          <ul className="about-tech-list">
            {TECH_STACK.map((item) => (
              <li key={item.name} className="about-tech-item">
                <span className="about-tech-name">{item.name}</span>
                <span className="about-tech-version">{item.version}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-section" data-testid="about-deployment">
          <h2>Deployment</h2>
          <p>
            The live app runs on <strong>MongoDB Atlas M0</strong> for the database and{' '}
            <strong>Render</strong> free-tier web hosting. Browse the deployed store at{' '}
            <a href={PRODUCTION_SITE_URL} target="_blank" rel="noopener noreferrer">
              {PRODUCTION_SITE_URL.replace(/^https:\/\//, '')}
            </a>
            .
          </p>
        </section>

        <div className="about-timeline">
          <article
            data-testid="about-timeline-2021"
            className="about-timeline-card about-timeline-card--origin"
          >
            <p className="about-timeline-year">2021</p>
            <h2>Built from scratch</h2>
            <p>
              I created this project in March 2021 while taking a Udemy course on the MERN stack.
              There was no AI tooling yet — just tutorials, documentation, and trial and error as I
              learned React, Express, MongoDB, and Redux.
            </p>
          </article>

          <article
            data-testid="about-timeline-2026"
            className="about-timeline-card about-timeline-card--revival"
          >
            <p className="about-timeline-year">2026</p>
            <h2>Modernized with ATDD</h2>
            <p>
              In June 2026 I rediscovered this repo and rebuilt it with modern tooling — TypeScript,
              Vite, React 19 — using AI-assisted agentic development and acceptance test-driven
              development (ATDD). That is how the shop looks today.
            </p>
          </article>
        </div>

        <section className="about-profiles" data-testid="about-profiles">
          <h2>Connect</h2>
          <ul>
            <li>
              <a
                data-testid="about-linkedin-link"
                href={DEVELOPER_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zeddrix Fabian on LinkedIn
              </a>
            </li>
            <li>
              <a
                data-testid="about-portfolio-link"
                href={DEVELOPER_PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zeddrix Fabian portfolio on GitHub
              </a>
            </li>
            <li>
              <a
                data-testid="about-github-link"
                href={DEVELOPER_GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                MERN&apos;s Shop source on GitHub
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default AboutScreen;
