import { AuthForm } from '../components/auth/AuthForm';
import { ImageCarousel } from '../components/auth/ImageCarousel';

export function AuthPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Side - Auth Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <AuthForm />
      </div>

      {/* Right Side - Image Carousel */}
      <div className="hidden lg:block lg:w-1/2">
        <ImageCarousel />
      </div>
    </div>
  );
}
