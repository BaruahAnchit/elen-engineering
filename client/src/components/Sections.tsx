import transformerImg from '../assets/transformer.jpg'
import teamImg from '../assets/team.jpg'
import technicianImg from '../assets/technician.jpg'

const STRIP = [
  ['♙', 'Meaningful Work', ['Contribute to real-world', 'power solutions']],
  ['♧', 'Learning & Growth', ['Build technical and', 'leadership skills']],
  ['♧', 'Collaborative Culture', ['Work with passionate', 'professionals']],
  ['♙', 'Impactful Careers', ["Be part of India's", 'growing energy sector']],
] as const

export function BenefitStrip() {
  return (
    <div className="benefits">
      <div className="wrap benefit-grid">
        {STRIP.map(([icon, title, [l1, l2]]) => (
          <div className="benefit" key={title}>
            <div className="icon">{icon}</div>
            <div>
              <strong>{title}</strong>
              <span>
                {l1}
                <br />
                {l2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function About() {
  return (
    <section className="wrap about" id="about">
      <div className="about-copy">
        <h2>
          <span style={{ color: 'var(--blue)' }}>About</span> Elen Engineering
        </h2>
        <p>
          Elen Engineering works in power solutions, including distribution transformers and
          electrical panels. We aim to deliver reliable, high-quality solutions for industrial,
          utility and infrastructure needs.
        </p>
        <a className="btn outline" href="#growth">
          Know More About Us →
        </a>
      </div>
      <div className="about-cards">
        <div className="mini">
          <div className="round">◎</div>
          <h3>Our Vision</h3>
          <p>
            To be a trusted name in power solutions with a focus on quality, innovation and
            sustainability.
          </p>
        </div>
        <div className="mini">
          <div className="round">◎</div>
          <h3>Our Mission</h3>
          <p>
            To manufacture reliable transformers and switchgear that empower industries and
            communities.
          </p>
        </div>
        <div className="mini">
          <div className="round">♧</div>
          <h3>Our Values</h3>
          <ul className="checks">
            {['Quality', 'Safety', 'Integrity', 'Innovation', 'People First'].map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="about-image" role="img" aria-label="Illustrative transformer equipment" />
    </section>
  )
}

export function Life() {
  return (
    <section className="life" id="life">
      <div className="wrap life-grid">
        <div>
          <h2>
            Life at <span>Elen</span>
          </h2>
          <p>A workplace where ideas, people and technology come together to create lasting impact.</p>
          <a className="btn white" href="#growth">
            ▶ &nbsp; Explore Our Culture
          </a>
        </div>
        <div className="stats">
          <div className="stat">
            <b>People</b>
            <span>At the heart of our work</span>
          </div>
          <div className="stat">
            <b>Skills</b>
            <span>Built through experience</span>
          </div>
          <div className="stat">
            <b>Impact</b>
            <span>Powering communities</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const GROWTH = [
  {
    img: technicianImg,
    alt: 'Illustrative technician working with electrical equipment',
    title: 'Hands-on Learning',
    text: 'Build technical confidence through practical exposure to equipment, processes and safety standards.',
    tag: 'Technical skills',
  },
  {
    img: teamImg,
    alt: 'Illustrative engineering team collaborating',
    title: 'Team Collaboration',
    text: 'Work with colleagues across functions and learn how engineering, quality and operations connect.',
    tag: 'Teamwork',
  },
  {
    img: transformerImg,
    alt: 'Illustrative power transformer',
    title: 'Meaningful Projects',
    text: 'Contribute to solutions that support industrial and infrastructure power requirements.',
    tag: 'Real-world impact',
  },
]

export function Growth() {
  return (
    <section className="section alt" id="growth">
      <div className="wrap">
        <span className="eyebrow">Build your future</span>
        <h2>Growth & Learning</h2>
        <p className="intro">
          Develop practical expertise, learn from experienced colleagues and contribute to real
          engineering projects.
        </p>
        <div className="three">
          {GROWTH.map((g) => (
            <article className="card" key={g.title}>
              <img src={g.img} alt={g.alt} />
              <div className="card-body">
                <h3>{g.title}</h3>
                <p>{g.text}</p>
                <span className="tag">{g.tag}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const REWARDS = [
  ['✦', 'Recognition', 'Celebrate quality work, safe practices, teamwork and meaningful contributions.'],
  ['♧', 'Development', 'Encourage job-related learning, mentoring and opportunities to grow into new responsibilities.'],
  ['♡', 'Well-being & Safety', 'Promote a respectful workplace with a strong focus on safety, support and collaboration.'],
] as const

export function Rewards() {
  return (
    <section className="section" id="benefits">
      <div className="wrap">
        <span className="eyebrow">People matter</span>
        <h2>Rewards & Benefits</h2>
        <p className="intro">
          A proposed employee experience framework for the careers page. Specific benefits should be
          confirmed by the company before publication.
        </p>
        <div className="three">
          {REWARDS.map(([icon, title, text]) => (
            <article className="card" key={title}>
              <div className="card-body">
                <div className="round">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  ['Explore roles', 'Review the role responsibilities, required skills and location.'],
  ['Prepare your CV', 'Highlight relevant education, experience, projects and technical skills.'],
  ['Submit your interest', "Use the role's application option to prepare an email with your details and CV."],
  ['Stay in touch', 'The recruitment team can communicate next steps and interview requirements.'],
]

export function HowToApply() {
  return (
    <section className="section" id="apply">
      <div className="wrap">
        <span className="eyebrow">Simple and transparent</span>
        <h2>How to Apply</h2>
        <p className="intro">
          A candidate-friendly application journey designed to keep the process clear at every stage.
        </p>
        <div className="steps">
          {STEPS.map(([title, text], i) => (
            <div className="step" key={title}>
              <div className="num">{i + 1}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="note">
          This prototype does not store applications or send data to a server. Application buttons
          prepare an email draft; add a verified recruitment email address before publishing.
        </p>
      </div>
    </section>
  )
}

const FAQS = [
  [
    'Are the roles listed here current vacancies?',
    'No. The roles are sample profiles to demonstrate the proposed career page. Verify openings with the company before applying.',
  ],
  [
    'What should I include in my CV?',
    'Include your contact details, education, relevant experience, technical skills, certifications and project work. Keep the information accurate and concise.',
  ],
  [
    'Can fresh graduates apply?',
    'Some illustrative entry-level roles are included. Eligibility depends on actual vacancy requirements, which should be confirmed with the employer.',
  ],
  [
    'How will my application be submitted?',
    'In this prototype, selecting Apply prepares an email draft on your device. It does not automatically transmit or save your information.',
  ],
]

export function Faq() {
  return (
    <section className="section alt">
      <div className="wrap faq">
        <span className="eyebrow">Need to know</span>
        <h2>Frequently Asked Questions</h2>
        {FAQS.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function Cta() {
  return (
    <section className="cta">
      <div className="wrap cta-inner">
        <div>
          <h2>Ready to power what comes next?</h2>
          <p>Explore opportunities and take the next step in your engineering career.</p>
        </div>
        <a className="btn gold" href="#jobs">
          Explore Opportunities →
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <strong>ELEN ENGINEERING</strong>
          <br />
          Transformers | Switchgear | Power Solutions
        </div>
        <div>
          Career page concept for academic demonstration
          <br />
          Confirm company information before public use.
        </div>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  )
}
