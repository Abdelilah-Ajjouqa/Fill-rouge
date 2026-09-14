import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { updateProfile } from '../store/slices/authSlice';
import { toast } from 'sonner';
import {
  User,
  Camera,
  Lock,
  Mail,
  Phone,
  Building2,
  Save,
  X,
} from 'lucide-react';
import api from '../api/axios';

export const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone ? String(user.phone) : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gymName, setGymName] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone ? String(user.phone) : '');

      if (user.gymId) {
        api
          .get(`/gyms/${user.gymId}`)
          .then((res) => {
            setGymName(res.data?.name || null);
          })
          .catch(() => setGymName(null));
      }
    }
  }, [user]);

  const currentAvatarSrc = previewUrl
    ? previewUrl
    : user?.photo
      ? user.photo.startsWith('http')
        ? user.photo
        : `http://localhost:3000${user.photo}`
      : null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveSelectedFile = () => {
    setAvatarFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (password.trim()) formData.append('password', password.trim());
      if (avatarFile) formData.append('avatar', avatarFile);

      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      handleRemoveSelectedFile();
    } catch (err: any) {
      toast.error(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to update profile',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel = (user?.role || 'MEMBER').replace('_', ' ');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Account Settings
        </h2>
        <p className="text-white/40 text-sm mt-1">
          Manage your personal profile and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card / Avatar Header */}
        <div className="bg-slate-900 border border-white/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand/50 bg-slate-950 flex items-center justify-center shadow-lg">
              {currentAvatarSrc ? (
                <img
                  src={currentAvatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white/40" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-brand text-black rounded-full hover:bg-white transition-colors shadow-md"
              title="Upload photo from computer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 rounded">
                {roleLabel}
              </span>
            </div>

            <p className="text-white/50 text-xs flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white/40" />
              {user?.email}
            </p>

            {gymName && (
              <p className="text-white/40 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand" />
                <span>{gymName}</span>
              </p>
            )}

            {avatarFile && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/30 rounded text-brand text-xs">
                <span>Selected: {avatarFile.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <div className="bg-slate-900 border border-white/10 p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              <User className="w-4 h-4" /> General Information
            </h4>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +212 600000000"
                  className="w-full bg-slate-950 border border-white/10 pl-10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-950/50 border border-white/5 p-3 text-sm text-white/40 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Security / Password */}
          <div className="bg-slate-900 border border-white/10 p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </h4>
            <p className="text-white/40 text-xs">
              Leave blank if you do not want to change your password.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                minLength={6}
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              'Saving Changes...'
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;
