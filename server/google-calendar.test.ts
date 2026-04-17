import { describe, it, expect, beforeAll } from 'vitest';
import { getGoogleAuthUrl } from './google-calendar';
import { ENV } from './_core/env';

describe('Google Calendar Integration', () => {
  beforeAll(() => {
    console.log('=== Google Calendar Test Suite ===');
    console.log('GOOGLE_CLIENT_ID:', ENV.googleClientId ? 'SET' : 'MISSING');
    console.log('GOOGLE_CLIENT_SECRET:', ENV.googleClientSecret ? 'SET' : 'MISSING');
  });

  it('should generate auth URL with client_id', () => {
    const userId = 123;
    const authUrl = getGoogleAuthUrl(userId);
    
    console.log('\n=== Generated Auth URL ===');
    console.log('Full URL:', authUrl);
    console.log('URL length:', authUrl.length);
    
    // Verificar se a URL contém client_id
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain(ENV.googleClientId);
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('scope=');
    expect(authUrl).toContain('access_type=offline');
    
    console.log('✓ Auth URL contains all required parameters');
  });

  it('should have valid client_id format', () => {
    if (!ENV.googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID is not set');
    }
    
    console.log('\n=== Client ID Validation ===');
    console.log('Client ID:', ENV.googleClientId);
    
    // Google Client IDs têm o formato: {numbers}-{random}.apps.googleusercontent.com
    const googleClientIdPattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
    expect(ENV.googleClientId).toMatch(googleClientIdPattern);
    
    console.log('✓ Client ID has valid format');
  });

  it('should have valid redirect URI', () => {
    const userId = 123;
    const authUrl = getGoogleAuthUrl(userId);
    
    console.log('\n=== Redirect URI Validation ===');
    
    const urlObj = new URL(authUrl);
    const redirectUri = urlObj.searchParams.get('redirect_uri');
    
    console.log('Redirect URI:', redirectUri);
    
    expect(redirectUri).toBeDefined();
    expect(redirectUri).toContain('/api/google-callback');
    
    console.log('✓ Redirect URI is valid');
  });

  it('should encode state parameter correctly', () => {
    const userId = 456;
    const authUrl = getGoogleAuthUrl(userId);
    
    console.log('\n=== State Parameter Validation ===');
    
    const urlObj = new URL(authUrl);
    const state = urlObj.searchParams.get('state');
    
    console.log('State (encoded):', state);
    
    expect(state).toBeDefined();
    
    // Decodificar e verificar
    const decodedState = Buffer.from(state!, 'base64').toString('utf-8');
    console.log('State (decoded):', decodedState);
    
    const stateObj = JSON.parse(decodedState);
    expect(stateObj.userId).toBe(userId);
    
    console.log('✓ State parameter is valid');
  });
});
