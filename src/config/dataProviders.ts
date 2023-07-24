/**
 * External dependencies.
 */
import { FastifyOAuth2Options } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import { API_BASE, API_PREFIX, INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET } from './environment';

const instagramConfig: FastifyOAuth2Options = {
  name: 'instagram',
  scope: ['user_profile', 'user_media'],
  credentials: {
    client: {
      id: INSTAGRAM_APP_ID!,
      secret: INSTAGRAM_APP_SECRET!,
    },
    auth: {
      authorizeHost: 'https://api.instagram.com',
      authorizePath: '/oauth/authorize',
      tokenHost: 'https://api.instagram.com',
      tokenPath: '/oauth/access_token',
    },
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  },
  startRedirectPath: `/${API_PREFIX}/data/connect/instagram`,
  callbackUri: `${API_BASE}/${API_PREFIX}/data/callback/instagram`,
  callbackUriParams: {
    access_type: 'offline', // will tell Instagram to send a refreshToken too
  },
};

export const dataProviders = [instagramConfig];
