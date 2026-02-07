/**
 * LoginModal Component
 * 
 * A beautiful login popup modal using Hero UI components.
 * Features form validation and authentication integration.
 */
import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from '@heroui/react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend login API
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        
        // Show specific error messages based on status code
        if (response.status === 404) {
          // User not found
          setError('User not found. Please register first.');
        } else if (response.status === 401) {
          // Wrong password
          setError('Incorrect password. Please try again.');
        } else {
          // Other errors
          setError(errorData.detail || 'Login failed. Please try again.');
        }
        return;
      }

      // Successful login
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store user data from database
      const userData = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        name: data.user.name || data.user.username,
        comfort_temperature: data.user.comfort_temperature,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      
      // Close modal
      onClose();
      
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Welcome Back! 👋</h2>
              <p className="text-small text-default-500 font-normal">
                Sign in to save your preferences
              </p>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-2 mt-2">
                <p className="text-tiny text-primary-700 dark:text-primary-400 font-medium">
                  💡 Test with: test@example.com / password123
                </p>
              </div>
            </ModalHeader>
            
            <form onSubmit={handleLogin}>
              <ModalBody>
                {error && (
                  <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-small">
                    {error}
                  </div>
                )}
                
                <Input
                  autoFocus
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  variant="bordered"
                  value={email}
                  onValueChange={setEmail}
                  isRequired
                  startContent={
                    <span className="text-default-400">📧</span>
                  }
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12"
                  }}
                />
                
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                  startContent={
                    <span className="text-default-400">🔒</span>
                  }
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12"
                  }}
                />
                
                <div className="flex justify-between items-center px-1 py-2">
                  <Link
                    className="text-small text-primary cursor-pointer"
                    onPress={() => alert('Password reset functionality coming soon!')}
                  >
                    Forgot password?
                  </Link>
                </div>
              </ModalBody>
              
              <ModalFooter className="flex flex-col gap-2">
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoading}
                  className="w-full font-semibold"
                  size="lg"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Button
                  variant="flat"
                  onPress={handleClose}
                  className="w-full"
                  size="lg"
                >
                  Cancel
                </Button>
                
                <div className="text-center mt-2">
                  <p className="text-small text-default-500">
                    Don&apos;t have an account?{' '}
                    <Link
                      className="text-small text-primary font-semibold cursor-pointer"
                      onPress={() => alert('Sign up functionality coming soon!')}
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

