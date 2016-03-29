
var LAST_REFERRER_URL_COOKIE_NAME = 'lastReferrerUrl';

var LAST_PAGE_URL_COOKIE_NAME = 'lastPageUrl';

function isLastPage(url) {
    return url == $.cookie(LAST_PAGE_URL_COOKIE_NAME);
}

function setLastPage(url) {
    $.cookie(LAST_PAGE_URL_COOKIE_NAME, url);
}

function isLastReferrer(url) {
    return url == $.cookie(LAST_REFERRER_URL_COOKIE_NAME);
}

function setLastReferrer(url) {
    $.cookie(LAST_REFERRER_URL_COOKIE_NAME, url);
}

function isReferredFromCurrentDomain() {
    var ref = '';
    if (document.referrer) {
        var url = document.referrer;
        ref = url.match(/:\/\/(.[^/]+)/)[1];
    }
    return document.domain == ref;
}

$(function() {
    if (!isReferredFromCurrentDomain() && !isLastReferrer(document.URL) && !isLastPage(document.URL)) {
        removeCookieForAutoSelection();
    }
    setLastReferrer(document.referrer);
    setLastPage(document.URL);
});

/* start top_nav_pane.jsp */

$(function() {
    if (null != $('#stickyNavigation').offset()) {
        // grab the initial top offset of the navigation
        var sticky_navigation_offset_top = $('#stickyNavigation').offset().top;
        // our function that decides weather the navigation bar should have "fixed" css position or not.
        var sticky_navigation = function () {
            var scroll_top = $(window).scrollTop(); // our current vertical position from the top
            // if we've scrolled more than the navigation, change its position to fixed to stick to top,
            // otherwise change it back to relative
            var screenWidth = document.body.clientWidth;
            var stickyNavigation = $('#stickyNavigation');
            if (screenWidth > 1300) {
                if (scroll_top > sticky_navigation_offset_top) {
                    stickyNavigation.css({ 'position': 'fixed', 'top': 0, 'left': 0 });
                } else {
                    stickyNavigation.css({ 'position': 'relative' });
                }
            } else {
                stickyNavigation.css({'position': 'static'});
            }
        };
        // run our function on load
        sticky_navigation();
        // and run it again every time you scroll
        $(document).scroll(function () {
            sticky_navigation();
        });
    }
});

/* end top_nav_pane.jsp */

/* start market_action_list_script_box.jsp */

