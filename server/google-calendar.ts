import { OAuth2Client } from 'google-auth-library';
import { ENV } from './_core/env';

console.log('[Google Calendar] ENV.googleClientId:', ENV.googleClientId ? 'SET' : 'MISSING');
console.log('[Google Calendar] ENV.googleClientSecret:', ENV.googleClientSecret ? 'SET' : 'MISSING');

// Determinar a Redirect URI baseada no APP_URL
const getRedirectUri = () => {
  return `${ENV.appUrl}/api/google-callback`;
};

const redirectUri = getRedirectUri();
console.log('[Google Calendar] APP_URL:', ENV.appUrl);
console.log('[Google Calendar] Redirect URI:', redirectUri);

if (!ENV.googleClientId || !ENV.googleClientSecret) {
  console.error('[Google Calendar] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

const oauth2Client = new OAuth2Client(
  ENV.googleClientId || '',
  ENV.googleClientSecret || '',
  redirectUri
);

console.log('[Google Calendar] OAuth2Client initialized');

export function getOAuth2Client() {
  return oauth2Client;
}

/**
 * Gera a URL de autorização do Google
 */
export function getGoogleAuthUrl(userId: number): string {
  try {
    const state = JSON.stringify({ userId });
    const stateBase64 = Buffer.from(state).toString('base64');
    
    // Construir URL manualmente para garantir que client_id está presente
    const params = new URLSearchParams({
      client_id: ENV.googleClientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      state: stateBase64,
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log('[Google Calendar] Generated auth URL with client_id:', ENV.googleClientId?.substring(0, 20) + '...');
    console.log('[Google Calendar] Full auth URL:', authUrl.substring(0, 150) + '...');
    
    return authUrl;
  } catch (error) {
    console.error('[Google Calendar] Error generating auth URL:', error);
    throw error;
  }
}

/**
 * Troca o código de autorização por tokens
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('[Google Calendar] Error exchanging code for tokens:', error);
    throw error;
  }
}

/**
 * Cria um evento no Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
  }
) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const { google } = await import('googleapis');
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const endTime = event.endTime || new Date(event.startTime.getTime() + 60 * 60 * 1000);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error('[Google Calendar] Error creating event:', error);
    throw error;
  }
}

/**
 * Atualiza um evento no Google Calendar
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  event: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
  }
) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const { google } = await import('googleapis');
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    const updatedEvent = {
      summary: event.title || response.data.summary,
      description: event.description || response.data.description,
      start: event.startTime ? {
        dateTime: event.startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      } : response.data.start,
      end: event.endTime ? {
        dateTime: event.endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      } : response.data.end,
    };

    const updateResponse = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
    });

    return updateResponse.data;
  } catch (error) {
    console.error('[Google Calendar] Error updating event:', error);
    throw error;
  }
}

/**
 * Deleta um evento do Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const { google } = await import('googleapis');
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return { success: true };
  } catch (error) {
    console.error('[Google Calendar] Error deleting event:', error);
    throw error;
  }
}

/**
 * Atualiza o refresh token se necessário
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('[Google Calendar] Error refreshing access token:', error);
    throw error;
  }
}
