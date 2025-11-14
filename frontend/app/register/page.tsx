'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, User, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { register, login, setAuthToken, type ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      await register({ email, username, password });
      
      // Auto-login after registration
      const loginResponse = await login({ email, password });
      setAuthToken(loginResponse.access_token);
      
      router.push('/home');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 400) {
        setError(apiError.detail || 'Registration failed. Please check your information.');
      } else {
        setError(apiError.detail || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length > 0 ? {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  } : null;

  const allRequirementsMet = passwordStrength && 
    passwordStrength.length && 
    passwordStrength.uppercase && 
    passwordStrength.lowercase && 
    passwordStrength.number;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-text/60">Join AgrIQ and start your gene editing journey</p>
        </div>

        <Card className="p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-text/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-secondary/30 rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-text mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-text/40" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Choose a username"
                  className="w-full pl-12 pr-4 py-3 border border-secondary/30 rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-text/50 mt-1">At least 3 characters</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 border border-secondary/30 rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text/40 hover:text-text/60 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {passwordStrength && (
                <div className="mt-2 p-2.5 bg-secondary/10 rounded-lg space-y-1.5">
                  <p className="text-xs font-semibold text-text/70 mb-1.5">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-primary' : 'text-text/50'}`}>
                      {passwordStrength.length ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-text/30" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-primary' : 'text-text/50'}`}>
                      {passwordStrength.uppercase ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-text/30" />
                      )}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.lowercase ? 'text-primary' : 'text-text/50'}`}>
                      {passwordStrength.lowercase ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-text/30" />
                      )}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-primary' : 'text-text/50'}`}>
                      {passwordStrength.number ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-text/30" />
                      )}
                      <span>One number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text/40" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-secondary/30'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text/40 hover:text-text/60 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading || !allRequirementsMet || password !== confirmPassword}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-text/60">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-text/60">
              Already registered?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-text/60 hover:text-text transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

