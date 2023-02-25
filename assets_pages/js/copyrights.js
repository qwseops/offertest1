$(function() {
    let copyrightImage = $('img[alt="copyright"]');
    let copyrightImageTT_1 = $('img[alt="copyright_tt_1"]');
    let copyrightImageTT_2 = $('img[alt="copyright_tt_2"]');
    let copyrightText = $('#copyright-text');

    // 1. Copyright text replace
    if (copyrightText.length) {
        if (copyrightImage.length) {
            copyrightImage.replaceWith(copyrightText);
            copyrightText.show();
        }
    }

    // 2. User contacts replace
    let userContacts = $('#user_contacts');
    let userContactsImgWrapper;
    let userContactsImg;

    if (userContacts.length) {
        if (copyrightImage.length) {
            userContactsImgWrapper = userContacts.find('#user_contacts_img_wrapper');
            userContactsImg = userContactsImgWrapper.find('img');

            let copyrightRegexp = /white-(\d+).png/;
            let userContactsRegexp = /\/([a-z]+)-(\d+).png/;

            if (copyrightRegexp.test(copyrightImage.attr('src'))) {
                userContactsImg.attr('src', userContactsImg.attr('src').replace(userContactsRegexp, '/white-$2.png'));
            }

            copyrightImage.after(userContactsImgWrapper);
        }

        if (copyrightText.length) {
            copyrightText.append(userContacts.find('#user_contacts_text_wrapper'));
        }
    }

    // 3. TikTok copyrights
    if (!copyrightText.length) {
        if (copyrightImageTT_1.length) {
            if (copyrightImageTT_1.attr('src') == '') {
                copyrightImageTT_1.remove();
            } else {
                copyrightImage.replaceWith(copyrightImageTT_1);
            }
        }

        if (copyrightImageTT_2.attr('src') == '' ||(userContactsImg != undefined && userContactsImg.length)) {
            copyrightImageTT_2.remove();
        }
    } else {
        copyrightImageTT_1.remove();
        copyrightImageTT_2.remove();
    }
});
