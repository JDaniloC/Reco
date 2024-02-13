import { CreateOptions } from 'venom-bot';

const venomOptions: CreateOptions = {
	autoClose: 0,
	session: 'barden-bot',
	browserPathExecutable: '/usr/bin/google-chrome',
	browserArgs: [
		'--disable-web-security',
		'--no-sandbox',
		'--disable-web-security',
		'--aggressive-cache-discard',
		'--disable-cache',
		'--disable-application-cache',
		'--disable-offline-load-stale-cache',
		'--disk-cache-size=0',
		'--disable-background-networking',
		'--disable-default-apps',
		'--disable-extensions',
		'--disable-sync',
		'--disable-translate',
		'--hide-scrollbars',
		'--metrics-recording-only',
		'--mute-audio',
		'--no-first-run',
		'--safebrowsing-disable-auto-update',
		'--ignore-certificate-errors',
		'--ignore-ssl-errors',
		'--ignore-certificate-errors-spki-list',
		'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
	],
}

export default venomOptions;