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

document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
document.title = browser.i18n.getMessage('optionsHTMLTitle');
document.getElementById('protocolLegend').innerText = browser.i18n.getMessage('protocol');
document.getElementById('askProtocolLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('alwaysUsesHttpLabel').innerText = browser.i18n.getMessage('alwaysUsesHttp');
document.getElementById('alwaysUsesHttpsLabel').innerText = browser.i18n.getMessage('alwaysUsesHttps');
document.getElementById('targetLegend').innerText = browser.i18n.getMessage('target');
document.getElementById('askTargetLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('alwaysOpenFromLinkLabel').innerText = browser.i18n.getMessage('alwaysOpenFromLink');
document.getElementById('alwaysOpenFromSelectionLabel').innerText = browser.i18n.getMessage('alwaysOpenFromSelection');
document.getElementById('alwaysViewSourceFromLinkLabel').innerText = browser.i18n.getMessage('alwaysViewSourceFromLink');
document.getElementById('alwaysViewSourceFromSelectionLabel').innerText = browser.i18n.getMessage('alwaysViewSourceFromSelection');

document.options.protocol.forEach((element) => {
	element.addEventListener('click', protocolOnClick);
});

document.options.target.forEach((element) => {
	element.addEventListener('click', targetOnClick);
});

checkProtocol();
checkTarget();

function protocolOnClick(event) {
	browser.storage.local.set({ 'protocol': event.target.id });
	checkProtocol();
}

function targetOnClick(event) {
	browser.storage.local.set({ 'target': event.target.id });
	checkTarget();
}

function checkProtocol() {
	browser.storage.local.get('protocol').then((item) => {
		if (Object.keys(item).length === 0) {
			browser.storage.local.set({ 'protocol': 'protocol-ask' });
			document.getElementById('protocol-ask').checked = true;
		} else {
			document.getElementById(item['protocol']).checked = true;
		}
	});
}

function checkTarget() {
	browser.storage.local.get('target').then((item) => {
		if (Object.keys(item).length === 0) {
			browser.storage.local.set({ 'target': 'target-ask' });
			document.getElementById('target-ask').checked = true;
		} else {
			document.getElementById(item['target']).checked = true;
		}
	});
}
