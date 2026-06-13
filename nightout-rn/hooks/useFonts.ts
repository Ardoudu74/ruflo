import { useEffect } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '../store/useAppStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function useLoadFonts() {
  const setFontsLoaded = useAppStore(s => s.setFontsLoaded);

  useEffect(() => {
    Font.loadAsync({
      'ClashDisplay-Regular':   require('../assets/fonts/ClashDisplay-Regular.otf'),
      'ClashDisplay-Medium':    require('../assets/fonts/ClashDisplay-Medium.otf'),
      'ClashDisplay-Semibold':  require('../assets/fonts/ClashDisplay-Semibold.otf'),
      'ClashDisplay-Bold':      require('../assets/fonts/ClashDisplay-Bold.otf'),
      'ClashDisplay-Extrabold': require('../assets/fonts/ClashDisplay-Extrabold.otf'),
      'BebasNeue-Regular':      require('../assets/fonts/BebasNeue-Regular.ttf'),
      'Inter-Regular':          require('../assets/fonts/Inter-Regular.ttf'),
      'Inter-Medium':           require('../assets/fonts/Inter-Medium.ttf'),
      'Inter-SemiBold':         require('../assets/fonts/Inter-SemiBold.ttf'),
      'Inter-Bold':             require('../assets/fonts/Inter-Bold.ttf'),
    })
      .catch(err => console.warn('[Fonts] Load failed (using system fonts):', err))
      .finally(() => {
        setFontsLoaded(true);
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);
}
