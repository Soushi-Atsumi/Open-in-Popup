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

main();

async function main() {
    let media;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const mediaTypeKeys = JSON.parse(await (await fetch('/_values/MediaTypes.json')).text());

    if (urlSearchParams.has(mediaTypeKeys.audio)) {
        media = new Audio(decodeURIComponent(urlSearchParams.get(mediaTypeKeys.audio)));
        media.controls = true;
    } else if(urlSearchParams.has(mediaTypeKeys.image)) {
        media = new Image();
        media.src = decodeURIComponent(urlSearchParams.get(mediaTypeKeys.image));
    } else if(urlSearchParams.has(mediaTypeKeys.video)) {
        media = document.createElement('video');
        media.controls = true;
        media.src = decodeURIComponent(urlSearchParams.get(mediaTypeKeys.video));
    } else {
        window.location.assign('/error/error.html');
        return;
    }

    document.body.appendChild(media);
}
