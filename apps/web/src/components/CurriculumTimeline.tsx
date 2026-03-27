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

export default function CurriculumTimeline({ courses, careerGoal, onReset }: CurriculumTimelineProps) {
  return (
    <div className="timeline" id="curriculum-timeline">
      <div className="timeline__header animate-fade-in-up">
        <span className="timeline__badge">✅ Curriculum Generated</span>
        <h2 className="timeline__title">
          Your Path to <span className="timeline__highlight">{careerGoal}</span>
        </h2>
        <p className="timeline__subtitle">
          We found {courses.length} courses to get you started. Follow the path below in order.
        </p>
      </div>

      <div className="timeline__track">
        {courses.map((course, index) => (
          <div
            key={index}
            className="timeline__item animate-fade-in-up"
            style={{
              opacity: 0,
              animationDelay: `${200 + index * 150}ms`,
            }}
          >
            <div className="timeline__connector">
              <div className="timeline__dot" style={{ background: DIFFICULTY_COLORS[course.difficulty] || '#7c3aed' }}>
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

      <div className="timeline__footer animate-fade-in-up delay-800" style={{ opacity: 0 }}>
        <button className="btn-secondary" onClick={onReset}>
          ← Start a new path
        </button>
      </div>
    </div>
  );
}
