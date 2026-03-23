import { useState } from 'react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { email, password });
  };

  return (
    <div className="flex h-full w-[90%] flex-col justify-center px-8 md:px-16 lg:px-24">
      {/* Logo/Brand */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <img
            src="/Logo_yellow.png"
            alt="CrossFit Logo"
            className="h-28 w-auto"
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
        Create an account
      </h1>
      <p className="mb-10 text-base text-neutral-500">
        Already have an account?{' '}
        <a href="#" className="text-[#DFFF00] transition-colors hover:text-[#DFFF00]/80">
          Sign in
        </a>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium uppercase tracking-wider text-neutral-400">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-neutral-700 bg-transparent px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-[#DFFF00] focus:outline-none"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium uppercase tracking-wider text-neutral-400">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full border border-neutral-700 bg-transparent px-4 py-3.5 pr-12 text-white placeholder-neutral-600 transition-colors focus:border-[#DFFF00] focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-600">Must be at least 8 characters</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="relative mt-4 w-full bg-[#DFFF00] py-4 text-sm font-bold uppercase tracking-widest text-[#050505] transition-all duration-300 hover:bg-[#DFFF00]/90"
          style={{
            boxShadow: '0 0 20px rgba(223, 255, 0, 0.3), 0 0 40px rgba(223, 255, 0, 0.1)',
          }}
        >
          Start for free
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="text-xs uppercase tracking-wider text-neutral-600">or continue with</span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      {/* Social Login */}
      <div className="flex gap-4">
        <button className="flex flex-1 items-center justify-center gap-2 border border-neutral-700 py-3 text-white transition-colors hover:border-neutral-500 hover:bg-neutral-900">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm">Google</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 border border-neutral-700 py-3 text-white transition-colors hover:border-neutral-500 hover:bg-neutral-900">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm">GitHub</span>
        </button>
      </div>

      {/* Terms */}
      <p className="mt-8 text-center text-xs text-neutral-600">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-neutral-400 hover:text-[#DFFF00]">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-neutral-400 hover:text-[#DFFF00]">Privacy Policy</a>
      </p>
    </div>
  );
}
