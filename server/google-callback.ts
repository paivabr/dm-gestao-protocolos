import { Request, Response } from 'express';
import * as googleCalendar from './google-calendar';
import * as db from './db';

/**
 * Endpoint de callback do OAuth do Google
 * GET /api/google-callback?code=...&state=...
 */
export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const { code, state, error } = req.query;
    console.log('[Google Callback] Received callback with:', { code: code ? 'SET' : 'MISSING', state: state ? 'SET' : 'MISSING', error });

    // Verificar se houve erro na autorização
    if (error) {
      console.log('[Google Callback] Authorization error:', error);
      return res.redirect(`/?error=google_auth_failed&message=${error}`);
    }

    if (!code || typeof code !== 'string') {
      console.error('[Google Callback] Missing or invalid authorization code');
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Decodificar state para obter userId
    let userId: number;
    try {
      const stateStr = typeof state === 'string' ? state : '';
      const decodedState = JSON.parse(Buffer.from(stateStr, 'base64').toString());
      userId = decodedState.userId;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Trocar código por tokens
    console.log('[Google Callback] Exchanging code for tokens...');
    const tokens = await googleCalendar.exchangeCodeForTokens(code);
    console.log('[Google Callback] Tokens received:', { access_token: tokens.access_token ? 'SET' : 'MISSING', refresh_token: tokens.refresh_token ? 'SET' : 'MISSING' });

    if (!tokens.access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Salvar tokens no banco de dados
    console.log('[Google Callback] Saving tokens to database for userId:', userId);
    const success = await db.updateGoogleCalendarTokens(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token || undefined,
      googleCalendarId: 'primary', // Usar calendário principal
    });

    if (!success) {
      console.error('[Google Callback] Failed to save tokens to database');
      return res.status(500).json({ error: 'Failed to save tokens' });
    }
    console.log('[Google Callback] Tokens saved successfully');

    // Redirecionar para página de sucesso
    return res.redirect('/?google_auth_success=true');
  } catch (error) {
    console.error('[Google Callback] Error:', error);
    console.error('[Google Callback] Error details:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
}