$(function() {
    var expanderClass, ids, ninjaShow, onExpanderClick, onHeaderClick, onSubFilterLinkClick, teaserImgClass, teaserWrapperClass;
    teaserWrapperClass = '.galleryMarketActionItem';
    teaserImgClass = '.marketActionItemImg';
    expanderClass = '.expander';
    /*
     Solving trouble with duplicate ids
     */
    ids = [];
    $(teaserWrapperClass).each(function(i) {
        if ($.inArray(this.id, ids) !== -1) this.id += '-dup' + i;
        return ids.push(this.id);
    });
    /*
     Expand/Collapse/Filter through subcategories
     */
    ninjaShow = function(e) {
        var img, ninjaStyle;
        img = $(e).children('.marketActionItem').children(teaserImgClass);
        ninjaStyle = img.attr('data-style');
        if (ninjaStyle) {
            img.attr('style', ninjaStyle);
            img.removeAttr('data-style');
        }
        return $(e).show();
    };
    onSubFilterLinkClick = function() {
        var catBox, href, isBottom, teasers, visibleCount, subcategoryOID;
        isBottom = $(this).parent().hasClass('bottom');
        catBox = $(this).parent().parent();
        if ($(this).hasClass('supplier')) {
            isBottom = $(this).parent().parent().parent().hasClass('bottom');
            catBox = $(this).parent().parent().parent().parent();
        }
        href = $(this).attr('id');
        subcategoryOID = $(this).attr('data-subcategoryoid');
        teasers = $(catBox).children('.content').children(teaserWrapperClass);
        if (!$(this).hasClass('active')) {
            if (!$(this).hasClass('all')) {
                $(catBox).attr('data-filter', href);
                $(catBox).addClass('expanded');
                $(catBox).children(expanderClass).children('a').text('Свернуть▲');
                $(teasers).each(function() {
                    if ($(this).hasClass(href)) {
                        return ninjaShow(this);
                    } else {
                        return $(this).hide();
                    }
                });
                $(catBox).children('.subCategories').find('a').each(function() {
                    if ($(this).attr('id') === href && $(this).attr('data-subcategoryoid') === subcategoryOID) {
                        return $(this).addClass('active');
                    } else {
                        return $(this).removeClass('active');
                    }
                });
                if (isBottom) window.location.hash = $(catBox).attr('id');
            } else {
                $(teasers).each(function() {
                    return ninjaShow(this);
                });
                $(catBox).removeAttr('data-filter');
                $(catBox).children('.subCategories').find('a').each(function() {
                    return $(this).removeClass('active');
                });
                $(this).addClass('active');
            }
        } else {
            $('#' + catBox.attr('id') + ' .expander a').click();
        }
        visibleCount = teasers.not(':hidden').length;
        if (visibleCount >= 9) {
            $(catBox).children('.subCategories.bottom').show();
        } else {
            $(catBox).children('.subCategories.bottom').hide();
        }
        return false;
    };
    onExpanderClick = function() {
        var catBox, filterString, href, showCollapsedCount, showCount, teasers;
        showCollapsedCount = 3;
        href = $(this).attr('id');
        catBox = $(href);
        showCount = $(catBox).attr('data-show-count');
        if (showCount) showCollapsedCount = parseInt(showCount);
        teasers = $(catBox).children('.content').children(teaserWrapperClass);
        filterString = '';
        if ($(catBox).attr('data-filter')) {
            filterString = '.' + $(catBox).attr('data-filter');
        }
        $(catBox).toggleClass('expanded');
        if ($(catBox).hasClass('expanded')) {
            $(catBox).children(expanderClass).children('a').text('Свернуть▲');
            $(teasers).filter(filterString + ':hidden').each(function() {
                return ninjaShow(this);
            });
            if (teasers.length >= 9) $(catBox).children('.subCategories.bottom').show();
            return false;
        } else {
            $(catBox).children(expanderClass).children('a').text('Развернуть▼');
            $(teasers).filter(filterString + ':visible').each(function(i) {
                if (i >= showCollapsedCount) return $(this).hide();
            });
            $(catBox).children('.subCategories.bottom').hide();
            return true;
        }
    };
    onHeaderClick = function() {
        var catBoxId;
        catBoxId = $(this).attr('id');
        if ($(catBoxId).attr('data-filter')) {
            $(catBoxId + ' .subCategories a.active').first().click();
        }
        $(catBoxId + ' .expander a').click();
        return false;
    };
    $('.categoryBox .subCategories a').click(onSubFilterLinkClick);
    $('.categoryBox h1 a').click(onHeaderClick);
    return $(expanderClass + ' a').click(onExpanderClick);
});


