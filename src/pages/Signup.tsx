import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    setLoading(false);

    if (error) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account Created!', description: 'Check your email for a confirmation link, or sign in if auto-confirmed.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary animate-float" />
              <div className="absolute inset-0 blur-xl bg-primary/40 animate-glow-pulse" />
            </div>
            <span className="font-orbitron text-2xl font-bold">
              <span className="text-primary animate-title-glow">Brain</span>
              <span className="text-foreground">Boost</span>
            </span>
          </Link>
          <p className="text-muted-foreground font-rajdhani mt-2 text-lg">Join the Arena</p>
        </div>

        {/* Signup Card */}
        <div className="bg-card/80 backdrop-blur-lg border-2 border-border rounded-2xl p-8 neon-border-magenta">
          <h1 className="font-orbitron text-2xl font-bold text-foreground text-center mb-6">Create Account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-rajdhani font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="CyberPlayer42"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-secondary focus:outline-none font-rajdhani text-foreground transition-colors"
                required
                maxLength={20}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-rajdhani font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-secondary focus:outline-none font-rajdhani text-foreground transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-rajdhani font-medium text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-secondary focus:outline-none font-rajdhani text-foreground pr-12 transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-rajdhani font-medium text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" /> Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-secondary focus:outline-none font-rajdhani text-foreground transition-colors"
                required
                minLength={6}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full neon-button neon-button-magenta group flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm font-rajdhani">Already have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="w-full neon-button flex items-center justify-center gap-2"
          >
            Sign In
          </Link>
        </div>

        <p className="text-center text-muted-foreground text-sm font-rajdhani mt-6">
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
