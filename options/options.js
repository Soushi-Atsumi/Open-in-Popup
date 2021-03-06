﻿/*
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

document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
document.title = browser.i18n.getMessage('optionsHTMLTitle');
document.getElementById('protocolLegend').innerText = browser.i18n.getMessage('protocol');
document.getElementById('askProtocolLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('alwaysUsesHttpLabel').innerText = browser.i18n.getMessage('alwaysUsesHttp');
document.getElementById('alwaysUsesHttpsLabel').innerText = browser.i18n.getMessage('alwaysUsesHttps');
document.getElementById('targetLegend').innerText = browser.i18n.getMessage('target');
document.getElementById('askTargetLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('specifyTargetLabel').innerText = browser.i18n.getMessage('specify');
document.getElementById('openFromLinkLabel').innerText = browser.i18n.getMessage('openFromLink');
document.getElementById('openFromSelectionLabel').innerText = browser.i18n.getMessage('openFromSelection');
document.getElementById('viewSourceFromLinkLabel').innerText = browser.i18n.getMessage('viewSourceFromLink');
document.getElementById('viewSourceFromSelectionLabel').innerText = browser.i18n.getMessage('viewSourceFromSelection');

var protocolAskRadio = document.getElementById('protocol-ask');
var protocolHttpRadio = document.getElementById('protocol-http');
var protocolHttpsRadio = document.getElementById('protocol-https');

document.options.protocol.forEach((element) => {
	element.addEventListener('click', protocolOnClick);
});

var checkboxes = document.getElementsByClassName('checkbox');

document.options.target.forEach((element) => {
	element.addEventListener('click', targetOnClick);
});

var targetAskRadio = document.getElementById('target-ask');
var targetSpecifyRadio = document.getElementById('target-specify');
var targetLinkCheckbox = document.getElementById('target-link');
var targetSelectionCheckbox = document.getElementById('target-selection');
var targetViewSourceLinkCheckbox = document.getElementById('target-view-source-link');
var targetViewSourceSelectionCheckbox = document.getElementById('target-view-source-selection');

for (let checkbox of checkboxes) {
	checkbox.addEventListener('click', checkboxesOnClick);
}

checkProtocols();
checkTargets();
checkCheckboxes();

function protocolOnClick(event) {
	switch (event.target.id) {
		case 'protocol-ask':
			browser.storage.local.set({ [storageKeys.protocol]: protocolKeys.ask });
			break;
		case 'protocol-http':
			browser.storage.local.set({ [storageKeys.protocol]: protocolKeys.http });
			break;
		case 'protocol-https':
			browser.storage.local.set({ [storageKeys.protocol]: protocolKeys.https });
			break;
	}

	createContextMenus();
}

function targetOnClick(event) {
	switch (event.target.id) {
		case 'target-ask':
			browser.storage.local.set({ [storageKeys.target]: targetKeys.ask });
			toggleCheckboxsDisabled(true);
			break;
		case 'target-specify':
			browser.storage.local.set({ [storageKeys.target]: targetKeys.specify });
			toggleCheckboxsDisabled(false);
			break;
	}

	createContextMenus();
}

function checkboxesOnClick(event) {
	browser.storage.local.set({
		[storageKeys.link]: targetLinkCheckbox.checked,
		[storageKeys.selection]: targetSelectionCheckbox.checked,
		[storageKeys.viewSourceLink]: targetViewSourceLinkCheckbox.checked,
		[storageKeys.viewSourceSelection]: targetViewSourceSelectionCheckbox.checked
	});

	createContextMenus();
}

function checkProtocols() {
	browser.storage.local.get([storageKeys.protocol]).then((item) => {
		switch (item[storageKeys.protocol]) {
			case protocolKeys.http:
				protocolHttpRadio.checked = true;
				break;
			case protocolKeys.https:
				protocolHttpsRadio.checked = true;
				break;
		}
	});
}

function checkTargets() {
	browser.storage.local.get(storageKeys.target).then((item) => {
		switch (item[storageKeys.target]) {
			case targetKeys.ask:
				targetAskRadio.checked = true;
				break;
			case targetKeys.specify:
				targetSpecifyRadio.checked = true;
				toggleCheckboxsDisabled(false);
				break;
		}
	});
}

function checkCheckboxes() {
	browser.storage.local.get([storageKeys.link, storageKeys.selection, storageKeys.viewSourceLink, storageKeys.viewSourceSelection]).then((item) => {
		targetLinkCheckbox.checked = item[storageKeys.link] === undefined ? true : item[storageKeys.selection];
		targetSelectionCheckbox.checked = item[storageKeys.selection] === undefined ? true : item[storageKeys.selection];
		targetViewSourceLinkCheckbox.checked = item[storageKeys.viewSourceLink] === undefined ? true : item[storageKeys.viewSourceLink];
		targetViewSourceSelectionCheckbox.checked = item[storageKeys.viewSourceSelection] === undefined ? true : item[storageKeys.viewSourceSelection];
	});
}

function toggleCheckboxsDisabled(disabled) {
	for (let i = 0; i < checkboxes.length; i++) {
		checkboxes[i].disabled = disabled;
	}
}

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
