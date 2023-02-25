(function () {
    'use strict';

    var wvDOM = {
        getElement: function (elem) {
            if (!elem) return undefined;
            return document.querySelector(elem);
        },
        getElementAll: function (elem) {
            if (!elem) return undefined;
            return document.querySelectorAll(elem);
        },
        getAttributeElement: function (elem, name) {
            if (!name || !elem) return undefined;
            return elem.getAttribute(name);
        },
        crateScript: function (value) {
            if (!value) return undefined;
            var newScript = document.createElement('script');
            newScript.innerHTML = value;
            document.body.appendChild(newScript);
        },
        crateScriptHead: function (value) {
            if (!value) return undefined;
            var newScript = document.createElement('script');
            newScript.innerHTML = value;
            document.head.appendChild(newScript);
        }
    };

    var wvParams = {
        offerId: '',
        pageType: '',
        createdUrl: '',
        YmCounter: '',
        GaCounter: '',
        tracker: '',
        params: '',
        // Функция для работы с url
        get: function (name) {
            if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(this.getLocationSearch()));
            return (name === null) ? undefined : encodeURIComponent(name[ 1 ]);
        },
        getAllCounts: function (countName) {
            var allCounts = {};
            var params = wvParams.getLocationSearch().replace('?', '').split('&')
                .filter(function (el) {
                    return el.match(countName)

                });
            params.forEach(function (el) {
                var id = el.split('=');
                if (id[ 0 ].indexOf(countName) + 1) {
                    allCounts[ id[ 0 ] ] = id[ 1 ];
                }
            });
            return Object.keys(allCounts).length ? allCounts : '';
        },
        // Складывает строки, если второй параметр пустой или с ошибкой, вернет ''
        set: function (str, existStr) {
            if (str && existStr && existStr !== 'undefined') {
                return str + existStr;
            }
            return '';
        },
        getLocationSearch: function () {
            return location.search;
        },
        getUrl: function () {
            return window.location.href;
        },
        getHtmlData: function () {
            return wvDOM.getElement('html');
        },
        // Проверка на существование параметра или куки, возвращает первое что существует или пустую строку
        isExist: function (prop) {
            var param = this.get(prop);
            if (param) {
                return param;
            }

            var cookie = wvCookie.get('c_' + prop);
            if (cookie) {
                return cookie;
            }

            return '';
        },
        // Проверка существования свойства
        isReal: function (prop) {
            if (prop) {
                return prop;
            }
            return '';
        }
    };

    var wvCookie = {
        // Получаем куки
        get: function (name) {
            if (!name) return;
            var matches = this.searchCookie(name);
            return matches ? decodeURIComponent(matches[ 1 ]) : undefined;
        },
        // Устанавливаем куки
        set: function (cname, cvalue, exdays) {
            var expires, cookieStr, d = new Date();

            if (!exdays) {
                exdays = 1;
            }

            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            expires = 'expires=' + d.toUTCString();

            if (cname && cvalue) {
                cookieStr = cname + '=' + cvalue + ';' + expires + ';path=/';
                document.cookie = cookieStr;
            } else {
                cookieStr = null;
            }

            return cookieStr;
        },
        //устанавливаем куки из параметров url
        setParamsToCookie: function () {
            var paramsArr = [ 'ym', 'ga', 'fb', 'tt', 'fb_sot', 'fb_sol', 'fb_sos', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term' ];
            return paramsArr.map(function (param_key) {
                var parameter = wvParams.get(param_key);
                if (parameter) {
                    return wvCookie.set('c_' + param_key, parameter, 1);
                }
            });
        },
        // Поиск куки
        searchCookie: function (name) {
            return document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        },
        updateExpireDate: function(){
            const cookieDecoded = decodeURIComponent(document.cookie);
            const cookieArr = cookieDecoded.split('; ');
            cookieArr.forEach(function(val) {
                var name, value;
                name = val.slice(0, val.indexOf("="));
                value = val.substring(val.indexOf("=")+1);
                wvCookie.set(name, value, 1);
            })
        }
    };

    // Объект с известными параметрами или куками
    var wvPageData = {
        ym: wvParams.isExist('ym'),
        ga: wvParams.isExist('ga'),
        fb: wvParams.isExist('fb'),
        fb_track: wvParams.isExist('fb_track'),
        fb2: wvParams.isExist('fb2'),
        fb2_track: wvParams.isExist('fb2_track'),
        tt: wvParams.isExist('tt'),
        utm_source: wvParams.isExist('utm_source'),
        utm_medium: wvParams.isExist('utm_medium'),
        utm_campaign: wvParams.isExist('utm_campaign'),
        utm_content: wvParams.isExist('utm_content'),
        utm_term: wvParams.isExist('utm_term'),
        shopwindow_id: wvParams.isExist('shopwindow_id'),
        cbwv: wvParams.isExist('cbwv'),
        fb_sot: wvParams.isExist('fb_sot'), // Флаг для установки пикселя на прелендинг
        fb_sol: wvParams.isExist('fb_sol'), // Флаг для установки пикселя на лендинг
        fb_sos: wvParams.isExist('fb_sos'), // Флаг для установки пикселя на success
        allTiktok: wvParams.getAllCounts('pixel_id'), // Пиксели тиктока
    };

    var wvMetric = {
        pageType: null,
        // Устанавливает счетчики
        add: function (type, counterID) {
            switch (type) {
                case 'YM':
                    if (counterID !== null) {
                        var scriptYM = '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", https://mc.yandex.com/metrika/tag.js, "ym"); ym(' + counterID + ', "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });';
                        wvDOM.crateScript(scriptYM);
                        return scriptYM;
                    }
                    break;
                case 'GA':
                    if (counterID !== null) {
                        var scriptGA = '(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');ga(\'create\', \'' + counterID + '\', \'auto\');ga(\'send\', \'pageview\');';
                        wvDOM.crateScript(scriptGA);
                        return scriptGA;
                    }
                    break;
                case 'TP':
                        var scriptTP = '!function (p,i,x,e,l,j,s) {p[l] = p[l] || function (pixelId) {p[l].pixelId = pixelId};j = i.createElement(x), s = i.getElementsByTagName(x)[0], j.async = 1, j.src = e, s.parentNode.insertBefore(j, s)}(window, document, "script", https://cdn.truffle.bid/p/inline-pixel.js, "ttf") \nttf("f19b6513-7856-cdd5-c801-9ed3b8f32cf7")';
                        wvDOM.crateScript(scriptTP);
                        return scriptTP;
                case 'FB':
                    if (counterID !== null) {
                        var scriptFB;
                        var track = 'fbq(\'track\', \'' + (wvPageData.fb_track || 'PageView') + '\');';

                        if (this.pageType === 'success' && wvPageData.fb_track !== 'Purchase') {
                            track = 'fbq(\'track\', \'Lead\'); fbq(\'track\', \'AddToCart\'); fbq(\'track\', \'' + (wvPageData.fb_track || 'PageView') + '\');'
                        }

                        scriptFB = '!function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod?' +
                            'n.callMethod.apply(n,arguments):n.queue.push(arguments)};' +
                            'if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';' +
                            'n.queue=[];t=b.createElement(e);t.async=!0;' +
                            't.src=v;s=b.getElementsByTagName(e)[0];' +
                            's.parentNode.insertBefore(t,s)}(window, document,\'script\',' +
                            '\'https://connect.facebook.net/en_US/fbevents.js\');' +
                            'fbq(\'init\', ' + counterID + ');' + track;
                        wvDOM.crateScript(scriptFB);
                        return scriptFB;
                    }
                    break;
                case 'FB2':
                    if (counterID !== null) {
                        var scriptFB;
                        var track = 'fbq(\'track\', \'' + (wvPageData.fb2_track || 'PageView') + '\');';

                        if (wvPageData.fb2_track !== 'Purchase') {
                            track = 'fbq(\'track\', \'Lead\'); fbq(\'track\', \'AddToCart\'); fbq(\'track\', \'' + (wvPageData.fb2_track || 'PageView') + '\');'
                        }

                        scriptFB = '!function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod?' +
                            'n.callMethod.apply(n,arguments):n.queue.push(arguments)};' +
                            'if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';' +
                            'n.queue=[];t=b.createElement(e);t.async=!0;' +
                            't.src=v;s=b.getElementsByTagName(e)[0];' +
                            's.parentNode.insertBefore(t,s)}(window, document,\'script\',' +
                            '\'https://connect.facebook.net/en_US/fbevents.js\');' +
                            'fbq(\'init\', ' + counterID + ');' + track;
                        wvDOM.crateScript(scriptFB);
                        return scriptFB;
                    }
                    break;
                case 'TT':
                    if (counterID !== null) {
                        var scriptTT;
                        var track = 'tt(\'track\', \'' + (wvPageData.tt || 'PageView') + '\');';
                        var scriptTT = `!function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }, ttq.load = function (e, n) { var i = https://analytics.tiktok.com/i18n/pixel/events.js; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a) }; ttq.load('${counterID}'); ttq.page();}(window, document, 'ttq');`
                        wvDOM.crateScript(scriptTT);
                        return scriptTT;
                    }
                    break;
                default: return null;
            }
        },
        // Для установки ползовательских метрик
        set: function (ym, ga, fb, fb2, tt, allTiktok, pageType) {
            if (!ym && !ga && !fb && ! tt && !pageType) return null;
            var counts = '';
            this.pageType = pageType;
            if (ym) {
                counts += this.add('YM', ym);

            }
            if (ga) {
                counts += this.add('GA', ga);
            }
            //фб устанавливается в зависисмости от типа страницы и переданных параметров
            if (fb) {
                var pixel = {
                    fb_sot: wvParams.isExist('fb_sot'),
                    fb_sol: wvParams.isExist('fb_sol'),
                    fb_sos: wvParams.isExist('fb_sos'),
                };

                //если не передано параметров для пикселя, вешаем его на все страницы
                if (!pixel.fb_sot && !pixel.fb_sol && !pixel.fb_sos && !pageType) {
                    counts += this.add('FB', fb);
                }

                if (pixel.fb_sol && pageType === 'landing') {
                    counts += this.add('FB', fb);
                }

                if (pixel.fb_sot && pageType === 'prelanding') {
                    counts += this.add('FB', fb);
                }

                if (pixel.fb_sos && pageType === 'success') {
                    counts += this.add('FB', fb);
                }
            }

            if (fb2) {
                if (pageType === 'success') {
                    counts += this.add('FB2', fb2);
                }
            }

            if (tt) {
                counts += this.add('TT', tt)
            }

            if (allTiktok) {
                if (pageType === 'success') {
                    for (var key in allTiktok) {
                        counts += this.add('TT', allTiktok[key])
                    }
                }
            }
            return counts;
        },
        metricsHandler: function (cb) {
            if (!cb) {
                throw new Error('metricsHandler method don`t has param')
            }
            var unloadedMetricsCount = 3;
            //вызываем трекер второй раз когда загрузятся метрики и отправляем куки YM и GA, и полученные гуиды
            wvParams.tracker.addEventListener('load', function () {
                cb();
                tryCB();
            });

            //ждем загрузки счетчика YM https://bit.ly/2T1m8Kt
            document.addEventListener('yacounter' + wvParams.YmCounter + 'inited', function () {
                tryCB();
            });

            //ждем загрузки счетчика GA, https://bit.ly/2BDZYqD
            try {
                ga(function () {
                    tryCB();
                });
            } catch (e) {
                throw new Error('google analytics не загружен, выключите adblock');
            }

            function tryCB() {
                unloadedMetricsCount--;
                if (unloadedMetricsCount === 0) {
                    // cb();
                }
            }
            return true;
        }
    };

    var wvForm = {
        data: [
            'ym',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
            'prelanding_id',
            'url',
            'cookie_enabled',
            'referer',
            'shopwindow_id'
         ],
        // Устанавливаем параметры в инпуты
        setParamsToInput: function () {
            this.setFormsInput('ym', wvPageData.ym);
            this.setFormsInput('utm_source', wvPageData.utm_source);
            this.setFormsInput('utm_medium', wvPageData.utm_medium);
            this.setFormsInput('utm_campaign', wvPageData.utm_campaign);
            this.setFormsInput('utm_content', wvPageData.utm_content);
            this.setFormsInput('utm_term', wvPageData.utm_term);
            this.setFormsInput('prelanding_id', wvParams.isReal(wvParams.get('prelanding_id')));
            this.setFormsInput('url', wvParams.getUrl());
            this.setFormsInput('cookie_enabled', (navigator.cookieEnabled) ? 1 : 0);
            this.setFormsInput('referer', wvPage.getReferrer());
            this.setFormsInput('shopwindow_id', wvPageData.shopwindow_id);
            return true;
        },
        setFormsInput: function (inputName, value) {
            if (!inputName || !value) return null;
            var inputs = this.getInputs('input[name="' + inputName + '"]');
            if (inputs) {
                Array.prototype.forEach.call(inputs, function (input) {
                    input.value = value;
                });

                return true;
            }
        },
        getInputs: function (inputName) {
            return wvDOM.getElementAll(inputName);
        }
    };

    var wvLink = {
        // Изменение ссылок на странице на новый путь
        changeLinks: function () {
            var amountLinks = wvLink.getLink('a');
            if (!amountLinks) {
                throw new Error('Links of the page not found!');
            }
            amountLinks.forEach(function (link) {
                link.setAttribute('href', wvLink.getUrl());
            });
            return amountLinks;
        },
        // Изменение ПАРАМЕТРОВ ссылок на странице только с определенным классом
        changeLinksByClassName: function (classNames) {
            if (!classNames) return null;

            return classNames.map(function (className) {
                var links = wvLink.getLink(className);
                if (!links) {
                    throw new Error('Class "' + className + '" not found!');
                }

                links.forEach(function (link) {
                    var currentHref = link.getAttribute('href');
                    currentHref += wvPage.getQuerySimbols(currentHref) + wvParams.params;
                    link.setAttribute('href', currentHref);

                });
                return links;
            });
        },
        // Изменение ПОЛНЫХ ссылок на странице только с определенным классом
        changeFullLinksByClassName: function (classNames) {
            if (!classNames) return null;
            return classNames.map(function (className) {
                var links = wvLink.getLink(className);
                if (!links) {
                    throw new Error('Class "' + className + '" not found!');
                }
                links.forEach(function (link) {
                    link.setAttribute('href', wvLink.getUrl());
                });
                return links;
            });
        },
        getLink: function (elem) {
            return wvDOM.getElementAll(elem);
        },
        getUrl: function () {
            return wvParams.createdUrl;
        }
    };

    var wvGuid = {
        // Получение гуида
        getGuid: function (name) {
            if (!name) return null;
            var dataGuid = this.getAttrElem(this.getHtmlData(), 'data-' + name);
            if (dataGuid) {
                return dataGuid;
            } else {
                var c_guid = wvCookie.get('c_' + name);
                if (c_guid) {
                    return c_guid;
                } else {
                    return '';
                }
            }
        },
        // Ставим гуид в куки
        setGuidsToCookie: function () {
            var first_guid = this.getAttrElem(this.getHtmlData(), 'data-first_guid');
            var guid = this.getAttrElem(this.getHtmlData(), 'data-guid');
            if (first_guid) {
                wvCookie.set('c_first_guid', first_guid, 1);
                wvCookie.set('c_guid', guid, 1);
                return first_guid;
            } else if (guid) {
                wvCookie.set('c_first_guid', guid, 1);
                wvCookie.set('c_guid', guid, 1);
                return guid;
            } else {
                return undefined;
            }
        },
        // Ставим гуиды в инпуты
        setGuidsToInput: function () {
            var first_guid = this.getAttrElem(this.getHtmlData(), 'data-first_guid');
            var guid = this.getAttrElem(this.getHtmlData(), 'data-guid');
            if (first_guid) {
                wvForm.setFormsInput('first_guid', first_guid);
                wvForm.setFormsInput('guid', guid);
                return first_guid;
            } else if (guid) {
                wvForm.setFormsInput('first_guid', guid);
                wvForm.setFormsInput('guid', guid);
                return guid;
            } else {
                return undefined;
            }
        },
        getAttrElem: function (elem, name) {
            return wvDOM.getAttributeElement(elem, name);
        },
        getHtmlData: function () {
            return wvParams.getHtmlData();
        }
    };

    var wvPhone = {
        // Подставляем код телефона
        addPhoneCode: function () {
            var mask = {
                init: function () {
                    var selects = wvPhone.getCountryElement('.country_select');
                    var phones = wvPhone.getPhoneElement('.wv_phone');

                    if (!selects || !phones) return null;

                    //выставляем дефолтный код
                    var countryCode = selects[ 0 ].value.toLowerCase();
                    var countryCodes = {
                        'at': '+43',
                        'be': '+32',
                        'ch': '+41',
                        'de': '+49',
                        'it': '+39',
                        'es': '+34',
                        'fi': '+358',
                        'lv': '+371',
                        'lt': '+370',
                        'ee': '+372',
                        'ro': '+40',
                        'bg': '+359',
                        'pl': '+48',
                        'gr': '+30',
                        'cy': '+357',
                        'hu': '+36',
                        'fr': '+33',
                        'cz': '+420',
                        'pt': '+351',
                        'pe': '+51',
                        'co': '+57',
                        'cl': '+56',
                        'gt': '+502',
                        'ru': '+7',
                    };

                    selects.forEach(function (select) {
                        select.addEventListener('change', function () {
                            countryCode = this.value;
                            selects.forEach(function (sel) {
                                sel.value = countryCode;
                            });
                        });
                    });

                    phones.forEach(function (phone) {
                        phone.pattern = '(\\+)[0-9]{11,16}';
                        phone.title = 'the phone must contain 11 to 17 digits only';

                        //при попадании фокуса оставляем код + введенную часть номера
                        phone.addEventListener('focusin', function () {
                            var code = countryCodes[ countryCode.toLowerCase() ];
                            this.value = !(this.value.length > code.length) ? code : this.value;
                        });

                        //при вводе блокируем удаление кода страны
                        phone.addEventListener('input', function () {
                            var code = countryCodes[ countryCode.toLowerCase() ];
                            this.value.indexOf(code) && (this.value = code);
                        });
                    });

                    return { selects: selects, phones: phones };
                }
            };
            return mask.init();
        },
        // Подставляем placeholders
        setPlaceholders: function () {
            var selects = this.getCountryElement('.country_select'); // Получаем все селекты
            var names = this.getNameElement('input[name="name"]'); // Получаем все инпуты с именем
            var phones = this.getPhoneElement('input[name="phone"]'); // Получаем все инпуты с телефоном
            var optionVal = '';

            if (!selects && !phones) return null;

            // Выставляем дефолтное значение плейсхолдеров
            window.onload = function () {
                // Убираем автозаполнение формы при нажатии кнопки возврата
                names.forEach(function (name) {
                    name.setAttribute('autocomplete', 'off');
                    name.value='';
                });
                phones.forEach(function (phone) {
                    phone.setAttribute('autocomplete', 'off');
                    phone.value='';
                });
                var defaultSelect = selects[ 0 ];
                if (defaultSelect) {
                    optionVal = defaultSelect.value; // Получаем текущее значение селекта
                    changePhonePlaceholder(optionVal);
                }
            };

            // Объект со всеми плейсхолдерами
            var phonesHolders = {
                at: 'mob:+43121234567',
                be: 'mob:+32121234567',
                ch: 'mob:+41121234567',
                de: 'mob:+49121234567',
                it: 'mob:+39121234567',
                es: 'mob:+34121234567',
                fi: 'mob:+35812123456',
                lv: 'mob:+37121234567',
                lt: 'mob:+37061234567',
                ee: 'mob:+37251234567',
                ro: 'mob:+40712345678',
                bg: 'mob:+35948123456',
                pl: 'mob:+48121234567',
                gr: 'mob:+306912345678',
                cy: 'mob:+35796123456',
                hu: 'mob:+36201234567',
                fr: 'mob:+33155430261',
                cz: 'mob:+420121234567',
                pt: 'mob:+351121234567',
                pe: 'mob:+51312345789',
                co: 'mob:+57425525856',
                cl: 'mob:+56012345678',
                gt: 'mob:+502601123456',
                ru: 'моб:+79999999999',
            };

            selects.forEach(function (select) { // Для каждого селекта вешаем обработчик
                select.addEventListener("change", function () {
                    optionVal = this.options[ this.selectedIndex ].value; // Получаем текущее значение селекта
                    selects.forEach(function (otherSelect) {
                        otherSelect.value = optionVal;
                    });
                    return changePhonePlaceholder(optionVal);// Меняем все инпуты phone
                });
            });

            // Функция смены всех инпутов с именем name
            function changePhonePlaceholder(optionVal) {
                return phones.forEach(function (phone) {
                    return phone.placeholder = phonesHolders[ optionVal.toLowerCase() ];
                });
            }
            return { selects: selects, phones: phones, names: names};
        },
        getPhoneElement: function (elem) {
            var selects = wvDOM.getElementAll(elem);
            return (selects.length) ? selects : 0;
        },
        getCountryElement: function (elem) {
            var phones = wvDOM.getElementAll(elem);
            return (phones.length) ? phones : 0;
        },
        getNameElement: function (elem) {
            var names = wvDOM.getElementAll(elem);
            return (names.length) ? names : 0;
        }

    };

    var wvName = {
        init: function () {
            var selects = wvPhone.getCountryElement('.country_select');
            var names = wvName.getNameElement('input[name="name"]');

            if (!selects || !names) return null;

            var countryCode = selects[0].value.toLowerCase();
            // Объект со всеми плейсхолдерами
            var countryValidationText = {
                at: 'Bitte verwenden Sie beim Ausfüllen dieses Formulars nur lateinische Buchstaben.',
                be: 'Veuillez n\'utiliser que des lettres latines pour remplir ce formulaire.',
                ch: 'Bitte verwenden Sie beim Ausfüllen dieses Formulars nur lateinische Buchstaben.',
                de: 'Bitte verwenden Sie beim Ausfüllen dieses Formulars nur lateinische Buchstaben.',
                it: 'Per favore, usa solo lettere latine durante la compilazione di questo modulo.',
                es: 'Por favor, utilice letras latinas.',
                fi: 'Käytä vain latinalaisia kirjaimia täyttäessäsi tätä lomaketta.',                
                pl: 'Prosimy o używanie tylko liter łacińskich podczas wypełniania tego formularza.',                
                fr: 'Veuillez n\'utiliser que des lettres latines pour remplir ce formulaire.',
                cz: 'Při vyplňování tohoto formuláře prosím používejte pouze latinská písmena.',
                pt: 'Por favor, use apenas letras latinas ao preencher este formulário.',
                pe: 'Por favor, utilice letras latinas.',
                co: 'Por favor, utilice letras latinas.',
                cl: 'Por favor, utilice letras latinas.',
                gt: 'Por favor, utilice letras latinas.',
                ro: 'Vă rugăm să utilizați numai litere latine când completați acest formular.',
                ru: 'Пожалуйста, используйте при заполнении этой формы только латинские буквы.',
            };
            var validationText = {
                at: 'Die Daten sind nicht korrekt.',
                be: 'Les données ne sont pas correctes.',
                ch: 'Die Daten sind nicht korrekt.',
                de: 'Die Daten sind nicht korrekt.',
                it: 'I dati non sono corretti.',
                es: 'Los datos no son correctos.',
                fi: 'Tiedot eivät ole oikein.',                
                pl: 'Dane nie są poprawne.',                
                fr: 'Les données ne sont pas correctes.',
                cz: 'Údaje nejsou správné.',
                pt: 'Os dados não estão corretos',
                pe: 'Los datos no son correctos.',
                co: 'Los datos no son correctos.',
                cl: 'Los datos no son correctos.',
                gt: 'Los datos no son correctos.',
                ro: 'Datele sunt incorecte.',
                ru: 'Данные не верны.',
            };

            names.forEach(function (name) {
                var placeholder = name.getAttribute('placeholder');
                name.addEventListener("input", function () {                    
                    if (name.value.trim() == '') {
                        name.value = '';
                        return name.placeholder = placeholder;
                    } else if (name.value.search(/^[a-zA-Zа-яёА-ЯЁ\u00C0-\u00ff\u00C6\u00D0\u018E\u018F\u0190\u0194\u0132\u014A\u0152\u1E9E\u00DE\u01F7\u021C\u00E6\u00F0\u01DD\u0259\u025B\u0263\u0133\u014B\u0153\u0138\u017F\u00DF\u00FE\u01BF\u021D\u0104\u0181\u00C7\u0110\u018A\u0118\u0126\u012E\u0198\u0141\u00D8\u01A0\u015E\u0218\u0162\u021A\u0166\u0172\u01AFY\u0328\u01B3\u0105\u0253\u00E7\u0111\u0257\u0119\u0127\u012F\u0199\u0142\u00F8\u01A1\u015F\u0219\u0163\u021B\u0167\u0173\u01B0y\u0328\u01B4\u00C1\u00C0\u00C2\u00C4\u01CD\u0102\u0100\u00C3\u00C5\u01FA\u0104\u00C6\u01FC\u01E2\u0181\u0106\u010A\u0108\u010C\u00C7\u010E\u1E0C\u0110\u018A\u00D0\u00C9\u00C8\u0116\u00CA\u00CB\u011A\u0114\u0112\u0118\u1EB8\u018E\u018F\u0190\u0120\u011C\u01E6\u011E\u0122\u0194\u00E1\u00E0\u00E2\u00E4\u01CE\u0103\u0101\u00E3\u00E5\u01FB\u0105\u00E6\u01FD\u01E3\u0253\u0107\u010B\u0109\u010D\u00E7\u010F\u1E0D\u0111\u0257\u00F0\u00E9\u00E8\u0117\u00EA\u00EB\u011B\u0115\u0113\u0119\u1EB9\u01DD\u0259\u025B\u0121\u011D\u01E7\u011F\u0123\u0263\u0124\u1E24\u0126I\u00CD\u00CC\u0130\u00CE\u00CF\u01CF\u012C\u012A\u0128\u012E\u1ECA\u0132\u0134\u0136\u0198\u0139\u013B\u0141\u013D\u013F\u02BCN\u0143N\u0308\u0147\u00D1\u0145\u014A\u00D3\u00D2\u00D4\u00D6\u01D1\u014E\u014C\u00D5\u0150\u1ECC\u00D8\u01FE\u01A0\u0152\u0125\u1E25\u0127\u0131\u00ED\u00ECi\u00EE\u00EF\u01D0\u012D\u012B\u0129\u012F\u1ECB\u0133\u0135\u0137\u0199\u0138\u013A\u013C\u0142\u013E\u0140\u0149\u0144n\u0308\u0148\u00F1\u0146\u014B\u00F3\u00F2\u00F4\u00F6\u01D2\u014F\u014D\u00F5\u0151\u1ECD\u00F8\u01FF\u01A1\u0153\u0154\u0158\u0156\u015A\u015C\u0160\u015E\u0218\u1E62\u1E9E\u0164\u0162\u1E6C\u0166\u00DE\u00DA\u00D9\u00DB\u00DC\u01D3\u016C\u016A\u0168\u0170\u016E\u0172\u1EE4\u01AF\u1E82\u1E80\u0174\u1E84\u01F7\u00DD\u1EF2\u0176\u0178\u0232\u1EF8\u01B3\u0179\u017B\u017D\u1E92\u0155\u0159\u0157\u017F\u015B\u015D\u0161\u015F\u0219\u1E63\u00DF\u0165\u0163\u1E6D\u0167\u00FE\u00FA\u00F9\u00FB\u00FC\u01D4\u016D\u016B\u0169\u0171\u016F\u0173\u1EE5\u01B0\u1E83\u1E81\u0175\u1E85\u01BF\u00FD\u1EF3\u0177\u00FF\u0233\u1EF9\u01B4\u017A\u017C\u017E\u1E93\s]+$/)) {
                        name.value = '';
                        return name.placeholder = validationText[countryCode];
                    } 
                    return;
                });
            });

            if(countryCode === 'cl'){
                names.forEach(function (name) {
                    name.addEventListener("input", function () {
                        if(name.value.match(/^[a-zA-Z\s]+$/)){
                            return true;
                        }else if (name.value.trim() == ''){
                            name.value = '';
                            return name.placeholder = validationText[countryCode];
                        } else {
                            name.value = '';
                            return name.placeholder = countryValidationText[countryCode];
                        }
                    });
                });
            }
        },
        getNameElement: function (elem) {
            var names = wvDOM.getElementAll(elem);
            return (names.length) ? names : 0;
        }
    }

    var wvPage = {
        init: function () {
            // Если это не лендинг
            if (wvParams.pageType !== 'landing') {
                var prelandId = wvDOM.getAttributeElement(wvParams.getHtmlData(), 'data-prelanding_id');
                wvParams.params = 'url=' + encodeURIComponent(wvParams.getUrl()) +
                    wvParams.set('&utm_source=', wvPageData.utm_source) +
                    wvParams.set('&utm_medium=', wvPageData.utm_medium) +
                    wvParams.set('&utm_campaign=', wvPageData.utm_campaign) +
                    wvParams.set('&utm_content=', wvPageData.utm_content) +
                    wvParams.set('&utm_term=', wvPageData.utm_term) +
                    wvParams.set('&referer=', encodeURIComponent(wvPage.getReferrer())) +
                    wvParams.set('&prelanding_id=', prelandId) +
                    wvParams.set('&offer_id=', wvParams.offerId) +
                    wvParams.set('&page_type=', wvParams.pageType);

                // Вызываем трекер и передаем в него известные параметры
                wvParams.tracker = wvPage.jsonp('//webvkrd.com/js.php?' + wvParams.params);

                // После получения лендинга из трекера, меняем ссылки на транзитке
                wvParams.tracker.addEventListener('load', function () {
                    var trackerData = {
                        land: wvParams.isReal(wvDOM.getAttributeElement(wvParams.getHtmlData(), 'data-landing_url')),
                        guid: wvParams.isReal(wvGuid.getGuid('guid')),
                        fguid: wvParams.isReal(wvGuid.getGuid('first_guid')),
                    };

                    wvParams.createdUrl = trackerData.land;
                    for (var key in wvPageData) {
                        if (wvParams.isReal(wvPageData[ key ])) {
                            wvParams.createdUrl += wvPage.getQuerySimbols(wvParams.createdUrl) + key + '=' + wvPageData[ key ];
                        }
                    }

                    wvParams.createdUrl += wvParams.set(wvPage.getQuerySimbols(wvParams.createdUrl) + 'referer=', encodeURIComponent(wvPage.getReferrer())) + wvParams.set(wvPage.getQuerySimbols(wvParams.createdUrl) + 'prelanding_id=', prelandId);
                    if (wvParams.pageType !== 'success') {
                        if (document.body.getAttribute('data-links') === 'change-only-wv') {
                            wvLink.changeFullLinksByClassName([ '.wv_link' ]);
                        } else {
                            wvLink.changeLinks();
                        }
                    }
                    wvGuid.setGuidsToCookie();
                });

                // Если это страница успешного заказа, ставим счетчики лендинга
                if (wvParams.pageType === 'success') {
                    wvGuid.setGuidsToInput();
                    wvForm.setFormsInput('lead_guid', wvParams.isReal(wvParams.get('lead_guid')));

                    // Landing webvork counters
                    wvParams.YmCounter = '89216789';
                    wvParams.GaCounter = 'UA-228753542-63';
                    wvMetric.add('GA', wvParams.GaCounter);
                    wvMetric.add('YM', wvParams.YmCounter);
                    wvMetric.add('TP');
                    wvForm.setParamsToInput();
                    wvParams.test = 'success page';
                } else {// Иначе ставим счетчики транзитки
                    // Prelanding webvork counters
                    wvParams.YmCounter = '89216789';
                    wvParams.GaCounter = 'UA-228753542-63';
                    wvMetric.add('GA', wvParams.GaCounter);
                    wvMetric.add('YM', wvParams.YmCounter);
                    wvMetric.add('TP');
                    wvParams.test = 'not landing page';
                }

                wvMetric.metricsHandler(function () {
                    wvParams.params =
                        wvParams.set('c_ym_uid=', wvCookie.get('_ym_uid')) +
                        wvParams.set('&c_ga=', wvCookie.get('_ga')) +
                        wvParams.set('&guid=', wvGuid.getGuid('guid')) +
                        wvParams.set('&first_guid=', wvGuid.getGuid('first_guid'));
                    wvPage.jsonp('//webvkrd.com/js.php?' + wvParams.params);
                });

                // Если есть поток, то ставим куки
                if (wvParams.get('utm_source') !== null) {
                    wvCookie.setParamsToCookie();
                }
                // Если это лендинг
            } else {
                var landId = wvDOM.getAttributeElement(wvParams.getHtmlData(), 'data-landing_id');
                // Landing webvork counters
                wvParams.YmCounter = '89216789';
                wvParams.GaCounter = 'UA-228753542-63';
                wvMetric.add('GA', wvParams.GaCounter);
                wvMetric.add('YM', wvParams.YmCounter);
                wvMetric.add('TP');
                wvParams.test = 'landing page';

                wvParams.params = 'url=' + encodeURIComponent(wvParams.getUrl()) +
                    wvParams.set('&utm_source=', wvPageData.utm_source) +
                    wvParams.set('&utm_medium=', wvPageData.utm_medium) +
                    wvParams.set('&utm_campaign=', wvPageData.utm_campaign) +
                    wvParams.set('&utm_content=', wvPageData.utm_content) +
                    wvParams.set('&utm_term=', wvPageData.utm_term) +
                    wvParams.set('&referer=', encodeURIComponent(wvPage.getReferrer())) +
                    wvParams.set('&landing_id=', landId) +
                    wvParams.set('&offer_id=', wvParams.offerId) +
                    wvParams.set('&page_type=', wvParams.pageType);
                // Запрашиваем трекер с передачей параметров
                wvParams.tracker = wvPage.jsonp('//webvkrd.com/js.php?' + wvParams.params);

                wvMetric.metricsHandler(function () {
                    wvParams.params =
                        wvParams.set('c_ym_uid=', wvCookie.get('_ym_uid')) +
                        wvParams.set('&c_ga=', wvCookie.get('_ga')) +
                        wvParams.set('&guid=', wvGuid.getGuid('guid')) +
                        wvParams.set('&first_guid=', wvGuid.getGuid('first_guid'));
                    wvPage.jsonp('//webvkrd.com/js.php?' + wvParams.params);
                    wvGuid.setGuidsToCookie();
                    wvGuid.setGuidsToInput();
                });

                wvForm.setParamsToInput();
                wvCookie.setParamsToCookie();
                if (wvParams.get('utm_source')) {
                    wvCookie.set('c_uri', document.location, 1);
                    wvCookie.set('c_referer', wvPage.getReferrer(), 1);
                }

                // Добавляем параметры у многратраничных сайтов
                wvLink.changeLinksByClassName([ '.wv_formpay', '.wv_params' ]);

            }
            return wvParams;
        },
        getQuerySimbols: function (url) {
            return url.includes('?') ? '&' : '?';
        },
        getReferrer: function () {
            switch (wvParams.pageType) {
                case 'prelanding':
                    return wvPage.getRef();

                case 'landing':
                    var utmSource = wvParams.get('utm_source');
                    var paramReferer = wvParams.get('referer');
                    var cookieReferer = wvCookie.get('c_referer');
                    var currentReferer = wvPage.getRef();

                    if (paramReferer) {
                        return paramReferer;
                    }

                    // На рефералке нужно брать всегда новый рефрер если есть поток
                    if (wvParams.offerId === '13' && utmSource) {
                        return currentReferer;
                    }

                    if (wvParams.offerId === '13' && !utmSource && !!cookieReferer) {
                        return currentReferer;
                    }

                    if (wvParams.offerId === '13' && !utmSource && cookieReferer) {
                        return cookieReferer;
                    }
                    //-------------------------------------------------------------

                    if (utmSource && !!cookieReferer) {
                        return currentReferer;
                    }

                    if (utmSource && !currentReferer) {
                        return cookieReferer;
                    }

                    if (cookieReferer) {
                        return cookieReferer;
                    }

                    return currentReferer;

                case 'success':
                    return wvCookie.get('c_referer');
            }
        },
        getRef: function () {
            return document.referrer;
        },
        // Функция асинхронного вызова
        jsonp: function (url, callback) {
            if (!url) return null;
            var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            window[ callbackName ] = function (data) {
                delete window[ callbackName ];
                document.body.removeChild(scriptJSONP);
                callback(data);
            };

            var scriptJSONP = document.createElement('script');
            scriptJSONP.src = url + wvPage.getQuerySimbols(url) + 'callback=' + callbackName;
            scriptJSONP.async = false;
            document.body.appendChild(scriptJSONP);
            return scriptJSONP;
        }
    };

    var wvModules = {
        mod: [
            {
                param: 'testwv',
                path: '/webvorkcom/js/modules/testlanding/wvtests.js',
            },
            {
                param: 'cbwv',
                path: '/webvorkcom/js/modules/comebacker/comeback.js',
            },
            {
                param: 'fpwv',
                path: '/webvorkcom/js/modules/fakepay/fakepay.js',
            },
            // {
            //   path: '/webvorkcom/js/modules/phonemask/wvmask.js',
            // },
            // {
            //     path: '/webvorkcom/js/modules/validation/wvvalid.js',
            // },
        ],
        // Запуск модулей
        init: function () {
            return this.mod.map(function (el) {
                // Включаем модуль если есть кука или параметр
                if (el.param) {
                    if (wvParams.isExist(el.param)) {
                        return wvModules.appendModule(el.path);
                    } else {
                        return '';
                    }
                }
            })
        },
        // Добавление модуля в дом
        appendModule: function (modulePath) {
            var module = document.createElement('script');
            module.type = 'text/javascript';
            module.src = modulePath;
            document.body.appendChild(module);
        },
    };

    // Устанавливаем параметры
    wvParams.offerId = wvDOM.getAttributeElement(wvParams.getHtmlData(), 'data-offer_id');
    wvParams.pageType = wvDOM.getAttributeElement(wvParams.getHtmlData(), 'data-page_type');

    // Ставим счетчики вебмастера
    wvMetric.set(wvPageData.ym, wvPageData.ga, wvPageData.fb, wvPageData.fb2, wvPageData.tt, wvPageData.allTiktok, wvParams.pageType);
    wvCookie.set('c_referer', wvPage.getReferrer(), 1);

    // Заполняем параметры
    wvPage.init();

    // Подключение модулей через параметры
    wvModules.init();

    // Подставляем код номера телефона и placeholder
    wvPhone.addPhoneCode();
    wvPhone.setPlaceholders();

    // Валидируем имя для Чилийских лендингов
    wvName.init();

    // Изменяем время существования cookies
    setTimeout(function(){
        wvCookie.updateExpireDate();
    },1600);


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = {
            wvDOM,
            wvParams,
            wvCookie,
            wvMetric,
            wvForm,
            wvLink,
            wvGuid,
            wvPhone,
            wvName,
            wvPage,
            wvModules,
            wvPageData,
        };
    }
})();
