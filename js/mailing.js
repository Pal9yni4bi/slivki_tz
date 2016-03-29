
$(function() {
    var campaignJspUrl, extractId, getMailingListHtml, getUrl, replaceUrl, resumeState, toHideElements, toRemoveElements,mainId;
    toRemoveElements = '.saleListBox, #mailingCreateButton, .noItemsBox, .marketActionTopInfo, .worksheetHeaderCategory, .marketActionItemDiscount';
    toHideElements = '#mailingCreateButton, #topNavigation';
    window.mainID=-1;
    window.mlSelected = 0;
    getUrl = function() {
        var url;
        url = 'http://' + window.location.hostname;
        if (window.location.port) url += ':' + window.location.port;
        return url;
    };
    campaignJspUrl = getUrl() + '/znijki/div/admin/mailing/campaign.jsp';
    replaceUrl = function(id) {
        return window.history.pushState({}, "", campaignJspUrl + '?cid=' + window.mlId);
    };
    resumeState = function() {
        var action, actionId, actions, catId, selector, _results;
        ($('#MLtitleInput')).val(window.mlName);
        actions = window.mlData.split(' ');
        _results = [];
        while (actions.length > 0) {
            action = actions.splice(0, 2);
            actionId = action[0];
            catId = action[1];
            selector = '#categoryBox' + catId + ' [id^="action' + actionId + '"] .marketActionCheckBox';
            _results.push($(selector).mousedown().click());
        }
        return _results;
    };
    extractId = function(str) {
        if (this.rx == null) this.rx = /(\d+)/;
        return parseInt(str.match(this.rx)[0]);
    };
    getMailingListHtml = function(previewUrl, data, isSitePreview, callback) {
        data['isSitePreview'] = isSitePreview;
        return $.ajax({
            type: "POST",
            url: previewUrl,
            data: data,
            success: function(html) {
                if (isSitePreview) {
                    window.siteHtml = html;
                } else {
                    window.emailHtml = html;
                }
                if (window.siteHtml && window.emailHtml) callback();
            }
        });
    };
    ($('#mailingCreateButton')).click(function() {
        ($('body')).prepend('<div id="MLheaderContainer">\
      <div id="MLheader">\
        <h1>Создание рассылки</h1>\
        <label for="MLtitleInput">Название:</label>\
        <input id="MLtitleInput"/>\
        <span id="MLselectedText">Выбрано акций: </span>\
        <span id="MLselected">0</span>\
        <a href="#" id="MLpreview">Предпросмотр</a>\
        <a href="#" id="MLclose">[x]</a>\
      </div>\
    </div>');
        ($(toHideElements)).hide();
        ($(toRemoveElements)).remove();
        ($('#mainContent')).css('padding-top', 0);
        ($('.categoryBox:first')).css('padding-top', '20px');
        ($('.subCategories a.all')).click();
        ($('.categoryBox:not(.expanded)')).find('.expander a').click();
        var firstChecked=false;
        ($('.categoryBox')).each(function() {
            var $this, categoryId;
            $this = $(this);
            categoryId = extractId($this.attr('id'));
            $this.find('.mailing-banner').has('.jpg').each(function() {
                var banner = $(this);
                var hash = banner.attr('id');
                var id = extractId(hash);
                banner.prepend('<input type="checkbox" style="float:left" name="mainBanner" data-category-id="' + categoryId + '" value="' + id + '" checked/>');
            });
            return $this.find('.stock-group-item').each(function() {
                var hash, id;
                $this = $(this);
                hash = $this.attr('id');
                id = extractId(hash);
                $this.find('a.title').attr('onclick', function() {
                    return false;
                });
                if(firstChecked==false) {
                    firstChecked=true;
                    window.mainActionId = id;
                    $this.prepend('<input type="checkbox" class="marketActionCheckBox" data-category-id="' + categoryId + '" data-id="' + id + '" />'+
                    '<input type="checkbox" style="float:left" name="mainTeaser" class="marketActionRadio" data-category-id="' + categoryId + '" value="' + id + '" checked/>');
                }
                else{
                    $this.prepend('<input type="checkbox" class="marketActionCheckBox" data-category-id="' + categoryId + '" data-id="' + id + '" />'+
                    '<input type="checkbox" style="float:left" name="mainTeaser" class="marketActionRadio" data-category-id="' + categoryId + '" value="' + id + '"/>');
                }
            });
        });
        $('input:radio[name="mainTeaser"]').on('change', function() {
            window.mainActionId = $(this).val();
        });
        ($('.marketActionCheckBox')).on("mousedown", function(event) {
            if (($(this)).is(':checked')) {
                window.mlSelected--;
            } else {
                window.mlSelected++;
            }
            ($('#MLselected')).text(window.mlSelected);
            if (window.mlSelected > 0) {
                return ($('#MLpreview')).css('color', '#FF9933');
            } else {
                return ($('#MLpreview')).css('color', '#555');
            }
        });
        $('.marketActionItemImg a').click(function() {
            ($(this)).parents('.marketActionItem').siblings('.marketActionCheckBox').mousedown().click();
            return false;
        });
        if (window.mlAutoload) {
            resumeState();
        } else {
            $.ajax({
                type: 'POST',
                url: campaignJspUrl,
                data: {
                    'action': 'new'
                },
                success: function(data) {
                    window.mlId = parseInt(data);
                    setTimeout(replaceUrl, 500);
                }
            });
        }
        ($('#MLpreview')).click(function() {
            var $checkboxes, data, marketActionsParam, prevCat, previewUrl, showPreviewPopup;
            data = {};
            window.mainID=$('input:checkbox[name=mainTeaser]:checked:first').val();
            window.mainBannerCategoryID = $('input:radio[name=mainBanner]:checked').val();
            $checkboxes = $('.marketActionCheckBox:checked');
            if ($checkboxes.length > 0) {
                marketActionsParam = '';
                prevCat = '';
                $checkboxes.each(function(i) {
                    var catId, id;
                    if (i !== 0) marketActionsParam += ' ';
                    id = ($(this)).attr('data-id');
                    catId = ($(this)).attr('data-category-id');
                    return marketActionsParam += id + ' ' + catId;
                });
                var salesCheckBoxes = $('.saleCheckBox:checked');
                var listOIDs = '';
                salesCheckBoxes.each(function () {
                    listOIDs += $(this).attr('data-id') + " ";
                });
                previewUrl = getUrl() + '/znijki/div/admin/mailing/preview.jsp';
                window.mlData = marketActionsParam;
                data['cid'] = window.mlId;
                data['mlData'] = marketActionsParam;
                data['title'] = ($('#MLtitleInput')).val();
                data['mainTeaserId'] = window.mainID;
                data['mainBannerCategoryId'] = window.mainBannerCategoryID;
                data['saleOIDs'] = listOIDs;
                showPreviewPopup = function() {
                    $('#MLresult').html('<div id="MLpreviewHeader"><a href="#" id="MLsave">Сохранить</a></div>' + window.emailHtml);
                    showDialog('MLresult', 1000, 'auto', false, false, 'left top', true);
                    $('body').css('background-color', '#EDEDED');
                    $('#ui-id-2').html($('#MLpreviewHeader').html());
                    $('#MLpreviewHeader').remove();
                    return ($('#MLsave')).click(function() {
                        if (confirm('Вы уверены?')) {
                            return $.ajax({
                                type: 'POST',
                                url: getUrl() + '/znijki/div/admin/mailing/create.jsp',
                                data: {
                                    "campaignId": window.mlId,
                                    "siteHtml": window.siteHtml,
                                    "emailHtml": window.emailHtml
                                },
                                success: function(html) {
                                    return ($('body')).append(html);
                                }
                            });
                        }
                    });
                };
                getMailingListHtml(previewUrl, data, true, showPreviewPopup);
                return getMailingListHtml(previewUrl, data, false, showPreviewPopup);
            }
        });
        return ($('#MLclose')).click(function() {
            return window.location.assign(getUrl() + '/znijki/index.jsp');
        });
    });
    if (window.mlAutoload) return ($('#mailingCreateButton')).click();
});
