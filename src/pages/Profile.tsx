import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Trophy, GamepadIcon, Calendar, Edit2, Save, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getProfile, saveProfile, createProfile, getScores, getRecentScores, getBestScore, UserProfile, GameScore } from '@/lib/gameStore';

const GAMES = ['BrainMaze', 'MemoryFlip+', 'ThinkFast', 'ReflexIQ', 'WordBend'];

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentScores, setRecentScores] = useState<GameScore[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const existingProfile = getProfile();
    if (existingProfile) {
      setProfile(existingProfile);
      setEditName(existingProfile.name);
    } else {
      setIsNewUser(true);
    }
    setRecentScores(getRecentScores(10));
  }, []);

  const handleSaveName = () => {
    if (editName.trim()) {
      if (isNewUser) {
        const newProfile = createProfile(editName.trim());
        setProfile(newProfile);
        setIsNewUser(false);
      } else if (profile) {
        const updated = { ...profile, name: editName.trim() };
        saveProfile(updated);
        setProfile(updated);
      }
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center">
              <User className="w-12 h-12 text-background" />
            </div>
            <h1 className="font-orbitron text-3xl font-bold text-foreground mb-4">Create Your Profile</h1>
            <p className="text-muted-foreground font-rajdhani mb-8">Enter your name to start tracking your progress.</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
                className="flex-1 px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none font-rajdhani text-foreground"
                autoFocus
                maxLength={20}
              />
              <button
                onClick={handleSaveName}
                disabled={!editName.trim()}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-orbitron font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-rajdhani">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="profile-avatar text-background">
                {profile?.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none font-orbitron text-xl text-foreground"
                      autoFocus
                      maxLength={20}
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h1 className="font-orbitron text-3xl font-bold text-foreground">{profile?.name}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-muted-foreground font-rajdhani mt-2">
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Today'}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-orbitron font-bold text-primary">{profile?.gamesPlayed || 0}</div>
                  <div className="text-muted-foreground text-sm font-rajdhani">Games Played</div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Scores Grid */}
          <div className="mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <h2 className="font-orbitron text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-neon-orange" />
              Best Scores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {GAMES.map((game) => (
                <div key={game} className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/50 transition-colors">
                  <div className="text-2xl font-orbitron font-bold text-primary mb-1">
                    {getBestScore(game) || '—'}
                  </div>
                  <div className="text-muted-foreground text-xs font-rajdhani">{game}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <h2 className="font-orbitron text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neon-cyan" />
              Recent Activity
            </h2>
            {recentScores.length > 0 ? (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-rajdhani text-muted-foreground font-medium">Game</th>
                      <th className="px-4 py-3 text-center font-rajdhani text-muted-foreground font-medium">Score</th>
                      <th className="px-4 py-3 text-center font-rajdhani text-muted-foreground font-medium hidden sm:table-cell">Level</th>
                      <th className="px-4 py-3 text-right font-rajdhani text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScores.map((score, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-rajdhani text-foreground flex items-center gap-2">
                          <GamepadIcon className="w-4 h-4 text-primary" />
                          {score.game}
                        </td>
                        <td className="px-4 py-3 text-center font-orbitron text-primary font-bold">{score.score}</td>
                        <td className="px-4 py-3 text-center font-rajdhani text-muted-foreground hidden sm:table-cell">Lvl {score.level}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-sm font-rajdhani">{formatDate(score.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <GamepadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-rajdhani">No games played yet. Start your first challenge!</p>
                <Link to="/dashboard" className="inline-block mt-4 neon-button text-sm">
                  Play Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
