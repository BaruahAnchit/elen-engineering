interface ApplyProps {
  onGeneralApply: () => void;
}

export function Highlights() {
  return (
    <div className="benefits">
      <div className="wrap benefit-grid">
        <div className="benefit">
          <div className="icon">♙</div>
          <div>
            <strong>Meaningful Work</strong>
            <span>
              Contribute to real-world
              <br />
              power solutions
            </span>
          </div>
        </div>
        <div className="benefit">
          <div className="icon">♧</div>
          <div>
            <strong>Learning & Growth</strong>
            <span>
              Build technical and
              <br />
              leadership skills
            </span>
          </div>
        </div>
        <div className="benefit">
          <div className="icon">♧</div>
          <div>
            <strong>Collaborative Culture</strong>
            <span>
              Work with passionate
              <br />
              professionals
            </span>
          </div>
        </div>
        <div className="benefit">
          <div className="icon">♙</div>
          <div>
            <strong>Impactful Careers</strong>
            <span>
              Be part of India's
              <br />
              growing energy sector
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section className="wrap about" id="about">
      <div className="about-copy">
        <h2>
          <span style={{ color: 'var(--blue)' }}>About</span> Elen Engineering
        </h2>
        <p>
          Elen Engineering works in power solutions, including distribution transformers and electrical panels. We aim
          to deliver reliable, high-quality solutions for industrial, utility and infrastructure needs.
        </p>
        <a className="btn outline" href="#growth">
          Know More About Us →
        </a>
      </div>
      <div className="about-cards">
        <div className="mini">
          <div className="round">◎</div>
          <h3>Our Vision</h3>
          <p>To be a trusted name in power solutions with a focus on quality, innovation and sustainability.</p>
        </div>
        <div className="mini">
          <div className="round">◎</div>
          <h3>Our Mission</h3>
          <p>To manufacture reliable transformers and switchgear that empower industries and communities.</p>
        </div>
        <div className="mini">
          <div className="round">♧</div>
          <h3>Our Values</h3>
          <ul className="checks">
            <li>Quality</li>
            <li>Safety</li>
            <li>Integrity</li>
            <li>Innovation</li>
            <li>People First</li>
          </ul>
        </div>
      </div>
      <div className="about-image" role="img" aria-label="Illustrative transformer equipment" />
    </section>
  );
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
  );
}

export function Growth() {
  return (
    <section className="section alt" id="growth">
      <div className="wrap">
        <span className="eyebrow">Build your future</span>
        <h2>Growth & Learning</h2>
        <p className="intro">
          Develop practical expertise, learn from experienced colleagues and contribute to real engineering projects.
        </p>
        <div className="three">
          <article className="card">
            <img src="/images/growth-1.jpg" alt="Illustrative technician working with electrical equipment" />
            <div className="card-body">
              <h3>Hands-on Learning</h3>
              <p>
                Build technical confidence through practical exposure to equipment, processes and safety standards.
              </p>
              <span className="tag">Technical skills</span>
            </div>
          </article>
          <article className="card">
            <img src="/images/growth-2.jpg" alt="Illustrative engineering team collaborating" />
            <div className="card-body">
              <h3>Team Collaboration</h3>
              <p>
                Work with colleagues across functions and learn how engineering, quality and operations connect.
              </p>
              <span className="tag">Teamwork</span>
            </div>
          </article>
          <article className="card">
            <img src="/images/growth-3.jpg" alt="Illustrative power transformer" />
            <div className="card-body">
              <h3>Meaningful Projects</h3>
              <p>Contribute to solutions that support industrial and infrastructure power requirements.</p>
              <span className="tag">Real-world impact</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Benefits() {
  return (
    <section className="section" id="benefits">
      <div className="wrap">
        <span className="eyebrow">People matter</span>
        <h2>Rewards & Benefits</h2>
        <p className="intro">
          A proposed employee experience framework for the careers page. Specific benefits should be confirmed by the
          company before publication.
        </p>
        <div className="three">
          <article className="card">
            <div className="card-body">
              <div className="round">✦</div>
              <h3>Recognition</h3>
              <p>Celebrate quality work, safe practices, teamwork and meaningful contributions.</p>
            </div>
          </article>
          <article className="card">
            <div className="card-body">
              <div className="round">♧</div>
              <h3>Development</h3>
              <p>
                Encourage job-related learning, mentoring and opportunities to grow into new responsibilities.
              </p>
            </div>
          </article>
          <article className="card">
            <div className="card-body">
              <div className="round">♡</div>
              <h3>Well-being & Safety</h3>
              <p>Promote a respectful workplace with a strong focus on safety, support and collaboration.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function HowToApply({ onGeneralApply }: ApplyProps) {
  return (
    <section className="section" id="apply">
      <div className="wrap">
        <span className="eyebrow">Simple and transparent</span>
        <h2>How to Apply</h2>
        <p className="intro">
          A candidate-friendly application journey designed to keep the process clear at every stage.
        </p>
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Explore roles</h3>
            <p>Review the role responsibilities, required skills and location.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Prepare your CV</h3>
            <p>Highlight relevant education, experience, projects and technical skills.</p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h3>Submit your application</h3>
            <p>Select Apply on a role, fill in the short form and upload your CV.</p>
          </div>
          <div className="step">
            <div className="num">4</div>
            <h3>Stay in touch</h3>
            <p>The recruitment team can communicate next steps and interview requirements.</p>
          </div>
        </div>
        <p style={{ margin: '22px 0 0' }}>
          <button type="button" className="btn outline" onClick={onGeneralApply}>
            Don't see your role? Send a general application
          </button>
        </p>
        <p className="note">
          Your details and CV are sent to the ELEN Engineering recruitment team and stored securely to process your
          application.
        </p>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="section alt">
      <div className="wrap faq">
        <span className="eyebrow">Need to know</span>
        <h2>Frequently Asked Questions</h2>
        <details>
          <summary>Are the roles listed here current vacancies?</summary>
          <p>
            No. The roles are sample profiles to demonstrate the proposed career page. Verify openings with the
            company before applying.
          </p>
        </details>
        <details>
          <summary>What should I include in my CV?</summary>
          <p>
            Include your contact details, education, relevant experience, technical skills, certifications and
            project work. Keep the information accurate and concise.
          </p>
        </details>
        <details>
          <summary>Can fresh graduates apply?</summary>
          <p>
            Some illustrative entry-level roles are included. Eligibility depends on actual vacancy requirements,
            which should be confirmed with the employer.
          </p>
        </details>
        <details>
          <summary>How will my application be submitted?</summary>
          <p>
            Select Apply on a role, fill in the form and upload your CV (PDF, DOC or DOCX, up to 5 MB). Your
            application is stored securely and emailed to the recruitment team.
          </p>
        </details>
      </div>
    </section>
  );
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
  );
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
          © {new Date().getFullYear()} ELEN Engineering
          <br />
          Roles shown are illustrative until confirmed by the recruitment team.
        </div>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  );
}
