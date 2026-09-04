import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export function useTelegram() {
  const tg = useMemo(() => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp ? window.Telegram.WebApp : null;
  }, []);

  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState('dark');

  useEffect(() => {
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.disableVerticalSwipes?.();

        if (tg.colorScheme) {
          setColorScheme(tg.colorScheme);
        }

        // Sync theme colors
        if (tg.backgroundColor) {
          document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
        }
        if (tg.textColor) {
          document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
        }
        if (tg.buttonColor) {
          document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
        }
        if (tg.buttonTextColor) {
          document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
        }
      } catch (e) {
        console.warn('Telegram WebApp initialization error:', e);
      }

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      } else {
        // Fallback demo user for local testing if running outside Telegram
        setUser({
          id: 8401599473,
          first_name: 'Rotha',
          last_name: '罗塔',
          username: 'Rotha102',
          language_code: 'en',
        });
      }
      setIsReady(true);
    } else {
      // Browser preview mode
      setUser({
        id: 8401599473,
        first_name: 'Rotha',
        last_name: '罗塔',
        username: 'Rotha102',
        language_code: 'en',
      });
      setIsReady(true);
    }
  }, [tg]);

  const haptic = useMemo(
    () => ({
      impact: (style = 'medium') => {
        try {
          tg?.HapticFeedback?.impactOccurred(style);
        } catch {}
      },
      notification: (type = 'success') => {
        try {
          tg?.HapticFeedback?.notificationOccurred(type);
        } catch {}
      },
      selection: () => {
        try {
          tg?.HapticFeedback?.selectionChanged();
        } catch {}
      },
    }),
    [tg]
  );

  const close = useCallback(() => {
    if (tg?.close) {
      tg.close();
    } else {
      alert('Telegram WebApp close() called.');
    }
  }, [tg]);

  // MainButton control
  const updateMainButton = useCallback(
    ({ text, onClick, isVisible = true, isActive = true, progress = false }) => {
      if (!tg?.MainButton) return;
      try {
        if (text) tg.MainButton.setText(text);
        if (isActive) tg.MainButton.enable();
        else tg.MainButton.disable();

        if (progress) tg.MainButton.showProgress();
        else tg.MainButton.hideProgress();

        if (onClick) {
          tg.MainButton.offClick();
          tg.MainButton.onClick(onClick);
        }

        if (isVisible) tg.MainButton.show();
        else tg.MainButton.hide();
      } catch (e) {
        console.warn('MainButton update error:', e);
      }
    },
    [tg]
  );

  const hideMainButton = useCallback(() => {
    try {
      tg?.MainButton?.hide();
    } catch {}
  }, [tg]);

  // BackButton control
  const updateBackButton = useCallback(
    ({ isVisible, onClick }) => {
      if (!tg?.BackButton) return;
      try {
        if (onClick) {
          tg.BackButton.offClick();
          tg.BackButton.onClick(onClick);
        }
        if (isVisible) tg.BackButton.show();
        else tg.BackButton.hide();
      } catch (e) {
        console.warn('BackButton update error:', e);
      }
    },
    [tg]
  );

  return {
    tg,
    user,
    isTelegram: Boolean(tg?.initData),
    initData: tg?.initData || '',
    themeParams: tg?.themeParams || {},
    colorScheme,
    haptic,
    close,
    updateMainButton,
    hideMainButton,
    updateBackButton,
    isReady,
  };
}
