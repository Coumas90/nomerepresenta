import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

export interface HCaptchaRef {
  reset: () => void;
}

// Using hCaptcha's test site key for development
// In production, replace with your own site key from https://dashboard.hcaptcha.com
const HCAPTCHA_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001';

export const HCaptchaComponent = forwardRef<HCaptchaRef, HCaptchaComponentProps>(
  ({ onVerify, onExpire, onError }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        captchaRef.current?.resetCaptcha();
      },
    }));

    const handleVerify = useCallback((token: string) => {
      onVerify(token);
    }, [onVerify]);

    const handleExpire = useCallback(() => {
      onExpire?.();
    }, [onExpire]);

    const handleError = useCallback((error: string) => {
      console.error('hCaptcha error:', error);
      onError?.(error);
    }, [onError]);

    return (
      <div className="flex justify-center my-4">
        <HCaptcha
          ref={captchaRef}
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
          theme="dark"
        />
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';
