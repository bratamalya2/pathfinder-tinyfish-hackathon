import { useState } from 'react';
import './IntakeForm.css';

interface IntakeFormProps {
  onSubmit: (data: { careerGoal: string; currentLevel: string; timeAvailability: string }) => void;
  isLoading: boolean;
}

const CAREER_OPTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'UI/UX Designer',
  'Product Manager',
  'DevOps Engineer',
  'Mobile Developer',
  'Cybersecurity Analyst',
  'Cloud Architect',
  'Game Developer',
];

const LEVEL_OPTIONS = [
  'Complete Beginner',
  'Some Experience',
  'Intermediate',
  'Advanced',
];

const TIME_OPTIONS = [
  '2-4 hours/week',
  '5-10 hours/week',
  '10-20 hours/week',
  '20+ hours/week',
];

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [careerGoal, setCareerGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [timeAvailability, setTimeAvailability] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerGoal || !currentLevel) return;
    onSubmit({ careerGoal, currentLevel, timeAvailability });
  };

  return (
    <form className="intake-form" onSubmit={handleSubmit} id="intake-form">
      <div className="intake-form__header">
        <div className="intake-form__icon">🧭</div>
        <h2 className="intake-form__title">Chart Your Path</h2>
        <p className="intake-form__subtitle">
          Tell us where you want to go, and we'll map the perfect learning journey.
        </p>
      </div>

      <div className="intake-form__fields">
        <div className="form-group animate-fade-in-up delay-100" style={{ opacity: 0 }}>
          <label className="form-label" htmlFor="career-goal">🎯 Career Goal</label>
          <select
            id="career-goal"
            className="form-select"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            required
          >
            <option value="">Select your target career...</option>
            {CAREER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="form-group animate-fade-in-up delay-200" style={{ opacity: 0 }}>
          <label className="form-label" htmlFor="current-level">📊 Current Skill Level</label>
          <select
            id="current-level"
            className="form-select"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            required
          >
            <option value="">Select your level...</option>
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="form-group animate-fade-in-up delay-300" style={{ opacity: 0 }}>
          <label className="form-label" htmlFor="time-availability">⏱️ Time Commitment</label>
          <select
            id="time-availability"
            className="form-select"
            value={timeAvailability}
            onChange={(e) => setTimeAvailability(e.target.value)}
          >
            <option value="">Select your availability...</option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary intake-form__submit animate-fade-in-up delay-400"
        style={{ opacity: 0 }}
        disabled={isLoading || !careerGoal || !currentLevel}
        id="generate-button"
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Generating...
          </>
        ) : (
          <>
            ✨ Generate My Curriculum
          </>
        )}
      </button>
    </form>
  );
}
