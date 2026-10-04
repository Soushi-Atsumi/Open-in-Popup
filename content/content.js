/*
 * Search in Popup - More useful searching extension than Built-in features.
 * Copyright (c) 2026 Soushi Atsumi. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */
'use strict';

(async () => {
	if (window !== window.top || !document.body) {
		return;
	}

	const result = await browser.runtime.sendMessage({ action: 'requestPopupSizeFix' });
	if (result?.shouldFix !== true) {
		return;
	}

	const width = result.width ?? '800px';
	const height = result.height ?? '600px';
	for (const target of [document.documentElement, document.body]) {
		target.style.setProperty('min-width', width, 'important');
		target.style.setProperty('min-height', height, 'important');
	}
	document.body.style.setProperty('container-type', 'normal', 'important');
})();