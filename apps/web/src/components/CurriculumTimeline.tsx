import './CurriculumTimeline.css';

interface Course {
  title: string;
  url: string;
  provider: string;
  difficulty: string;
}

interface CurriculumTimelineProps {
  courses: Course[];
  careerGoal: string;
  marketTrends: string[];
  suggestedProjects: any[];
  onReset: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

const PROVIDER_ICONS: Record<string, string> = {
  Meta: '🔵',
  Google: '🟢',
  IBM: '🔷',
  Coursera: '📘',
  Udemy: '🟣',
  FrontendMasters: '🔴',
  Scrimba: '🟠',
};

export default function CurriculumTimeline({
  courses,
  careerGoal,
  marketTrends,
  suggestedProjects,
  onReset,
}: CurriculumTimelineProps) {
  return (
    <div className="timeline" id="curriculum-timeline">
      <div className="timeline__header animate-fade-in-up">
        <span className="timeline__badge">✅ Curriculum Generated</span>
        <h2 className="timeline__title">
          Your Path to <span className="timeline__highlight">{careerGoal}</span>
        </h2>
        <p className="timeline__subtitle">
          We found {courses?.length || 0} courses based on live market signals.
        </p>
      </div>

      {/* Market Insights Section */}
      {marketTrends?.length > 0 && (
        <div className="market-insights animate-fade-in-up delay-200" style={{ opacity: 0 }}>
          <h3 className="market-insights__title">📍 Local Market Insights</h3>
          <div className="market-insights__tags">
            {marketTrends.map((trend, i) => (
              <span key={i} className="market-insights__tag">🔥 {trend}</span>
            ))}
          </div>
          <p className="market-insights__desc">
            These skills are currently trending for <strong>{careerGoal}</strong> roles in your area.
          </p>
        </div>
      )}

      <div className="timeline__track">
        {courses.map((course, index) => (
          <div
            key={index}
            className="timeline__item animate-fade-in-up"
            style={{
              opacity: 0,
              animationDelay: `${400 + index * 150}ms`,
            }}
          >
            <div className="timeline__connector">
              <div
                className="timeline__dot"
                style={{ background: DIFFICULTY_COLORS[course.difficulty] || '#7c3aed' }}
              >
                {index + 1}
              </div>
              {index < courses.length - 1 && <div className="timeline__line" />}
            </div>

            <div className="timeline__card glass-card">
              <div className="timeline__card-header">
                <span className="timeline__provider-icon">
                  {PROVIDER_ICONS[course.provider] || '📚'}
                </span>
                <span className="timeline__provider">{course.provider}</span>
                <span
                  className="timeline__difficulty"
                  style={{
                    background: `${DIFFICULTY_COLORS[course.difficulty] || '#7c3aed'}20`,
                    color: DIFFICULTY_COLORS[course.difficulty] || '#7c3aed',
                    borderColor: `${DIFFICULTY_COLORS[course.difficulty] || '#7c3aed'}40`,
                  }}
                >
                  {course.difficulty}
                </span>
              </div>
              <h3 className="timeline__course-title">{course.title}</h3>
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="timeline__link"
              >
                Enroll Now →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Projects Section */}
      {suggestedProjects?.length > 0 && (
        <div className="section-projects animate-fade-in-up delay-600" style={{ opacity: 0 }}>
          <h3 className="section-projects__title">🏗️ Recommended Mastery Projects</h3>
          <p className="section-projects__subtitle">Build these to prove your skills to recruiters.</p>
          <div className="projects-grid">
            {suggestedProjects.map((project, i) => (
              <div key={i} className="project-card glass-card">
                <h4 className="project-card__title">{project.title}</h4>
                <p className="project-card__desc">{project.description}</p>
                <div className="project-card__stages">
                  {project.stages?.map((stage: any, j: number) => (
                    <div key={j} className="project-stage">
                      <strong>Phase {j + 1}: {stage.name}</strong>
                      <ul>
                        {stage.tasks?.map((task: string, k: number) => (
                          <li key={k}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timeline__footer animate-fade-in-up delay-800" style={{ opacity: 0 }}>
        <button className="btn-secondary" onClick={onReset}>
          ← Start a new path
        </button>
      </div>
    </div>
  );
}
