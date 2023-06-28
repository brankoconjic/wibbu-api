/**
 * External dependencies.
 */
import { INSTAGRAM_APP_SECRET } from '@/config/environment';
import WibbuException from '@/exceptions/WibbuException';
import { BAD_REQUEST_EXCEPTION } from '@/exceptions/exceptions';
import puppeteer from 'puppeteer';

/**
 * Get Pinterest data, first try API and if it fails, scrape the data.
 *
 * @param username - Pinterest username.
 */
export const getPinterestData = async (username: string) => {
	let data: any = null;

	data = await scrapePinterestData(username);

	return data;
};

/**
 * Scrape Pinterest data.
 *
 * @param username - Pinterest username.
 */
export const scrapePinterestData = async (username: string) => {
	console.log(`https://www.pinterest.com/${username}`);

	// Launch Puppeteer and go to the Pinterest.
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();
	await page.goto(`https://www.pinterest.com/${username}/_created/`);

	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

	await page.screenshot({ path: 'example.png' });

	// Parse the page content
	const data = await page.evaluate(() => {
		// const posts: any = [];

		const followersCountEl = document.querySelector('div[data-test-id="profile-followers-count"] > div > span');
		const followersCount = followersCountEl ? followersCountEl.textContent : null;
		console.log('Followers: ', followersCount);

		return followersCount;
	});

	// Close the browser
	await browser.close();

	// Finally, return the data
	return data;
};

/**
 * Get Instagram data. Combines data from API and scraping follower count if profile is public.
 *
 * @param accessToken - Instagram access token.
 * @returns - Instagram data.
 */
export const getInstagramData = async (accessToken: string, limit: number = 6) => {
	const requestUrl = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption&access_token=${accessToken}&limit=${limit}`;
	const response = await fetch(requestUrl);
	const data = await response.json();

	return data;
};

/* --------------------------------- Helpers -------------------------------- */
type InstagramLongTokenResponse = {
	access_token?: string;
	token_type?: 'bearer' | string;
	expires_in?: number;
	error?: string;
};

/**
 * Get long-lived Instagram token.
 *
 * @param accessToken - Instagram access token.
 * @returns Long-lived Instagram token that lasts approximately 60 days.
 */
export const getLongInstagramToken = async (accessToken: string) => {
	const requestUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${accessToken}`;
	const response = await fetch(requestUrl);

	const data: InstagramLongTokenResponse = await response.json();

	// Failed to get long-lived token.
	if (data.error) {
		throw new WibbuException(BAD_REQUEST_EXCEPTION);
	}

	return data;
};

/**
 * Refresh long-lived Instagram token.
 *
 * @param accessToken - Instagram access token.
 * @returns Refreshed long-lived Instagram token that lasts approximately 60 days.
 */
export const refreshLongInstagramToken = async (accessToken: string) => {
	const requestUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
	const response = await fetch(requestUrl);

	const data: InstagramLongTokenResponse = await response.json();

	// Failed to refresh long-lived token.
	if (data.error) {
		throw new WibbuException(BAD_REQUEST_EXCEPTION);
	}

	return data;
};
