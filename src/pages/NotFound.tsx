import { Link } from "react-router-dom";
import { Brain, Home, Gamepad2 } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-orbitron text-9xl font-black text-primary neon-text-cyan mb-8">
          404
        </h1>
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-6 animate-float" />
        <h2 className="font-orbitron text-2xl font-bold text-foreground mb-4">
          Neural Path Not Found
        </h2>
        <p className="text-muted-foreground font-rajdhani text-lg mb-8 max-w-md mx-auto">
          The brain pathway you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="neon-button flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link to="/dashboard" className="neon-button neon-button-magenta flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Play Games
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
