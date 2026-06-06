import Meta from '../components/Meta';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import { ROBOTS_INDEX_FOLLOW } from '../constants/seo';
import { buildAboutJsonLd, buildAboutMetaDescription, buildAboutTitle } from '../utils/seoMeta';

const GITHUB_REPO_URL = 'https://github.com/zeddrix/merns-shop';

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
        jsonLd={buildAboutJsonLd(metaDescription)}
      />
      <div className="about-page" data-testid="about-page">
        <h1 data-testid="about-heading">About This Project</h1>
        <p className="about-intro">
          {DISPLAY_BRAND_NAME} is a dummy MERN e-commerce shop built for my portfolio. It was
          developed by <span data-testid="about-developer">Zeddrix Fabian</span>.
        </p>

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

        <p className="about-source">
          <a
            data-testid="about-github-link"
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
        </p>
      </div>
    </>
  );
};

export default AboutScreen;
