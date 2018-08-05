/*
 * Open in Popup - More useful searching extension than Built-in features.
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

var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/StorageKeys.json'), false);
xmlHttpRequest.send();
const storageKeys = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/TargetKeys.json'), false);
xmlHttpRequest.send();
const targetKeys = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/ProtocolKeys.json'), false);
xmlHttpRequest.send();
const protocolKeys = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/PopupKeys.json'), false);
xmlHttpRequest.send();
const popupKeys = JSON.parse(xmlHttpRequest.responseText);

browser.contextMenus.create({
	contexts: ['browser_action'],
	icons: {
		'1536': 'icons/icon-1536.png'
	},
	id: popupKeys.tutorialId,
	title: browser.i18n.getMessage('tutorial')
});

createContextMenus();

browser.contextMenus.onClicked.addListener((info, tab) => {
	var url;
	try {
		switch (info.menuItemId) {
			case popupKeys.tutorialId:
				browser.tabs.create({
					url: '/index.html'
				});
				return;
			case popupKeys.httpLinkId:
			case popupKeys.httpsLinkId:
			case popupKeys.viewSourceHttpLinkId:
			case popupKeys.viewSourceHttpsLinkId:
				url = new URL(info.linkUrl);
				break;
			case popupKeys.httpSelectionId:
			case popupKeys.httpsSelectionId:
			case popupKeys.viewSourceHttpSelectionId:
			case popupKeys.viewSourceHttpsSelectionId:
				url = new URL(info.selectionText);
				break;
		}

		switch (info.menuItemId) {
			case popupKeys.httpsLinkId:
			case popupKeys.httpsSelectionId:
				url.protocol = 'https';
				break;
			case popupKeys.viewSourceHttpsLinkId:
			case popupKeys.viewSourceHttpsSelectionId:
				url.protocol = 'https';
				url.href = `view-source:${url.href}`;
				break;
			case popupKeys.viewSourceHttpLinkId:
			case popupKeys.viewSourceHttpSelectionId:
				url.href = `view-source:${url.href}`;
				break;
		}
	} catch (e) {
		try {
			switch (info.menuItemId) {
				case popupKeys.httpSelectionId:
					url = new URL(`http://${info.selectionText}`);
					break;
				case popupKeys.httpsSelectionId:
					url = new URL(`https://${info.selectionText}`);
					break;
				case popupKeys.viewSourceHttpSelectionId:
					url = new URL(`view-source:http://${info.selectionText}`);
					break;
				case popupKeys.viewSourceHttpsSelectionId:
					url = new URL(`view-source:https://${info.selectionText}`);
					break;
			}
		} catch (e) {
			console.error(url);
			console.error(e);
			url = new URL(browser.extension.getURL('error/error.html'));
		}
	}

	browser.browserAction.setPopup({
		popup: url.href
	});

	browser.browserAction.openPopup();
});

async function createContextMenus() {
	browser.contextMenus.removeAll();

	var protocol;
	var target;
	var linkIsEnabled;
	var selectionIsEnabled;
	var viewSourceLinkIsEnabled;
	var viewSourceSelectionIsEnabled;

	await browser.storage.local.get().then((item) => {
		protocol = item[storageKeys.protocol] === undefined ? protocolKeys.ask : item[storageKeys.protocol];
		target = item[storageKeys.target] === undefined ? targetKeys.ask : item[storageKeys.target];
		linkIsEnabled = target === targetKeys.ask || item[storageKeys.link] === undefined ? true : item[storageKeys.link];
		selectionIsEnabled = target === targetKeys.ask || item[storageKeys.selection] === undefined ? true : item[storageKeys.selection];
		viewSourceLinkIsEnabled = target === targetKeys.ask || item[storageKeys.viewSourceLink] === undefined ? true : item[storageKeys.viewSourceLink];
		viewSourceSelectionIsEnabled = target === targetKeys.ask || item[storageKeys.viewSourceSelection] === undefined ? true : item[storageKeys.viewSourceSelection];
	});

	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: {
			'1536': 'icons/icon-1536.png'
		},
		id: popupKeys.tutorialId,
		title: browser.i18n.getMessage('tutorial')
	});

	if (protocol !== protocolKeys.http) {
		if (linkIsEnabled) {
			browser.contextMenus.create({
				contexts: ['link'],
				id: popupKeys.httpsLinkId,
				title: browser.i18n.getMessage("openingProtocolHttpsFromLink")
			});
		}

		if (selectionIsEnabled) {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: popupKeys.httpsSelectionId,
				title: browser.i18n.getMessage("openingProtocolHttpsFromSelection")
			});
		}

		if (viewSourceLinkIsEnabled) {
			browser.contextMenus.create({
				contexts: ['link'],
				id: popupKeys.viewSourceHttpsLinkId,
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpsFromLink')
			});
		}

		if (viewSourceSelectionIsEnabled) {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: popupKeys.viewSourceHttpsSelectionId,
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpsFromSelection')
			});
		}
	}

	if (protocol !== protocolKeys.https) {
		if (linkIsEnabled) {
			browser.contextMenus.create({
				contexts: ['link'],
				id: popupKeys.httpLinkId,
				title: browser.i18n.getMessage("openingProtocolHttpFromLink")
			});
		}

		if (selectionIsEnabled) {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: popupKeys.httpSelectionId,
				title: browser.i18n.getMessage("openingProtocolHttpFromSelection")
			});
		}

		if (viewSourceLinkIsEnabled) {
			browser.contextMenus.create({
				contexts: ['link'],
				id: popupKeys.viewSourceHttpLinkId,
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpFromLink')
			});
		}

		if (viewSourceSelectionIsEnabled) {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: popupKeys.viewSourceHttpSelectionId,
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpFromSelection')
			});
		}
	}

	browser.contextMenus.refresh();
}
