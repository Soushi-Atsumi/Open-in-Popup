/*
 * Open in Popup - Very simple and useful extension. You can open a link in the popup.
 * Copyright (c) 2018 Soushi Atsumi. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */
'use strict';

let mediaTypes;
let placements;
let protocols;
let storageKeys;
let targets;
let userAgents;
let currentSettings;
let currentTabId;
let currentWindowId;

const optionsId = 'options';
const tutorialId = 'tutorial';
const httpsAudioId = 'https-audio';
const httpsBookmarkId = 'https-Bookmark';
const httpsImageId = 'https-image';
const httpsLinkId = 'https-link';
const httpsPageId = 'https-page';
const httpsSelectionId = 'https-selection';
const httpsVideoId = 'https-video';
const viewSourceHttpsBookmarkId = 'view-source-https-Bookmark';
const viewSourceHttpsLinkId = 'view-source-https-link';
const viewSourceHttpsPageId = 'view-source-https-page';
const viewSourceHttpsSelectionId = 'view-source-https-selection';
const httpAudioId = 'http-audio';
const httpBookmarkId = 'http-Bookmark';
const httpImageId = 'http-image';
const httpLinkId = 'http-link';
const httpPageId = 'http-page';
const httpSelectionId = 'http-selection';
const httpVideoId = 'http-video';
const viewSourceHttpBookmarkId = 'view-source-http-Bookmark';
const viewSourceHttpLinkId = 'view-source-http-link';
const viewSourceHttpPageId = 'view-source-http-page';
const viewSourceHttpSelectionId = 'view-source-http-selection';
const bookmarksPermissions = { permissions: ['bookmarks'] };
const hostPermissions = { origins: ['*://*/*'] };

main();

async function main() {
	await readValues();
	browser.contextMenus.onClicked.addListener(openInThePopup);
	browser.contextMenus.onShown.addListener(async () => {
		currentTabId = currentSettings[storageKeys.placement] === placements.tab ? (await browser.tabs.query({ active: true, currentWindow: true }))[0].id : undefined;
		currentWindowId = currentSettings[storageKeys.placement] === placements.window ? (await browser.tabs.query({ active: true, currentWindow: true }))[0].windowId : undefined;
	});
	const filter = { tabId: -1, urls: ['*://*/*'] };
	const extraInfoSpec = ['blocking', 'requestHeaders'];
	const onBeforeSendHeadersListener = details => {
		details.requestHeaders.filter(requestHeader => requestHeader.name.toLowerCase() === 'user-agent').forEach(element => {
			switch (currentSettings[storageKeys.userAgent]) {
				case userAgents.android:
					element.value = element.value.replace(/\(.+?;/, '(Android;');
					break;
				case userAgents.firefoxOS:
					element.value = element.value.replace(/\(.+?;/, '(Mobile;');
					break;
				case userAgents.iOS:
					element.value = element.value.replace(/\(.+?;/, '(iPhone;');
					break;
			}
		});

		return { requestHeaders: details.requestHeaders };
	};
	const permissionsOnAddedListener = permissions => {
		if (bookmarksPermissions.permissions.every(permission => permissions.permissions.includes(permission))) {
			updateContextMenus();
		} else if (hostPermissions.origins.every(origin => permissions.origins.includes(origin))) {
			browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, filter, extraInfoSpec);
		}
	};
	const permissionsOnRemovedListener = permissions => {
		if (bookmarksPermissions.permissions.every(permission => permissions.permissions.includes(permission))) {
			updateContextMenus();
		} else if (hostPermissions.origins.every(origin => permissions.origins.includes(origin))) {
			browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
		}
	};
	browser.permissions.onAdded.addListener(permissionsOnAddedListener);
	browser.permissions.onRemoved.addListener(permissionsOnRemovedListener);
	browser.runtime.onMessage.addListener(async (message, _0, _1) => {
		if (message.action === 'refresh') {
			currentSettings = await (await getStorageType()).get();
			updateContextMenus();
		}
	});
	currentSettings = await (await getStorageType()).get();
	await createContextMenus();
	if (await browser.permissions.contains(hostPermissions)) {
		browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, filter, extraInfoSpec);
	}
}

async function createContextMenus() {
	const contextMenusObject = await createContextMenusObject();
	const manifest = await (await fetch('manifest.json')).json();

	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: manifest.icons,
		id: tutorialId,
		title: browser.i18n.getMessage('openTutorial')
	});

	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: manifest.icons,
		id: optionsId,
		title: browser.i18n.getMessage('openOptions')
	});

	for (const i in contextMenusObject) {
		for (const j in contextMenusObject[i]) {
			browser.contextMenus.create(contextMenusObject[i][j]);
		}
	}
}

