import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | 'desktop' | 'web';

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const detectPlatform = () => {
      if (process.env.PLATFORM === 'ios') return 'ios';
      if (process.env.PLATFORM === 'android') return 'android';
      if (process.env.PLATFORM === 'desktop') return 'desktop';
      return 'web';
    };

    setPlatform(detectPlatform());
  }, []);

  const isMobile = platform === 'ios' || platform === 'android';
  const isDesktop = platform === 'desktop';
  const isWeb = platform === 'web';

  return {
    platform,
    isMobile,
    isDesktop,
    isWeb,
  };
}