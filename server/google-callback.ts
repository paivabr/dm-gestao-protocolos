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

    // Verificar se houve erro na autorização
    if (error) {
      return res.redirect(`/?error=google_auth_failed&message=${error}`);
    }

    if (!code || typeof code !== 'string') {
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
    const tokens = await googleCalendar.exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Salvar tokens no banco de dados
    const success = await db.updateGoogleCalendarTokens(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token || undefined,
      googleCalendarId: 'primary', // Usar calendário principal
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to save tokens' });
    }

    // Redirecionar para página de sucesso
    return res.redirect('/?google_auth_success=true');
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
