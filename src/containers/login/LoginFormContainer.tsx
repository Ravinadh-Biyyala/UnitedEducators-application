import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button, FormField, Input, PasswordInput } from '@/components/common';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginFormContainer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!email) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    return next;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // TODO: replace with `useLoginMutation` from services/auth/authApi.ts
    setTimeout(() => {
      dispatch(
        setCredentials({
          user: { id: 'u1', name: 'John Michaels', email, role: 'Sr. Underwriter' },
          token: 'dev-token',
        }),
      );
      navigate('/dashboard');
    }, 300);
  };

  return (
    /* px-[28.8px] matches Figma field x-offset of 28.8 within the 540px card */
    <form onSubmit={onSubmit} className="space-y-5 px-[28.8px] pt-[17.69px]">
      <FormField label="EMAIL ADDRESS" error={errors.email} labelClassName="text-xs font-semibold tracking-widest text-form-label">
        <Input
          type="email"
          placeholder="you@ue.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </FormField>

      <div className="relative">
        <FormField label="PASSWORD" error={errors.password} labelClassName="text-xs font-semibold tracking-widest text-form-label">
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>
        <a
          href="/forgot-password"
          className="absolute top-0 right-0 text-xs text-brand-vivid font-medium hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Hook for future API error — not triggered by stub */}
      {/* {apiError && <p className="text-xs text-red-600">{apiError}</p>} */}

      <Button
        type="submit"
        disabled={submitting || !email || !password}
        className="w-full font-semibold gap-3 justify-between mt-2 bg-brand-vivid hover:bg-brand-vivid/90"
      >
        <LockIcon />
        <span>{submitting ? 'Signing in…' : 'Sign In'}</span>
        <ArrowRightIcon />
      </Button>
    </form>
  );
}
