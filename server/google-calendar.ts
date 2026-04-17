import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ENV } from './_core/env';

console.log('[Google Calendar] ENV.googleClientId:', ENV.googleClientId ? 'SET' : 'MISSING');
console.log('[Google Calendar] ENV.googleClientSecret:', ENV.googleClientSecret ? 'SET' : 'MISSING');
// Determinar a Redirect URI baseada no ambiente
const getRedirectUri = () => {
  if (ENV.isProduction) {
    return 'https://dm-gestao-protocolos-production.up.railway.app/api/google-callback';
  }
  return `${ENV.oAuthServerUrl || 'http://localhost:3000'}/api/google-callback`;
};

const redirectUri = getRedirectUri();
console.log('[Google Calendar] NODE_ENV:', process.env.NODE_ENV);
console.log('[Google Calendar] ENV.isProduction:', ENV.isProduction);
console.log('[Google Calendar] Redirect URI:', redirectUri);
console.log('[Google Calendar] OAUTH_SERVER_URL:', ENV.oAuthServerUrl);

if (!ENV.googleClientId || !ENV.googleClientSecret) {
  console.error('[Google Calendar] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

const oauth2Client = new OAuth2Client(
  ENV.googleClientId,
  ENV.googleClientSecret,
  redirectUri
);

console.log('[Google Calendar] OAuth2Client initialized with clientId:', ENV.googleClientId?.substring(0, 20) + '...');

export function getOAuth2Client() {
  return oauth2Client;
}

/**
 * Gera a URL de autorização do Google
 */
export function getGoogleAuthUrl(userId: number): string {
  const state = JSON.stringify({ userId });
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    state: Buffer.from(state).toString('base64'),
  });
  console.log('[Google Calendar] Generated auth URL:', authUrl.substring(0, 100) + '...');
  return authUrl;
}

/**
 * Troca o código de autorização por tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
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
  oauth2Client.setCredentials({ access_token: accessToken });
  
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
  oauth2Client.setCredentials({ access_token: accessToken });
  
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
}

/**
 * Deleta um evento do Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });

  return { success: true };
}

/**
 * Atualiza o refresh token se necessário
 */
export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}
