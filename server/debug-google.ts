import { Request, Response } from 'express';
import { getGoogleAuthUrl } from './google-calendar';
import { ENV } from './_core/env';

/**
 * Endpoint de debug para verificar a URL de autorização do Google
 * GET /api/debug/google-auth-url?userId=123
 */
export async function debugGoogleAuthUrl(req: Request, res: Response) {
  try {
    const userId = parseInt(req.query.userId as string) || 1;
    
    console.log('=== DEBUG GOOGLE AUTH URL ===');
    console.log('APP_URL:', ENV.appUrl);
    console.log('GOOGLE_CLIENT_ID:', ENV.googleClientId?.substring(0, 20) + '...');
    console.log('GOOGLE_CLIENT_SECRET:', ENV.googleClientSecret ? 'SET' : 'MISSING');
    
    const authUrl = getGoogleAuthUrl(userId);
    
    console.log('Generated Auth URL:', authUrl);
    console.log('URL Length:', authUrl.length);
    console.log('Contains client_id:', authUrl.includes('client_id='));
    console.log('Contains redirect_uri:', authUrl.includes('redirect_uri='));
    
    // Decodificar URL para ver os parâmetros
    const url = new URL(authUrl);
    console.log('URL Parameters:');
    url.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    });
    
    return res.json({
      success: true,
      authUrl,
      urlLength: authUrl.length,
      parameters: {
        client_id: url.searchParams.get('client_id') || 'MISSING',
        redirect_uri: url.searchParams.get('redirect_uri') || 'MISSING',
        response_type: url.searchParams.get('response_type') || 'MISSING',
        scope: url.searchParams.get('scope') || 'MISSING',
        access_type: url.searchParams.get('access_type') || 'MISSING',
        state: url.searchParams.get('state') ? 'SET' : 'MISSING',
        prompt: url.searchParams.get('prompt') || 'MISSING',
      },
      environment: {
        appUrl: ENV.appUrl,
        nodeEnv: process.env.NODE_ENV,
        isProduction: ENV.isProduction,
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
