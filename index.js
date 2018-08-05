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
document.title = browser.i18n.getMessage('indexHTMLTitle');
document.getElementById('tutorialTitleLabel').innerText = browser.i18n.getMessage('tutorialTitle');
document.getElementById('icon').alt = browser.i18n.getMessage('iconImageAlt');
document.getElementById('heading1').innerText = browser.i18n.getMessage('indexHTMLHeading1');
document.getElementById('heading2').innerText = browser.i18n.getMessage('indexHTMLHeading2');

var tutorialVideoLabel = document.getElementById('tutorialVideoDescriptionLabel');
tutorialVideoLabel.innerText = browser.i18n.getMessage('watchTheVideo');
var tutorialVideoDivision = document.getElementById('tutorialVideoDivision');
var closeTutorialVideoButton = document.getElementById('closeTutorialVideoButton');
var tutorialVideoIframe = document.getElementById('tutorialVideoIframe');

document.getElementById('cautionDivision').innerText = browser.i18n.getMessage('indexHTMLCaution');

tutorialVideoDivision.addEventListener('click', () => {
	tutorialVideoOnClose();
});

closeTutorialVideoButton.addEventListener('click', () => {
	tutorialVideoOnClose();
});

tutorialVideoLabel.addEventListener('click', () => {
	tutorialVideoOnShow();
});

function tutorialVideoOnShow() {
	tutorialVideoDivision.style.display = 'block';
	tutorialVideoIframe.src = browser.i18n.getMessage('indexHTMLTutorialVideo');
}

function tutorialVideoOnClose() {
	tutorialVideoDivision.style.display = 'none';
	tutorialVideoIframe.src = "";
}
