import { useEffect, useState } from 'react';
import './SmartLoadingState.css';

interface SmartLoadingStateProps {
  status: string;
  careerGoal: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; progress: number }> = {
  PENDING: { label: 'Initializing...', icon: '⏳', progress: 5 },
  SEARCHING_GRAPH: { label: 'Searching our knowledge graph...', icon: '🧠', progress: 20 },
  SCRAPING_WEB: { label: 'Dispatching AI agent to the web...', icon: '🌐', progress: 55 },
  SYNTHESIZING_DATA: { label: 'Processing course data with AI...', icon: '⚡', progress: 80 },
  UPDATING_GRAPH: { label: 'Saving to knowledge graph...', icon: '💾', progress: 92 },
  COMPLETED: { label: 'Curriculum ready!', icon: '🎉', progress: 100 },
  FAILED: { label: 'Something went wrong.', icon: '❌', progress: 0 },
};

export default function SmartLoadingState({ status, careerGoal }: SmartLoadingStateProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(config.progress), 100);
    return () => clearTimeout(timeout);
  }, [config.progress]);

  return (
    <div className="smart-loading">
      <div className="smart-loading__card glass-card">
        <div className="smart-loading__icon">{config.icon}</div>
        <h3 className="smart-loading__title">{config.label}</h3>
        <p className="smart-loading__subtitle">
          Generating curriculum for <strong>{careerGoal}</strong>
        </p>

        <div className="smart-loading__progress-track">
          <div
            className="smart-loading__progress-bar"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        <div className="smart-loading__steps">
          {Object.entries(STATUS_CONFIG)
            .filter(([key]) => !['FAILED'].includes(key))
            .map(([key, val]) => {
              const isActive = key === status;
              const isDone = config.progress > val.progress && !isActive;
              return (
                <div
                  key={key}
                  className={`smart-loading__step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                >
                  <span className="smart-loading__step-icon">
                    {isDone ? '✓' : val.icon}
                  </span>
                  <span className="smart-loading__step-label">{val.label}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
