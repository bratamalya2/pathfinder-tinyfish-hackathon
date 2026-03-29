import { useState, useEffect, useRef } from 'react';
import StarField from './components/StarField';
import IntakeForm from './components/IntakeForm';
import SmartLoadingState from './components/SmartLoadingState';
import CurriculumTimeline from './components/CurriculumTimeline';
import LocationGate from './components/LocationGate';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

interface Course {
  title: string;
  url: string;
  provider: string;
  difficulty: string;
}

type AppView = 'landing' | 'loading' | 'results';

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [jobId, setJobId] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [status, setStatus] = useState('PENDING');
  const [courses, setCourses] = useState<Course[]>([]);
  const [marketTrends, setMarketTrends] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Polling logic
  useEffect(() => {
    if (!jobId || view !== 'loading') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/curriculum/status/${jobId}`);
        const data = await res.json();
        setStatus(data.status);

        if (data.status === 'COMPLETED' && data.result) {
          setCourses(data.result.courses);
          setMarketTrends(data.result.marketTrends || []);
          setProjects(data.result.suggestedProjects || []);
          setView('results');
          clearInterval(interval);
        }

        if (data.status === 'FAILED') {
          setError(data.error || 'An unexpected error occurred.');
          setView('landing');
          clearInterval(interval);
        }
      } catch {
        setError('Failed to connect to the server.');
        setView('landing');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId, view]);

  const handleSubmit = async (data: { careerGoal: string; currentLevel: string }) => {
    if (!location) {
      setError('Location access is required to generate a path.');
      return;
    }
    setError(null);
    setCareerGoal(data.careerGoal);
    setView('loading');
    setStatus('PENDING');

    try {
      const res = await fetch(`${API_BASE}/curriculum/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, location }),
      });
      const resData = await res.json();
      setJobId(resData.jobId);
    } catch {
      setError('Failed to connect to the server. Make sure the API is running.');
      setView('landing');
    }
  };

  const handleReset = () => {
    setView('landing');
    setJobId(null);
    setCourses([]);
    setMarketTrends([]);
    setProjects([]);
    setStatus('PENDING');
    setError(null);
  };

  return (
    <div className="app">
      {!location && <LocationGate onLocationGranted={(loc) => setLocation(loc)} />}
      <StarField />

      {/* Ambient background effects */}
      <div className="ambient-orb ambient-orb--purple" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
      <div className="ambient-orb ambient-orb--teal" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar__brand">
          <span className="navbar__logo">🧭</span>
          <span className="navbar__name">PathFinder</span>
        </div>
        <div className="navbar__links">
          <a href="#intake-form" className="navbar__link">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="hero"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <div className="hero__content">
          <div className="hero__badge animate-fade-in-down">
            ⚡ Powered by AI Web Agents + Knowledge Graph
          </div>
          <h1 className="hero__title animate-fade-in-up">
            Find Your Perfect<br />
            <span className="hero__gradient-text">Learning Path</span>
          </h1>
          <p className="hero__subtitle animate-fade-in-up delay-200" style={{ opacity: 0 }}>
            PathFinder uses autonomous web agents to scrape live educational platforms
            and builds an evolving knowledge graph — delivering personalized, 
            prerequisite-aware curricula in minutes.
          </p>

          <div className="hero__features animate-fade-in-up delay-400" style={{ opacity: 0 }}>
            <div className="hero__feature">
              <span className="hero__feature-icon">🧠</span>
              <span>Smart Graph Caching</span>
            </div>
            <div className="hero__feature">
              <span className="hero__feature-icon">🌐</span>
              <span>Live Web Scraping</span>
            </div>
            <div className="hero__feature">
              <span className="hero__feature-icon">🔗</span>
              <span>Prerequisite Logic</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="error-toast animate-fade-in-down">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="error-toast__close">✕</button>
          </div>
        )}

        {view === 'landing' && (
          <section className="section-form">
            <IntakeForm onSubmit={handleSubmit} isLoading={false} />
          </section>
        )}

        {view === 'loading' && (
          <section className="section-loading">
            <SmartLoadingState status={status} careerGoal={careerGoal} />
          </section>
        )}

        {view === 'results' && (
          <section className="section-results">
            <CurriculumTimeline 
              courses={courses} 
              careerGoal={careerGoal} 
              marketTrends={marketTrends}
              suggestedProjects={projects}
              onReset={handleReset} 
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built for <strong>TinyFish $2M Pre-Accelerator</strong> Hackathon · 
          PathFinder © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default App;
