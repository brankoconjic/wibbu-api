/**
 * External dependencies.
 */
import crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { server } from '@/server';
import { SocialConnection } from '@/types/fastify';
import { capitalize } from '@/utils/string';
import WibbuException from '@/exceptions/WibbuException';

export const discordCallbackController = async (
	request: FastifyRequest<{
		Querystring: {
			code: string;
			state: string;
		};
	}>,
	reply: FastifyReply
) => {
	const { token } = await server.discord.getAccessTokenFromAuthorizationCodeFlow(request);
	// const { access_token, refresh_token, expires_at } = token;

	const nonce = crypto.randomBytes(16).toString('base64');

	const response = `
    <html>
        <body>
            <script nonce="${nonce}" type="text/javascript">
                if ( window.opener ) {
                    window.opener.postMessage({
                        type: 'wibbu-oauth',
                        provider: 'discord',
                        token: '${token}'
                    }, 'http://localhost:3000');
                }
                window.close();
            </script>    
        </body>
    </html>
    `;

	reply.header('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`).type('text/html').send(response);

	// reply.redirect(returnUrl);
};

/**
 * Redirect user to Discord OAuth2 authorization page.
 */
export const connectController = async (request: FastifyRequest, reply: FastifyReply, socialConnection: SocialConnection = 'DISCORD') => {
	const key = socialConnection.toLowerCase();

	// @ts-ignore
	if (!server[key]) {
		throw new WibbuException({
			statusCode: 404,
			code: 'NOT_FOUND',
			message: `Social connection ${capitalize(socialConnection)} is not supported.`,
		});
	}

	// @ts-ignore
	const redirectUri = server[key].generateAuthorizationUri(request);

	reply.redirect(redirectUri);
};
