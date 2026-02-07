/**
 * Layout Component
 * 
 * Main layout wrapper using HeroUI components.
 * Provides consistent structure with Navbar and main content area.
 * Uses HeroUI layout tokens for spacing and styling.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  Button, 
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from "@heroui/react";
import ThemeSwitcher from "./ThemeSwitcher";
import LoginModal from "./LoginModal";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Dispatch custom event to notify App.jsx to refresh saved locations
    window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Handle menu actions
  const handleMenuAction = (key) => {
    if (key === 'settings') {
      navigate('/settings');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <Navbar 
        maxWidth="xl" 
        position="sticky" 
        className="border-b border-divider bg-background"
        height="var(--heroui-navbar-height)"
      >
        <NavbarBrand>
          <button 
            onClick={() => navigate('/')}
            className="font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
          >
            🌤️ Weather Clothing Recommendations
          </button>
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-4">
          <div className="hidden sm:flex items-center">
            <p className="text-small text-default-500">
              Get personalized clothing recommendations based on weather
            </p>
          </div>
          <ThemeSwitcher />
          
          {/* Login/User Menu */}
          {user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user.name || user.email}
                  size="sm"
                  showFallback
                  fallback={
                    <span className="text-small font-semibold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat" onAction={handleMenuAction}>
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold text-primary">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" startContent="⚙️">
                  My Settings
                </DropdownItem>
                <DropdownItem key="preferences" startContent="🎨">
                  Preferences
                </DropdownItem>
                <DropdownItem key="help" startContent="❓">
                  Help & Feedback
                </DropdownItem>
                <DropdownItem key="logout" color="danger" startContent="🚪">
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              color="primary"
              variant="flat"
              onPress={() => setIsLoginOpen(true)}
              startContent={<span>👤</span>}
            >
              Login
            </Button>
          )}
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex-grow bg-background">
        {children}
      </main>

      <footer className="w-full flex items-center justify-center py-6 border-t border-divider mt-auto bg-background">
        <p className="text-small text-default-500">
          Powered by{" "}
          <span className="text-primary font-semibold">HeroUI</span>
        </p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

