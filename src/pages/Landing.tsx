import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Target, Clock, Sparkles, ArrowRight, Play, LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getProfile, createProfile } from '@/lib/gameStore';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const profile = getProfile();

  const handleStartJourney = () => {
    if (!profile) {
      setShowSetup(true);
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createProfile(playerName.trim());
      setShowSetup(false);
      window.location.href = '/dashboard';
    }
  };

  const features = [
    { icon: Brain, title: 'Memory', desc: 'Boost recall & pattern recognition', color: 'text-neon-cyan' },
    { icon: Target, title: 'Logic', desc: 'Sharpen problem-solving skills', color: 'text-neon-magenta' },
    { icon: Clock, title: 'Speed', desc: 'Improve reaction time', color: 'text-neon-lime' },
    { icon: Sparkles, title: 'Focus', desc: 'Enhance concentration', color: 'text-neon-orange' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center cyber-grid">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 pt-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Logo */}
            <div className="flex justify-center mb-8 animate-slide-up">
              <div className="relative">
                <Brain className="w-24 h-24 text-primary animate-float" />
                <div className="absolute inset-0 blur-xl bg-primary/40 animate-glow-pulse" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <span className="text-primary animate-title-glow">Brain</span>
              <span className="text-foreground"> Boost</span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-rajdhani text-muted-foreground mb-4 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Train Your Mind
            </p>

            <p className="text-lg font-rajdhani text-muted-foreground/80 mb-12 max-w-2xl mx-auto animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              Challenge yourself with 5 unique brain-training games designed to improve memory, logic, reaction speed, and cognitive flexibility.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              {profile ? (
                <Link to="/dashboard" className="neon-button group flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  Continue Training
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button onClick={handleStartJourney} className="neon-button group flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link to="/dashboard" className="neon-button neon-button-magenta flex items-center gap-2">
                Explore Games
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 animate-slide-up opacity-0"
                  style={{ animationDelay: `${1 + i * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <feature.icon className={`w-10 h-10 ${feature.color} mb-3 mx-auto`} />
                  <h3 className="font-orbitron font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm font-rajdhani">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg">
          <div className="bg-card border-2 border-primary rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in neon-border-cyan">
            <div className="text-center mb-6">
              <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl font-bold text-foreground mb-2">Welcome, Challenger!</h2>
              <p className="text-muted-foreground font-rajdhani">Enter your name to begin your brain training journey.</p>
            </div>
            <form onSubmit={handleCreateProfile}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none font-rajdhani text-foreground mb-4 text-center text-lg"
                autoFocus
                maxLength={20}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSetup(false)}
                  className="flex-1 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-rajdhani"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-orbitron font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Let's Go!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