async function createContextMenusObject() {
	const protocol = currentSettings[storageKeys.protocol] === undefined ? protocols.ask : currentSettings[storageKeys.protocol];
	const target = currentSettings[storageKeys.target] === undefined ? targets.ask : currentSettings[storageKeys.target];
	const hasBookmarkPermission = await browser.permissions.contains(bookmarksPermissions);
	const bookmarkIsEnabled = hasBookmarkPermission && (target === targets.ask || currentSettings[storageKeys.bookmark] === undefined ? true : currentSettings[storageKeys.bookmark]);
	const linkIsEnabled = target === targets.ask || currentSettings[storageKeys.link] === undefined ? true : currentSettings[storageKeys.link];
	const pageIsEnabled = target === targets.ask || currentSettings[storageKeys.page] === undefined ? true : currentSettings[storageKeys.page];
	const selectionIsEnabled = target === targets.ask || currentSettings[storageKeys.selection] === undefined ? true : currentSettings[storageKeys.selection];
	const viewSourceFromBookmarkIsEnabled = hasBookmarkPermission && (target === targets.ask || currentSettings[storageKeys.viewSourceFromBookmark] === undefined ? true : currentSettings[storageKeys.viewSourceFromBookmark]);
	const viewSourceLinkIsEnabled = target === targets.ask || currentSettings[storageKeys.viewSourceLink] === undefined ? true : currentSettings[storageKeys.viewSourceLink];
	const viewSourcePageIsEnabled = target === targets.ask || currentSettings[storageKeys.viewSourcePage] === undefined ? true : currentSettings[storageKeys.viewSourcePage];
	const viewSourceSelectionIsEnabled = target === targets.ask || currentSettings[storageKeys.viewSourceSelection] === undefined ? true : currentSettings[storageKeys.viewSourceSelection];

	const contextMenusObject = {
		http: {},
		https: {}
	};

	const useHttpMessage = browser.i18n.getMessage('useHttp');
	const useHttpsMessage = browser.i18n.getMessage('useHttps');
	const viewSourceMessage = browser.i18n.getMessage('viewSource');
	const viewSourceHttpMessage = `(${viewSourceMessage})(${useHttpMessage})`;
	const viewSourceHttpsMessage = `(${viewSourceMessage})(${useHttpsMessage})`;

	// http
	contextMenusObject.http.audio = {
		contexts: ['audio'],
		id: httpAudioId,
		targetUrlPatterns: ['http://*/*'],
		title: `${browser.i18n.getMessage('openThisAudio')}(${useHttpMessage})`,
		visible: protocol !== protocols.https
	};

	contextMenusObject.http.bookmark = {
		contexts: ['bookmark'],
		id: httpBookmarkId,
		title: `${browser.i18n.getMessage('openThisBookmark')}(${useHttpMessage})`,
		visible: protocol !== protocols.https && bookmarkIsEnabled
	};

	contextMenusObject.http.image = {
		contexts: ['image'],
		id: httpImageId,
		targetUrlPatterns: ['http://*/*'],
		title: `${browser.i18n.getMessage('openThisImage')}(${useHttpMessage})`,
		visible: protocol !== protocols.https
	};

	contextMenusObject.http.link = {
		contexts: ['link'],
		id: httpLinkId,
		targetUrlPatterns: ['http://*/*'],
		title: `${browser.i18n.getMessage('openThisLink')}(${useHttpMessage})`,
		visible: protocol !== protocols.https && linkIsEnabled
	};

	contextMenusObject.http.page = {
		contexts: ['page', 'tab'],
		documentUrlPatterns: ['http://*/*'],
		id: httpPageId,
		title: `${browser.i18n.getMessage('openThisPage')}(${useHttpMessage})`,
		visible: protocol !== protocols.https && pageIsEnabled
	};

	contextMenusObject.http.selection = {
		contexts: ['selection'],
		id: httpSelectionId,
		title: `${browser.i18n.getMessage('openThisSelection')}(${useHttpMessage})`,
		visible: protocol !== protocols.https && selectionIsEnabled
	};

	contextMenusObject.http.video = {
		contexts: ['video'],
		id: httpVideoId,
		targetUrlPatterns: ['http://*/*'],
		title: `${browser.i18n.getMessage('openThisVideo')}(${useHttpMessage})`,
		visible: protocol !== protocols.https
	};

	contextMenusObject.http.viewSourceFromBookmark = {
		contexts: ['bookmark'],
		id: viewSourceHttpBookmarkId,
		title: `${browser.i18n.getMessage('openThisBookmark')}${viewSourceHttpMessage}`,
		visible: protocol !== protocols.https && viewSourceFromBookmarkIsEnabled
	};

	contextMenusObject.http.viewSourceLink = {
		contexts: ['link'],
		id: viewSourceHttpLinkId,
		targetUrlPatterns: ['http://*/*'],
		title: `${browser.i18n.getMessage('openThisLink')}${viewSourceHttpMessage}`,
		visible: protocol !== protocols.https && viewSourceLinkIsEnabled
	};

	contextMenusObject.http.viewSourcePage = {
		contexts: ['page', 'tab'],
		documentUrlPatterns: ['http://*/*'],
		id: viewSourceHttpPageId,
		title: `${browser.i18n.getMessage('openThisPage')}${viewSourceHttpMessage}`,
		visible: protocol !== protocols.https && viewSourcePageIsEnabled
	};

	contextMenusObject.http.viewSourceSelection = {
		contexts: ['selection'],
		id: viewSourceHttpSelectionId,
		title: `${browser.i18n.getMessage('openThisSelection')}${viewSourceHttpMessage}`,
		visible: protocol !== protocols.https && viewSourceSelectionIsEnabled
	};

	// https
	contextMenusObject.https.audio = {
		contexts: ['audio'],
		id: httpsAudioId,
		targetUrlPatterns: ['*://*/*'],
		title: `${browser.i18n.getMessage('openThisAudio')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http
	};

	contextMenusObject.https.bookmark = {
		contexts: ['bookmark'],
		id: httpsBookmarkId,
		title: `${browser.i18n.getMessage('openThisBookmark')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http && bookmarkIsEnabled
	};

	contextMenusObject.https.image = {
		contexts: ['image'],
		id: httpsImageId,
		targetUrlPatterns: ['*://*/*'],
		title: `${browser.i18n.getMessage('openThisImage')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http
	};

	contextMenusObject.https.link = {
		contexts: ['link'],
		id: httpsLinkId,
		targetUrlPatterns: ['*://*/*'],
		title: `${browser.i18n.getMessage('openThisLink')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http && linkIsEnabled
	};

	contextMenusObject.https.page = {
		contexts: ['page', 'tab'],
		documentUrlPatterns: ['*://*/*'],
		id: httpsPageId,
		title: `${browser.i18n.getMessage('openThisPage')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http && pageIsEnabled
	};

	contextMenusObject.https.selection = {
		contexts: ['selection'],
		id: httpsSelectionId,
		title: `${browser.i18n.getMessage('openThisSelection')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http && selectionIsEnabled
	};

	contextMenusObject.https.video = {
		contexts: ['video'],
		id: httpsVideoId,
		targetUrlPatterns: ['*://*/*'],
		title: `${browser.i18n.getMessage('openThisVideo')}(${useHttpsMessage})`,
		visible: protocol !== protocols.http
	};

	contextMenusObject.https.viewSourceFromBookmark = {
		contexts: ['bookmark'],
		id: viewSourceHttpsBookmarkId,
		title: `${browser.i18n.getMessage('openThisBookmark')}${viewSourceHttpsMessage}`,
		visible: protocol !== protocols.http && viewSourceFromBookmarkIsEnabled
	};

	contextMenusObject.https.viewSourceLink = {
		contexts: ['link'],
		id: viewSourceHttpsLinkId,
		targetUrlPatterns: ['*://*/*'],
		title: `${browser.i18n.getMessage('openThisLink')}${viewSourceHttpsMessage}`,
		visible: protocol !== protocols.http && viewSourceLinkIsEnabled
	};

	contextMenusObject.https.viewSourcePage = {
		contexts: ['page', 'tab'],
		documentUrlPatterns: ['*://*/*'],
		id: viewSourceHttpsPageId,
		title: `${browser.i18n.getMessage('openThisPage')}${viewSourceHttpsMessage}`,
		visible: protocol !== protocols.http && viewSourcePageIsEnabled
	};

	contextMenusObject.https.viewSourceSelection = {
		contexts: ['selection'],
		id: viewSourceHttpsSelectionId,
		title: `${browser.i18n.getMessage('openThisSelection')}${viewSourceHttpsMessage}`,
		visible: protocol !== protocols.http && viewSourceSelectionIsEnabled
	};

	return contextMenusObject;
}

async function getStorageType() {
	const item = await browser.storage.local.get();
	return Object.keys(item).length === 0 || item[storageKeys.sync] ? browser.storage.sync : browser.storage.local;
}

async function openInThePopup(info, tab) {
	let url;

	try {
		setPopupDummy(currentTabId, currentWindowId);
		browser.browserAction.openPopup();

		switch (info.menuItemId) {
			case tutorialId:
				url = new URL(browser.runtime.getURL('/index.html'));
				break;
			case optionsId:
				url = new URL((await browser.management.getSelf()).optionsUrl);
				break;
			case httpLinkId:
			case httpsLinkId:
			case viewSourceHttpLinkId:
			case viewSourceHttpsLinkId:
				url = new URL(info.linkUrl);
				break;
			case httpSelectionId:
			case httpsSelectionId:
			case viewSourceHttpSelectionId:
			case viewSourceHttpsSelectionId:
				url = new URL(info.selectionText);
				break;
			case httpAudioId:
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.audio}=${encodeURIComponent(info.srcUrl)}`));
				break;
			case httpImageId:
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.image}=${encodeURIComponent(info.srcUrl)}`));
				break;
			case httpVideoId:
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.video}=${encodeURIComponent(info.srcUrl)}`));
				break;
			case httpsAudioId:
			case httpsImageId:
			case httpsVideoId:
				url = new URL(info.srcUrl);
				break;
			case httpPageId:
			case httpsPageId:
			case viewSourceHttpPageId:
			case viewSourceHttpsPageId:
				url = new URL(tab.url);
				break;
			case httpBookmarkId:
			case httpsBookmarkId:
			case viewSourceHttpBookmarkId:
			case viewSourceHttpsBookmarkId:
				const bookmarks = await browser.bookmarks.get(info.bookmarkId);
				if (bookmarks[0].type === browser.bookmarks.BookmarkTreeNodeType.BOOKMARK) {
					url = new URL(bookmarks[0].url);
				} else {
					throw `${bookmarks[0].url} is not a bookmark of a page.`;
				}
				break;
		}

		switch (info.menuItemId) {
			case httpsAudioId:
				url.protocol = 'https';
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.audio}=${encodeURIComponent(url.href)}`));
				break;
			case httpsImageId:
				url.protocol = 'https';
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.image}=${encodeURIComponent(url.href)}`));
				break;
			case httpsVideoId:
				url.protocol = 'https';
				url = new URL(browser.runtime.getURL(`/popup/popup_media.html?${mediaTypes.video}=${encodeURIComponent(url.href)}`));
				break;
			case httpsBookmarkId:
			case httpsLinkId:
			case httpsPageId:
			case httpsSelectionId:
				url.protocol = 'https';
				break;
			case viewSourceHttpsBookmarkId:
			case viewSourceHttpsLinkId:
			case viewSourceHttpsPageId:
			case viewSourceHttpsSelectionId:
				url.href = url.href.replace(/^view-source:/, '');
				url.protocol = 'https';
				url.href = `view-source:${url.href}`;
				break;
			case viewSourceHttpBookmarkId:
			case viewSourceHttpLinkId:
			case viewSourceHttpPageId:
			case viewSourceHttpSelectionId:
				if (!url.href.startsWith('view-source:')) {
					url.href = `view-source:${url.href}`;
				}
				break;
		}
	} catch (e) {
		console.error(e);
		try {
			switch (info.menuItemId) {
				case httpSelectionId:
					url = new URL(`http://${info.selectionText}`);
					break;
				case httpsSelectionId:
					url = new URL(`https://${info.selectionText}`);
					break;
				case viewSourceHttpSelectionId:
					url = new URL(`view-source:http://${info.selectionText}`);
					break;
				case viewSourceHttpsSelectionId:
					url = new URL(`view-source:https://${info.selectionText}`);
					break;
				default:
					url = new URL(browser.runtime.getURL('error/error.html'));
					break;
			}
		} catch (e) {
			console.error(e);
			url = new URL(browser.runtime.getURL('error/error.html'));
		}
	}

	browser.browserAction.setPopup({
		popup: url === undefined ? new URL(browser.runtime.getURL('error/error.html')) : url.href,
		tabId: currentTabId,
		windowId: currentWindowId
	});
}

