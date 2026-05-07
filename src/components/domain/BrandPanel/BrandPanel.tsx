import ueLogo from '@/assets/logos/ue-logo.png';

const FEATURES = [
  '9 UE product lines in a single workflow',
  'Role-based access for UW teams',
  'Real-time appetite scoring & alerts',
];

function FeatureIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-brand-accent"
    >
      {/* Gold-tinted square bg with gold border, matching Figma fill_IZMGBO / fill_3A9N9N */}
      <rect width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.15" />
      <rect width="28" height="28" rx="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
      <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 14l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandPanel() {
  return (
    /* Full-height gradient panel — no white header bar (matches Figma exactly) */
    <div className="flex flex-col h-full min-h-screen bg-brand-panel relative overflow-hidden">
      {/* 4 px gold separator stripe at very top (Figma node 320:47573, y=0, h=4) */}
      <div
        className="w-full shrink-0"
        style={{
          height: 4,
          background: 'linear-gradient(90deg, #C9A227 0%, #A8841C 100%)',
        }}
        aria-hidden="true"
      />

      {/* Dot-grid decorative overlay — low opacity, matches DotGrid node */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.08 }}
        
        aria-hidden="true"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
      </div>

      {/* UE logo — top-left directly on gradient (Figma node 320:47641, x=44, y=13.6, 123×30) */}
      <div className="px-11 pt-3.5 pb-0 relative z-10">
        <img
          src={ueLogo}
          alt="United Educators"
          width={123}
          height={30}
          className="object-contain"
        />
      </div>

      {/* Main content area — vertically centered in remaining space */}
      <div className="flex-1 flex flex-col justify-center px-11 relative z-10">
        {/* Headline (Figma node 320:47576 — Source Sans 3 ExtraBold 32px) */}
        <h1
          className="text-white font-extrabold mb-8"
          style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: '38.4px' }}
        >
          Education Insurance
          <br />
          <span className="text-brand-accent">Underwriting</span>
          <br />
          Made Smarter.
        </h1>

        {/* Body copy (Figma node 320:47578 — Source Sans 3 Regular 14.08px, white 55% opacity) */}
        <p
          className="mb-10 max-w-[340px]"
          style={{ fontSize: 14, lineHeight: '24px', color: 'rgba(255,255,255,0.55)' }}
        >
          Purpose-built for school districts and educational institutions.
          Streamline submissions, quotes, and policy binding — all in one place.
        </p>

        {/* Feature list (Figma nodes 320:47579–47602) */}
        <ul className="space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <FeatureIcon />
              <span
                className="text-white"
                style={{ fontSize: 12.8, fontWeight: 500, lineHeight: '19.2px', color: 'rgba(255,255,255,0.65)' }}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer (Figma node 320:47603 — top border rgba(255,255,255,0.1), y=665) */}
      <div
        className="px-11 pb-5 relative z-10"
        style={{
          borderTop: '0.8px solid rgba(255,255,255,0.1)',
          paddingTop: 20,
        }}
      >
        <p style={{ fontSize: 10.88, lineHeight: '17.4px', color: 'rgba(255,255,255,0.25)' }}>
          © 2024 United Educators. All rights reserved.
          <br />
          For authorized personnel only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
