import { useEffect, useRef } from 'react';

/**
 * Google AdSense component.
 * Set VITE_ADSENSE_CLIENT in .env to your publisher ID (e.g. ca-pub-1234567890).
 * Each slot has its own adSlot prop (get slot IDs from your AdSense dashboard).
 *
 * Placement guide (most profitable first):
 *  - "leaderboard"  : 728×90 below hero — high CTR on desktop
 *  - "infeed"       : 300×250 between event cards — high RPM
 *  - "multiplex"    : native content grid — good for mobile
 *  - "anchor"       : sticky bottom — max mobile impressions
 */

const AD_FORMATS = {
  leaderboard: { style: { display: 'block', width: '100%', height: '90px' }, format: 'horizontal' },
  infeed: { style: { display: 'block', width: '300px', height: '250px', margin: '0 auto' }, format: 'rectangle' },
  multiplex: { style: { display: 'block' }, format: 'autorelaxed' },
};

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXXX';

export default function AdBanner({ type = 'infeed', adSlot }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (_) {}
    }
  }, []);

  if (!adSlot) return null;

  const cfg = AD_FORMATS[type] || AD_FORMATS.infeed;

  return (
    <div className={`ad-wrapper ad-${type}`} ref={ref}>
      <ins
        className="adsbygoogle"
        style={cfg.style}
        data-ad-client={CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={cfg.format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
