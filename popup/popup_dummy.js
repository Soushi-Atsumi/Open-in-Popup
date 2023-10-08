/*
 * Open in Popup - Very simple and useful extension. You can open a link in the popup.
 * Copyright (c) 2022 Soushi Atsumi. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */
'use strict';

const urlSearchParams = new URLSearchParams(window.location.search);
const tabId = isNaN(parseInt(urlSearchParams.get('tabId'))) ? undefined : parseInt(urlSearchParams.get('tabId'));
const windowId = isNaN(parseInt(urlSearchParams.get('windowId'))) ? undefined : parseInt(urlSearchParams.get('windowId'));

setTimeout(async () => window.location = await browser.browserAction.getPopup({ tabId: tabId, windowId: windowId }), 500);