async function readValues() {
	const keyFiles = ['MediaTypes.json', 'Placements.json', 'Protocols.json', 'StorageKeys.json', 'Targets.json', 'UserAgents.json'].map(keyFile => `/_values/${keyFile}`);
	const jsonContents = await Promise.all(keyFiles.map(async keyFile => await (await fetch(keyFile)).json()));
	mediaTypes = jsonContents[0];
	placements = jsonContents[1];
	protocols = jsonContents[2];
	storageKeys = jsonContents[3];
	targets = jsonContents[4];
	userAgents = jsonContents[5];
}

async function setPopupDummy(tabId, windowId) {
	let popup;

	if (tabId === undefined && windowId === undefined) {
		popup = `popup/popup_dummy.html`;
	} else if (tabId === undefined && windowId !== undefined) {
		popup = `popup/popup_dummy.html?windowId=${windowId}`;
	} else if (tabId !== undefined && windowId === undefined) {
		popup = `popup/popup_dummy.html?tabId=${tabId}`;
	}

	return browser.browserAction.setPopup({
		popup: browser.runtime.getURL(popup),
		tabId: tabId,
		windowId: windowId
	});
}

async function updateContextMenus() {
	const contextMenusObject = await createContextMenusObject();

	for (const i in contextMenusObject) {
		for (const j in contextMenusObject[i]) {
			browser.contextMenus.update(contextMenusObject[i][j].id, { visible: contextMenusObject[i][j].visible });
		}
	}
}
