'use client';

import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

// Initialize fingerprint
export async function initFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

// Get device fingerprint
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    // Fallback to a combination of browser properties
    const fallback = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
    return btoa(fallback);
  }
}
