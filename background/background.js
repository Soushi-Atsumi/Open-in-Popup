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

browser.browserAction.setTitle({ title: '' });

browser.contextMenus.create({
    contexts: ['browser_action'],
    icons: {
        "1536": "icons/icon-1536.png"
    },
    id: 'tutorial',
    title: browser.i18n.getMessage("tutorial")
});

browser.contextMenus.create({
    command: '_execute_browser_action',
    contexts: ['link', 'selection'],
    id: 'https',
    title: browser.i18n.getMessage("openingProtocolHttps")
});

browser.contextMenus.create({
    command: '_execute_browser_action',
    contexts: ['link', 'selection'],
    id: 'http',
    title: browser.i18n.getMessage("openingProtocolHttp")
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'tutorial') {
        browser.tabs.create({
            url: browser.i18n.getMessage("url_index.html")
        });
    } else {
        var url;

        try {
            if (info.linkUrl !== '') {
                url = new URL(info.linkUrl);
            } else {
                url = new URL(info.selectionText);
            }

            if (info.menuItemId === 'https') {
                url.protocol = 'https';
            }
        } catch (e) {
            try {
                switch (info.menuItemId) {
                    case 'http':
                        url = new URL('http://' + info.selectionText);
                        break;
                    case 'https':
                        url = new URL('https://' + info.selectionText);
                        break;
                }
            } catch (e) {
                browser.browserAction.setTitle({
                    title: browser.extension.getURL(browser.i18n.getMessage("url_error.html"))
                });
                return;
            }
        }

        browser.browserAction.setTitle({
            title: url.href
        });
    }
});
