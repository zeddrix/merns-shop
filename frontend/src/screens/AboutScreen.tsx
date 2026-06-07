import Meta from '../components/Meta';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import {
  ABOUT_KEYWORDS,
  DEVELOPER_GITHUB_REPO_URL,
  DEVELOPER_LINKEDIN_URL,
  DEVELOPER_PORTFOLIO_URL,
  ROBOTS_INDEX_FOLLOW
} from '../constants/seo';
import { buildAboutJsonLd, buildAboutMetaDescription, buildAboutTitle } from '../utils/seoMeta';

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
          {DISPLAY_BRAND_NAME} is a MERN stack portfolio e-commerce demo built by{' '}
          <span data-testid="about-developer">Zeddrix Fabian</span>. It showcases TypeScript, React
          19, Vite, Express, MongoDB, Redux Toolkit, and acceptance test-driven development.
        </p>

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
      </div>
    </>
  );
};

export default AboutScreen;