if (window.currentViewBoxSelector == undefined){
    window.currentViewBoxSelector = 'none';
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; ++i) {
        var c = $.trim(ca[i]);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

var IS_SELECTED_SUBCATEGORY_ID_PREFIX = 'cat';

var IS_CATEGORY_OPEN_COOKIE_NAME_PREFIX = 'isCatOpen';

var SELECTED_SUB_CATEGORY_COOKIE_NAME_PREFIX = 'selectedSubCatFor';

var isAutomaticSelectCategories = false;

var isUserExpand = true;

var autoClick = true;

function removeCookieForAutoSelection() {
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; ++i) {
        var c = $.trim(ca[i]);
        if (c.indexOf(IS_SELECTED_SUBCATEGORY_ID_PREFIX) == 0 ||
            c.indexOf(IS_CATEGORY_OPEN_COOKIE_NAME_PREFIX) == 0 || c.indexOf('selectedSubCatFor') == 0) {
            document.cookie = c + ';path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
    }
}

$(function() {
    $('.subCategories a').each(function() {
        if ('true' === getCookie($(this).attr('id')) && 'all' !== getCookie($(this).attr('class'))) {
            isAutomaticSelectCategories = true;
            autoClick = true;
            $(this).click();
            isAutomaticSelectCategories = false;
            autoClick = false;
        }
    });
    $('.expanderBox > span > .more').each(function() {
        isUserExpand = false;
        autoClick = true;
        $(this).click();
        isUserExpand = true;
        autoClick = false;
    });
});

var scrollAndOpenCategory = function (categoryOID, parentCategoryOID, cityOID) {
    var parent = $('#categoryBox' + categoryOID).offset() == null;
    var categoryBoxID;
    categoryBoxID = 'categoryBox' + (parent ? parentCategoryOID : categoryOID);
    scrollToCategory(categoryBoxID);
    var subcategoryBtn = $('[data-subcategoryoid='+categoryOID+']');
    if (parentCategoryOID != 0) {
        subcategoryBtn.click();
    } else {
        $('#categoryBox' + categoryOID + ' > all').click();
    }
};

var scrollToCategory = function(categoryBoxID) {
    var headerWidth = 65;
    var categoryPos = $('#' + categoryBoxID).offset().top;
    $('html, body').animate({scrollTop: categoryPos - headerWidth}, 500);
};

/* end market_action_list_script_box.jsp */

$(function() {
    initClassesForDevices();
    initSendMessagesToPartnersForm();
    initLoginForm();
    initLazyload();
});

function initLazyload() {
    $('.lazy:visible').lazyload({
        threshold: 800,
        load: function () {
            $(this).removeClass("lazy");
        }
    });

    $('.stock-group-item .lazy:visible').lazyload({
        threshold: 800,
        load: function () {
            $(this).removeClass("lazy");
        }
    });
}

function initLoginForm() {
    var clickableCity = $(".clickable");
    $("#citiesList").hide();
    $("#selectDiv").bind('click', function() {
        $("#citiesList").slideToggle();
    });

    clickableCity.bind('click', function() {
        var value = $(this).text();
        var selectDiv = $("#selectDiv");
        $("#selectedCityInput").val(value);
        selectDiv.empty();
        selectDiv.text(value);
        $("#citiesList").slideToggle();

        $("#selectedOption").val(value);
    });

    clickableCity.bind("mouseenter mouseleave", function(e){
        $(this).toggleClass("over");
    });
}

function initClassesForDevices() {
    if (!("ontouchstart" in document.documentElement)) {
        document.documentElement.className += " no-touch";
    }
}

function initSendMessagesToPartnersForm() {
    var isCategoriesContainerOpen = false;
    $('#displayCategoryForSelectionButton').on('click', function() {
        if (isCategoriesContainerOpen) {
            $('#useOnlySelectedCategories').val('false');
            $('#displayCategoryForSelectionButton').text('Отправить письма только по определённым категориям');
            $('#categoriesForSelectionContainer').hide(1000);
        } else {
            $('#useOnlySelectedCategories').val('true');
            $('#displayCategoryForSelectionButton').text('Отправить письма по всем категориям');
            $('#categoriesForSelectionContainer').show(1000);
        }
        isCategoriesContainerOpen = !isCategoriesContainerOpen;
    });
}

function sendUserPassword(url, id) {
    $(document.body).css({cursor:'wait'});
    url = url + "&popupId="+ id + "&email=" + document.getElementById("lost_password_email").value;
    $.post(url, null, function(data) {
        $("#"+id).html(data);
        $(document.body).css({cursor:'default'});
    }, "html");
}

var createdMaps = {};

var openedMaps = {};

function toggleCategoryMap(categoryOID) {
    var map = $('#stock-group-map' + categoryOID);
    if (true === openedMaps[categoryOID]) {
        map.removeClass('stock-group-map--opened');
        openedMaps[categoryOID] = false;
    } else {
        map.addClass('stock-group-map--opened');
        showCategoryMap(categoryOID);
        openedMaps[categoryOID] = true;
    }
}

function updateMapForCategory(categoryOID, subcategoryOID) {
    if (createdMaps[categoryOID] != undefined) {
        fetchMarketActions(subcategoryOID, function(data) {
            var marketActions = JSON.parse(data);
            ymaps.ready(function() {
                var categoryMap = createdMaps[categoryOID];
                removeGeoObjects(categoryMap);
                addObjectsToMap(categoryMap, marketActions);
            });
        });
    }
}

function getSelectedSubcategoryOID(categoryOID) {
    var selectedSubcategoryOID = categoryOID;
    var selectedSubcategory = $('#categoryBox' + categoryOID + ' .subCategories a.active');
    if (selectedSubcategory != undefined) {
        if (selectedSubcategory.attr('data-subcategoryoid') != undefined) {
            selectedSubcategoryOID = parseInt(selectedSubcategory.attr('data-subcategoryoid'));
        }
    }
    return selectedSubcategoryOID;
}

function addObjectsToMap(categoryMap, marketActions) {
    for (var marketActionIndex = 0; marketActionIndex < marketActions.length; ++marketActionIndex) {
        var marketAction = marketActions[marketActionIndex];
        var longMarkerDescription = marketAction['longMarkerDescription'];
        var geoLocationInfos = marketAction['geoLocationInfos'];
        for (var infoIndex = 0; infoIndex < geoLocationInfos.length; ++infoIndex) {
            var geoLocationInfo = geoLocationInfos[infoIndex];
            categoryMap.geoObjects.add(
                new ymaps.Placemark([geoLocationInfo['latitude'], geoLocationInfo['longitude']], {
                    hintContent: geoLocationInfo['markerAnnotation'],
                    balloonContent: longMarkerDescription
                })
            );
        }
    }
}

function removeGeoObjects(categoryMap) {
    categoryMap.geoObjects.each(function(geoObject) {
        categoryMap.geoObjects.remove(geoObject);
    });
}

function isNumeric(input) {
    return (input - 0) == input && (''+input).replace(/^\s+|\s+$/g, "").length > 0;
}

function loadComments(marketActionOID, lastOID) {
    var link = '/comments/load';
    var newCommentsButtons = $('#newCommentsButtons');
    var afterCommentsBlock = $('#afterCommentsBlock');
    newCommentsButtons.removeClass('button button-small');
    newCommentsButtons.css('visibility', 'hidden');
    afterCommentsBlock.activity({
        segments: 12,
        width: 5.5,
        space: 6,
        length: 13,
        color: '#252525',
        speed: 1.5
    });
    $.ajax({
        url: link,
        method: "POST",
        success: function (commentsHtml) {
            sleep(1000, function () {
                afterCommentsBlock.activity(false);
                var $commentsHtml = $(commentsHtml);
                $commentsHtml.find('.voteComment').each(function () {
                    $(this).html($(this).html().linkify());
                });
                $commentsHtml.find('.adminComment').each(function () {
                    $(this).html($(this).html().linkify());
                });
                if (lastOID === 0) {
                    $('.userVotes').html($commentsHtml);
                } else {
                    afterCommentsBlock.replaceWith($commentsHtml);
                }
                initTooltip();
            });
        },
        data: {
            marketActionOID: marketActionOID,
            lastCommentOID: lastOID,
            count: 10
        }
    });
}

function sleep(millis, callback) {
    setTimeout(function() { callback(); }, millis);
}

function appendSlider() {
    var scrollPane = $( ".scroll-pane" );
    var scrollContent = $( ".scroll-content" );
    var scrollBar = $('.scroll-bar');
    scrollBar.css({'width':'9px','height':'20px','top':'20px'});
    if (scrollContent.height() > scrollPane.height() && scrollContent.height() > 150) {
        scrollBar.slider({
            orientation: "vertical",
            value:100,
            slide: function (event, ui) {
                resetPositions(event, ui, scrollContent, scrollPane);
            }
        });
        scrollPane.height(75);
        scrollPane.css({'marginTop':'30px', 'marginBottom':'10px'});
    } else {
        scrollBar.css('display', 'none');
        scrollPane.height(scrollContent.height());
        scrollPane.css({'marginTop':'0','marginBottom':'0'});
    }
    $('.ui-slider-handle').css({'width':'4px', 'height':'50px', 'background':'#5695FF','borderRadius':'0px','border':'none', 'cursor':'pointer'});
    scrollContent.css({'fontSize':'17px'});
}

function resetPositions(event, ui, scrollContent, scrollPane) {
    if ( scrollContent.height() > scrollPane.height() ) {
        scrollContent.css( "margin-top", Math.round(
            -(1 - ui.value / 100) * ( scrollContent.height() - scrollPane.height())
        ) + "px" );
    } else {
        scrollContent.css( "margin-top", 0 );
    }
}

function updatePanel(data) {
    var panel = $('.scroll-pane');
    if(panel.length > 0) {
        panel.empty();
        panel.height(0);
        panel.append('<div class="scroll-content" id="categoryDescriptionId" ></div><div class="scroll-bar"></div>');
    } else {
        $('<div class="scroll-pane"></div>').insertBefore('.subCategories');
        panel = $('.scroll-pane');
        panel.append('<div class="scroll-content" id="categoryDescriptionId" ></div><div class="scroll-bar"></div>');
    }
    var json = JSON.parse(data);
    $('.scroll-content').append(json.description);
    appendSlider();
}

function checkDescriptionPanelHeight() {
    var scrollPane = $('.scroll-pane');
    var scrollContent = $('.scroll-content');
    if (scrollPane.length > 0 && scrollContent.length > 0) {
        if (scrollContent.children().length == 0) {
            scrollPane.css({'marginBottom':0,'marginTop':0});
        }
    }
}

function showSendAddMessageForm() {
    $.ajax({
        url: 'http://' + window.location.hostname + '/znijki/div/common/tiles/boxes/popups/popup_add_market_action.jsp',
        method: 'GET'
    }).done(function(data) {
        $('#sendAddMarketActionBox').html(data);
        showDialog('sendAddMarketActionBox', 810, 'auto', false, false, 'center', true);
    });
}

function showSendSaleForm() {
    $.ajax({
        url: 'http://' + window.location.hostname + '/znijki/div/common/tiles/boxes/popups/popup_send_sale_form.jsp',
        method: 'GET'
    }).done(function(data) {
        $('#sendSaleBox').html(data);
        $('#sendSaleBox').dialog({
            width: 810,
            height: 'auto',
            resizable: false,
            draggable: false,
            position: 'center',
            modal: true,
            close: function() {
                $('#saleBegin').datepicker('hide');
                $('#saleEnd').datepicker('hide');
            }
        });
        $('#sendSaleBox').dialog('open');
    });
}

function changeSaleToMarketActionWindow() {
    $.ajax({
        url: 'http://' + window.location.hostname + '/znijki/div/common/tiles/boxes/popups/popup_add_market_action.jsp',
        method: 'GET'
    }).done(function(data) {
        $('#sendAddMarketActionBox').html(data);
        showDialog('sendAddMarketActionBox', 810, 'auto', false, false, 'center', true);
        closeDialog('sendSaleBox');
    });
}

function showSendMessageToDirectorWindow(voteOID) {
    $('#sendMessageToDirectorWindow' + voteOID).modal();
}
