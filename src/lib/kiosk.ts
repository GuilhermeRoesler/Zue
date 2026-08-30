import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Prepara o app para uso em vitrine/tablet:
 * tela sempre ligada e barras do sistema ocultas.
 */
export async function initKioskMode(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.hide();
  } catch (error) {
    console.warn('[kiosk] StatusBar:', error);
  }

  try {
    await KeepAwake.keepAwake();
  } catch (error) {
    console.warn('[kiosk] KeepAwake:', error);
  }
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
