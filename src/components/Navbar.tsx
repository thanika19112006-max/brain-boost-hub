import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Volume2, VolumeX, User, Menu, X, Home, Gamepad2, LogIn, LogOut } from 'lucide-react';
import { getSoundEnabled, setSoundEnabled, getProfile } from '@/lib/gameStore';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [soundEnabled, setSoundState] = useState(getSoundEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = getProfile();
  const { user, signOut } = useAuth();

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundState(newState);
    setSoundEnabled(newState);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Games', icon: Gamepad2 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary animate-glow-pulse" />
              <div className="absolute inset-0 blur-lg bg-primary/30 animate-glow-pulse" />
            </div>
            <span className="font-orbitron font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              Brain<span className="text-primary">Boost</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-primary neon-border-cyan'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-all duration-300"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary transition-all duration-300"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-background">
                    {(user.user_metadata?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-rajdhani text-sm">{user.user_metadata?.display_name || 'Player'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg border border-border hover:border-destructive hover:text-destructive transition-all duration-300"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-background font-rajdhani font-medium transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-border hover:border-primary transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-primary bg-primary/10 neon-border-cyan'
                        : 'text-muted-foreground hover:text-primary hover:bg-card'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              {/* Mobile auth */}
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium text-destructive hover:bg-destructive/10 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
