import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Languages } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Google Translate script loader
const loadGoogleTranslate = () => {
  if (document.getElementById('google-translate-script')) return;
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
  window.googleTranslateElementInit = function() {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      autoDisplay: false,
    }, 'google_translate_element');
  };
};
  const [showTranslate, setShowTranslate] = useState(false);
  const handleTranslateClick = () => {
    setShowTranslate((prev) => !prev);
    if (!window.google || !window.google.translate) {
      loadGoogleTranslate();
    }
  };
import { AudioControls } from "./AudioControls";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, profile, isGuest, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);


  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        fetchUserProfile(user.id);
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user, fetchUserProfile]);

  const handleProfileClick = () => {
    if (isGuest) {
      navigate('/auth');
    } else {
      navigate('/profile');
    }
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <h1 className="text-xl font-bold text-primary">Harvestia</h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Translate"
          onClick={handleTranslateClick}
        >
          {/* Use Languages icon from lucide-react, fallback to emoji if not visible */}
          <span className="text-xl">🌐</span>
        </Button>
        {showTranslate && (
          <div id="google_translate_element" style={{ zIndex: 9999, position: 'absolute', top: '60px', right: '20px' }} />
        )}
        <AudioControls />
        <Button
          variant="outline"
          size="icon"
          className="rounded-full p-0 h-9 w-9"
          onClick={handleProfileClick}
        >
          {user && !isGuest ? (
            <Avatar className="h-8 w-8" key={refreshKey}>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};