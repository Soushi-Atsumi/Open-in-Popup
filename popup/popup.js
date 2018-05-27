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

browser.browserAction.getPopup({}).then((value) => {
    if (value === browser.extension.getURL('/popup/popup.html')) {
        browser.tabs.create({
            url: '/index.html'
        });
        window.close();
    }
});
