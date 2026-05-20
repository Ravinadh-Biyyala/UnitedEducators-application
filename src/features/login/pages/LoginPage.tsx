import loginHero from '@/assets/images/login-hero.png';
import { BrandPanel } from '@/components/domain';
import { LoginFormContainer } from '@/containers/login';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: brand panel — 644px / ~42% at design width, full gradient, no white header */}
      <div className="w-full lg:w-[42%] flex flex-col">
        <BrandPanel />
      </div>

      {/* Right: hero photo full-bleed + centered sign-in card (Figma: 890px wide, bg #F4F7FC) */}
      <div
        className="w-full lg:flex-1 flex items-center justify-center relative bg-[#F4F7FC] bg-cover bg-center"
        style={{ backgroundImage: `url(${loginHero})` }}
      >
        {/* Sign-in card (Figma node 320:47614 — white, 540px wide, top border 2.4px #DCE3EC) */}
        <div
          className="relative w-full bg-white"
          style={{
            maxWidth: 540,
            margin: '40px',
            borderRadius: 0,
            borderTop: '2.4px solid #DCE3EC',
            borderLeft: '0.8px solid #DCE3EC',
            borderRight: '0.8px solid #DCE3EC',
            borderBottom: '0.8px solid #DCE3EC',
            padding: '26.5px 0 28.8px',
          }}
        >
          {/* Card header (Figma node 320:47609, x=29, y=26.5, 375×62) */}
          <div style={{ paddingLeft: 29, paddingRight: 29 }}>
            <h2
              className="font-extrabold text-form-heading"
              style={{ fontSize: 24.8, lineHeight: '37.2px', letterSpacing: '-0.02em', color: '#1A2530' }}
            >
              Sign in to your account
            </h2>
            <p style={{ fontSize: 13.12, lineHeight: '19.68px', color: '#7A8FA3' }}>
              Select your role below to load demo credentials, or enter your own.
            </p>
          </div>

          {/* Form fields */}
          <LoginFormContainer />
        </div>
      </div>
    </div>
  );
}
