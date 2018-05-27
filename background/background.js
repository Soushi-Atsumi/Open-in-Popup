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

browser.contextMenus.create({
	contexts: ['browser_action'],
	icons: {
		'1536': 'icons/icon-1536.png'
	},
	id: 'tutorial',
	title: browser.i18n.getMessage('tutorial')
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	var url;
	try {
		switch (info.menuItemId) {
			case 'tutorial':
				browser.tabs.create({
					url: '/index.html'
				});
				return;
			case 'http-link':
			case 'https-link':
			case 'view-source-http-link':
			case 'view-source-https-link':
				url = new URL(info.linkUrl);
				break;
			case 'http-selection':
			case 'https-selection':
			case 'view-source-http-selection':
			case 'view-source-https-selection':
				url = new URL(info.selectionText);
				break;
		}

		switch (info.menuItemId) {
			case 'https-link':
			case 'https-selection':
				url.protocol = 'https';
				break;
			case 'view-source-https-link':
			case 'view-source-https-selection':
				url.protocol = 'https';
			case 'view-source-http-link':
			case 'view-source-http-selection':
				url.href = `view-source:${url.href}`;
				break;
		}
	} catch (e) {
		try {
			switch (info.menuItemId) {
				case 'http-selection':
					url = new URL(`http://${info.selectionText}`);
					break;
				case 'https-selection':
					url = new URL(`https://${info.selectionText}`);
					break;
				case 'view-source-http-selection':
					url = new URL(`http://${info.selectionText}`);
					url.href = `view-source:${url.href}`;
					break;
				case 'view-source-https-selection':
					url = new URL(`https://${info.selectionText}`);
					url.href = `view-source:${url.href}`;
					break;
			}
		} catch (e) {
			url = new URL(browser.extension.getURL('error/error.html'));
		}
	}

	browser.browserAction.setPopup({
		popup: url.href
	});
	browser.browserAction.openPopup();
});

browser.contextMenus.onShown.addListener(function (info, tab) {
	browser.contextMenus.removeAll();
	browser.storage.local.get(['protocol', 'target']).then((item) => {
		if (Object.keys(item).length === 0) {
			createContextMenus('protocol-ask', 'target-ask');
		} else {
			createContextMenus(item['protocol'], item['target']);
		}

		browser.contextMenus.refresh();
	});
});

function createContextMenus(protocol, target) {
	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: {
			'1536': 'icons/icon-1536.png'
		},
		id: 'tutorial',
		title: browser.i18n.getMessage('tutorial')
	});

	if (protocol === 'protocol-ask' || protocol === 'protocol-https') {
		if (target === 'target-ask' || target === 'target-link') {
			browser.contextMenus.create({
				contexts: ['link'],
				id: 'https-link',
				title: browser.i18n.getMessage('openingProtocolHttpsFromLink')
			});
		}

		if (target === 'target-ask' || target === 'target-selection') {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: 'https-selection',
				title: browser.i18n.getMessage('openingProtocolHttpsFromSelection')
			});
		}
		if (target === 'target-ask' || target === 'target-view-source-link') {
			browser.contextMenus.create({
				contexts: ['link'],
				id: 'view-source-https-link',
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpsFromLink')
			});
		}
		if (target === 'target-ask' || target === 'target-view-source-selection') {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: 'view-source-https-selection',
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpsFromSelection')
			});
		}
	}

	if (protocol === 'protocol-ask' || protocol === 'protocol-http') {
		if (target === 'target-ask' || target === 'target-link') {
			browser.contextMenus.create({
				contexts: ['link'],
				id: 'http-link',
				title: browser.i18n.getMessage('openingProtocolHttpFromLink')
			});
		}

		if (target === 'target-ask' || target === 'target-selection') {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: 'http-selection',
				title: browser.i18n.getMessage('openingProtocolHttpFromSelection')
			});
		}
		if (target === 'target-ask' || target === 'target-view-source-link') {
			browser.contextMenus.create({
				contexts: ['link'],
				id: 'view-source-http-link',
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpFromLink')
			});
		}
		if (target === 'target-ask' || target === 'target-view-source-selection') {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: 'view-source-http-selection',
				title: browser.i18n.getMessage('openingProtocolViewSourceHttpFromSelection')
			});
		}
	}
}