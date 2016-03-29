var backFromMarket = $.cookie("market");
var isPageProfile = false;
var isSearchFieldChanged = false;
var restoreState = false;
var sideBar = null;

var JcropAPI = null;
$(function () {
    // open tab by hash
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $( document ).on( "click", ".likes-box a", function() {
        var button = $(this);
        var likes = parseInt(button.text());
        var commentID = button.parent().data('oid');
        var vote = 1;
        if(button.hasClass('dislike-button')) {
            vote = 0;
        }
        var url = '/comments/add_like/' + commentID;
        $.ajax({
            method: "POST",
            url: url,
            data: { vote : vote}
        }).done(function( data ) {
            data = JSON.parse(data);
            if('error' in data) {
                var title = 'Нравиться этот комментарий?';
                if(vote == 0) {
                    title = 'Не нравиться этот комментарий?';
                }
                $('#modalAlert .modal-title').html(title);
                $('#modalAlert .message').html('Войдите, чтобы мы могли учесть Ваше мнение!');
                $('#modalAlert').modal('show');
            } else {
                var likes = data['likesAmount'];
                button.parent().find('.like-button').text(data['likesAmount']);
                button.parent().find('.dislike-button').text(data['dislikesAmount']);
            }
        });
        return false;
    });

    $( document ).on( "click", "#profile-form-submit", function() {
        $("#profile-form").submit();
        return false;
    });

    $( document ).on( "submit", "#profile-form", function() {
        $.ajax({
            method: "POST",
            url: '/ajax_profile_save',
            data: $('#profile-form').serialize()
        }).done(function( data ) {
            data = JSON.parse(data);
            if(data['error'] != '') {
                $('#modalAlert .modal-title').html('Произошла ошибка');
                $('#modalAlert .message').html(data['error']);
                $('#modalAlert').modal('show');
            } else {
                $('#modalAlert .modal-title').html('Успех!');
                $('#modalAlert .message').html('Данные успешно сохранены');
                $('#modalAlert').modal('show');
            }
        });
        return false;
    });

    if($('#openLoginPopup').size() > 0) {
        $('#modal_registration').modal();
    }
    if($('#openThanksForRegisterPopup').size() > 0) {
        $('#modal-register-thanks').modal();
    }
    if($('#openAccountActivationPopup').size() > 0) {
        $('#modal-register-complete').modal();
    }
    if (isMainPage() && backFromMarket == "false") {
        $.each(getCategoriesOID(), function (index, value) {
            $.cookie(value, 0);
        });
    }
    $('#assistTabLink').click(function () {
        $('#assistTab').click();
        return false;
    });
    $('.discount-partner-delete').click(function () {
        if (confirm("Удалить партнера?")) {
            return true;
        }
        return false;
    });
    $('.partner-popup-button').click(function () {
        $('#modalDiscountPartner form').attr('action', $(this).attr('data-action'));
        var url = "";
        if (!$(this).hasClass('add')) {
            url = $(this).closest('tr').find('.partner-url').html()
        }
        $('#discountPartnerURL').val(url);
    });
    $('.discount-card-image-delete').click(function () {
        return confirm("Удалить изображение?");
    });
    if ($('#cardLogoAdd').size() > 0) {
        new AjaxUpload('#cardLogoAdd', {
            action: $('#cardLogoAddURL').val(),
            name: "imageUploadForm",
            onSubmit: function() {
                $('#overlay-loading').show();
            },
            onComplete: function (file, response) {
                $('#overlay-loading').hide();
                var parsedResponse = parseResponse(response, "=");
                var uploadResult = getUploadResult(parsedResponse, "result");
                var error = getUploadResult(parsedResponse, "error");
                if (error == "true") {
                    $('#modalAlert .modal-title').html('Произошла ошибка');
                    $('#modalAlert .message').html(uploadResult);
                    $('#modalAlert').modal('show');
                    return;
                }
                $('#discount-card-logo').attr('src', uploadResult);
            }
        })
    }
    if ($("#addDiscountImageButton").size() > 0) {
        new AjaxUpload('#addDiscountImageButton', {
            action: $('#cardImageAddURL').val(),
            name: "imageUploadForm",
            onSubmit: function() {
                $('#overlay-loading').show();
            },
            onComplete: function (file, response) {
                $('#overlay-loading').hide();
                var parsedResponse = parseResponse(response, "=");
                var uploadResult = getUploadResult(parsedResponse, "result");
                var error = getUploadResult(parsedResponse, "error");
                if (error == "true") {
                    $('#modalAlert .modal-title').html('Произошла ошибка');
                    $('#modalAlert .message').html(uploadResult);
                    $('#modalAlert').modal('show');
                    return;
                }
                $('#discountCardImages').append('<li><img src="' + uploadResult + '"/></li>');
            }
        })
    }
    if ($("#addDiscountPartnerLogo").size() > 0) {
        new AjaxUpload('#addDiscountPartnerLogo', {
            action: $('#partnerLogoAddURL').val(),
            name: "imageUploadForm",
            onSubmit: function() {
                $('#overlay-loading').show();
            },
            onComplete: function (file, response) {
                $('#overlay-loading').hide();
                var parsedResponse = parseResponse(response, "=");
                var uploadResult = getUploadResult(parsedResponse, "result");
                var error = getUploadResult(parsedResponse, "error");
                if (error == "true") {
                    $('#modalAlert .modal-title').html('Произошла ошибка');
                    $('#modalAlert .message').html(uploadResult);
                    $('#modalAlert').modal('show');
                    return;
                }
                $('.partner-logo-image').attr('src', uploadResult);
            }
        })
    }
    $(document).on("click", ".stock-group-item", function () {
        var categoryOIDElement = $('.category-oid', $(this).parent());
        if (categoryOIDElement.size() > 0) {
            $.cookie('selectedCategoryOID', $(categoryOIDElement).attr('data-category-oid'), {path: '/'});
        }
    });
    $(document).on("click", ".sales-list a", function () {
        var categoryOIDElement = $(this).closest('.category-oid');
        if (categoryOIDElement.size() > 0) {
            $.cookie('selectedSaleCategoryOID', $(categoryOIDElement).attr('data-category-oid'), {path: '/'});
        }
    });
    if (location.hash && location.hash.search('actionRequest') == 0) {
        var activeTab = $('[href=' + location.hash + ']');
        activeTab && activeTab.tab('show');
    }
    initProfileImageInput();
    $('#adminDeleteAvatar').click(function () {
        if (!confirm("Удалить аватар?")) {
            return false;
        }
    });
    initMobileDevice();
    initAssistSubmit();
    initWmSubmit();
    initIPaySubmit();
    initNavTrigger();
    initAutoLoadMarketActions();
    initVoteRating();
    initEditVoteRating();
    switch (window.location.hash) {
        case "#map0":
            $("[id^='mapCollapseBtn']").click();
            break;
        case "#CreateNewAction":
            $('#modal_add_stock').modal();
            break;
        case "#profile_info":
            $("html,body").scrollTop($(myElement).offset().top)
    }
    $(window).load(function () {
        $(".mail").toggle().toggle();
    });
    // Checking checkboxes
    initFieldDropdown();
    initStockNavigation();
    // Добавление служебного класса полю при фокусе элемента
    $('.form-element').focus(function () {
        $(this).parent('.field').addClass('focused');
    }).blur(function () {
        $(this).parent('.field').removeClass('focused');
    });
    initPasswordRemember();
    initComments();
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.scrolltop').fadeIn();
        } else {
            $('.scrolltop').fadeOut();
        }

        var buyButton = $('.stock-information #buyCodeButton');
        if ($(this).scrollTop() > 450) {
            if(!buyButton.hasClass('fixed')) {
                buyButton.addClass('fixed');
                buyButton.css('width', buyButton.parent().outerWidth());
            }
        } else {
            if(buyButton.hasClass('fixed')) {
                buyButton.removeClass('fixed');
                buyButton.css('width', 'auto');
            }
        }
    });
    $('[data-target="#modal_billing"]').on('click', function () {
        showText();
    });
    function showText() {
        var link = '/new_balance_order';
        viewText(link);
    }
    $(document).on('hidden.bs.modal', '.modal', function () {
        $('#errorBox').remove();
        hideFakeButtons();
    });
    if ($('#stock_map').length > 0) {
        show_stock_map();
    }

    if ($('#stock_map2').length > 0) {
        show_stock_map2();
    }

    if ($('#stock_location').length > 0) {
        stock_location();
    }
    $(document).on('click', '.profile-codes-item .print', function (event) {
        var item = $(this).closest('.profile-codes-item');
        item.printArea();
    });
    $('.header--top-navigation .balance, .header--top-navigation .phones, .header--top-navigation .monthly, .ava-bonus').hover(function () {
        var target = $(this);
        target.addClass('open');
    }, function () {
        var target = $(this);
        target.removeClass('open');
    });
    initStyleFieldsDownloading();
    $('.sale-li').mousemove(function (event) {
        $('.sale-info').css('top', event.pageY + 5).css('left', event.pageX + 15);
    });

    $(document).on('click', '.subcategories-list .companies', function () {
        $(this).closest('.stock-group-header').find('.companies-list').toggle();
        return false;
    });
    initTooltip();
    $('#addMarketActionForm').find('.clear').click(function () {
        $('#fileInputValue').html('');
    });
    window.onhashchange = function (event) {
        search();
    };
    $('.sale-list-box--search form').submit(function () {
        var searchInput = $('.search-text', this);
        searchInput.addClass('loading');
        $.ajax($(this).attr('action') + "?" + $(this).serialize()).done(function (data) {
            $('.sale-list-box-table').html(data);
            searchInput.removeClass('loading');
        });
        return false;
    });
    search();
    trimSideBar();
    initAutocomplete();
    initCaretAtSearchField();
    initSmartBanner();
    initBalanceAndPhoneDropdown();
    initViews();
    if (window.location.pathname == '/') {
        initAutoLoad();
    }
    initSendProblem();
    searchMarketAction();
    backFromMarket = false;
});

function initProfileImageInput() {
    if ($('#profileImageInput').size() > 0) {
        new AjaxUpload('#profileImageInput', {
            action: $('#profileImageUploadURL').val(),
            name: "profileImageUpload",
            onComplete: function (file, response) {
                var parsedResponse = parseResponse(response, "=");
                var uploadResult = getUploadResult(parsedResponse, "result");
                var error = getUploadResult(parsedResponse, "error");
                if (error == "true") {
                    $('#modalAlert .modal-title').html('Произошла ошибка');
                    $('#modalAlert .message').html(uploadResult);
                    $('#modalAlert').modal('show');
                    return;
                }
                $('#profileImageEdit img').load(function () {
                    $('#modalProfileImage').modal();
                    var imageHeight = this.naturalHeight;
                    var imageWidth = this.naturalWidth;
                    var initialSelection = [0, 0, 0, 0];
                    var horizontalMargin;
                    var marginPercent = 0.2;
                    if (imageHeight > imageWidth) {
                        horizontalMargin = Math.round(imageWidth * marginPercent);
                        var size = imageWidth - horizontalMargin * 2;
                        verticalMargin = Math.round((imageHeight - size) / 2);
                    } else {
                        verticalMargin = Math.round(imageHeight * marginPercent);
                        var size = imageHeight - verticalMargin * 2;
                        horizontalMargin = Math.round((imageWidth - size) / 2);
                    }
                    initialSelection[0] = horizontalMargin;
                    initialSelection[2] = imageWidth - horizontalMargin;
                    initialSelection[1] = verticalMargin;
                    initialSelection[3] = imageHeight - verticalMargin;
                    $(this).Jcrop({
                        boxWidth: 300,
                        boxHeight: 300,
                        aspectRatio: 1,
                        setSelect: initialSelection,
                        onSelect: function (selection) {
                            $('#cropCoordinates').val(JSON.stringify(selection));
                            var scaleX = 100 / selection.w;
                            var scaleY = 100 / selection.h;
                            $('#profileImagePreview img').css({
                                width: Math.round(scaleX * imageWidth) + 'px',
                                height: Math.round(scaleY * imageHeight) + 'px',
                                marginLeft: -Math.round(scaleX * selection.x) + 'px',
                                marginTop: -Math.round(scaleY * selection.y) + 'px'
                            });
                        }
                    }, function () {
                        JcropAPI = this;
                    });
                });
                $('#profileImageEdit img').attr('src', uploadResult);
                $('#profileImagePreview img').attr('src', uploadResult);
            }
        });
        $('#modalProfileImage .button').click(function () {
            $.ajax({
                url: $('#profileImageCropURL').val(),
                type: 'post',
                data: "cropCoordinates=" + $('#cropCoordinates').val()
            }).done(function (data) {
                var parsedResponse = parseResponse(data, "=");
                var uploadResult = getUploadResult(parsedResponse, "result");
                var isError = getUploadResult(parsedResponse, "error");
                $('#profileImage').attr('src', uploadResult);
                $('.profile-image-wrapper').removeClass('loading');
                $('.profile-image .value span').html('Изменить');
                $('.profile-image--delete').show();
                $('#modalProfileImage').modal('toggle');
            })
        });
        $('#modalProfileImage').on('hidden.bs.modal', function () {
            $('.profile-image-wrapper').removeClass('loading');
            if (JcropAPI != null) {
                JcropAPI.destroy();
            }
        });
        $('.profile-image--delete').click(function () {
            $('#confirmProfileImageDelete').modal();
        });
        $('#confirmProfileImageDelete .confirm').click(function () {
            $.get($('.profile-image--delete').attr('href'), function () {
                $('#profileImage').attr('src', '/images/ava250x250.png');
                $('.profile-image .value span').html('Загрузить фотографию профиля');
                $('.profile-image--delete').hide();
                $('#confirmProfileImageDelete').modal("hide");
            });
            return false;
        });
    }
}

function initAssistSubmit() {
    $(document).on('click', '.assist-submit', function () {
        var form = $(this).closest('.assist-form');
        if (form.find('.assistAmountInput').val() < 10000) {
            $('#assistCancel').click(function () {
                form.closest('.modal').modal();
            });
            $('#assistContinue').click(function () {
                $(form).find('.assistAmountInput').val(10000);
                form.find('.assist-submit').trigger('click');
            });
            $('#modalAssistLimit').modal();
            return;
        }
        var offerID = $('#modal_phone_code .assist-form .action-order-oid').val();
        var codesCount = $('#modal_phone_code .assist-form .payment-codes-count').val();
        if (offerID == "") {
            offerID = 0;
            codesCount = 0;
        }
        $.getJSON('/assist/balance/order/create/' + form.find('.assistAmountInput').val() + '/' + offerID + '/' + codesCount, function (data) {
            form.find('.assist-balance-order-id').val(data.orderID);
            form.find('.assist-signature').val(data.signature);
            form.submit();
        });
        $('#assistTabLink').click(function () {
            $('#assistTab').trigger('click');
        });
    })
}

function initIPaySubmit() {
    $('input[name="ipay"]').click(function () {
        $(this).tab('show');
    });
    $('.modal-billing').on('hidden.bs.modal', function () {
        $('.ipay-form  .tab-content').hide();
        $('.ipay-amount').show();
        $('.ipay-items').hide();
        $('.ipay-submit').show();
    });
    $(document).on('submit', '.ipay-form', function () {
        var form = $(this);
        var amount = $('input[name="amount"]', form).val();
        var orderID = $('.action-order-oid', $(form).parent()).val();
        var codesCount = $('.payment-codes-count', $(form).parent()).val();
        if (orderID == "") {
            orderID = 0;
            codesCount = 0;
        }
        if ($('.ipay-amount:visible', form).size() > 0) {
            $.get('/ipay/balance/order/create/' + amount + '/' + orderID + '/' + codesCount).done(function (data) {
                data = data.trim();
                $('input.ipay-order-no', form).val($.trim(data));
                $('span.ipay-order-no', form).html($.trim(data));
                $('.ipay-items', form).show();
                $('.tab-content', form).show();
                $('.ipay-amount', form).hide();
            });
        } else {
            document.location = form.attr('action') + "?" + form.serialize();
        }
        return false;
    });
    $('.ipay-items.nav-tabs').on('shown.bs.tab', function (event) {
        $(event.target).closest('form').attr('action', $(event.target).attr('data-url'));
    });
}

function initWmSubmit() {
    $('.wm-submit').click(function () {
        var form = $(this).closest('.wm-form');
        $.ajax({
            url: form.find('.balance-order-url').val(),
            success: function (html) {
                html = $.trim(html);
                form.find('.wm-balance-order-id').val(html);
                form.submit();
            }
        });
    });
}

function initSearch() {
    var searchForm = $('#searchForm');
    $(document).on('click', '.search-show-more a', function () {
        var container = $(this).parent();
        container.html("<img src='/images/ajax_loading.gif' alt='Загрузка...'/>");
        var actionsType;
        if (container.hasClass('active')) {
            actionsType = "activeActionsPage";
        } else {
            actionsType = "pastActionsPage"
        }

        var categoryOID = searchForm.find('.field-categories .active').attr('data-id');
        var priceCategoryOID = searchForm.find('.field-price .selected').attr('data-id');
        var genderCategoryOID = $('.field-family .selected').attr('data-id');
        $.get(searchForm.attr('action'), searchForm.serialize() + "&categoryOID=" + categoryOID
            + "&price=" + priceCategoryOID + "&genderCategoryOID=" + genderCategoryOID + "&" + actionsType + "=" + container.attr('data-page'), function (data) {
            container.replaceWith(data);
            initLazyload();
        });
        return false;
    });
    $(".header--search .dropdown").hover(function () {
        $(this).addClass('open');
        $(this).find('.dropdown-menu').show();
    }, function () {
        $('.header--search .dropdown').removeClass('open');
        $(this).find('.dropdown-menu').hide();
    });
    $(".header--search .dropdown li").click(function () {
        $('.header--search .dropdown').removeClass('open');
        $(this).parent().parent().hide();
    });

    $('#searchField').keyup(function () {
        isSearchFieldChanged = true;
    });
    searchForm.find('.dropdown-toggle').click(function () {
        if (isSearchFieldChanged) {
            $('#searchForm').submit();
        }
    });
    searchForm.submit(function () {
        isSearchFieldChanged = false;
        var categoryOID = searchForm.find('.field-categories .active').attr('data-id');
        var priceCategoryOID = searchForm.find('.field-price .selected').attr('data-id');
        var genderCategoryOID = searchForm.find('.field-family .selected').attr('data-id');
        location.hash = "actionRequest=search&categoryOID=" + categoryOID + "&priceCategoryOID=" + priceCategoryOID + "&genderCategoryOID=" + genderCategoryOID + "&searchText=" + encodeURI($('#searchField').val());
        return false;
    });
}

function initNavTrigger() {
    $('#nav_trigger').click(function (event) {
        var nav = $('.stock-navigation-wrapper');

        if (nav.hasClass('visible')) {
            nav.removeClass('visible open');
        } else {
            nav.addClass('visible');
        }
    });
}

function initFieldDropdown() {
    $('.field-dropdown-custom .dropdown li').each(function () {
        var checkbox = $(this).find('input');
        var li = checkbox.closest('li');

        if (li.hasClass('selected')) {
            checkbox.prop('checked', true);
        } else {
            checkbox.prop('checked', false);
        }
    });
    // Checking checkboxes
    $('.field-dropdown .dropdown li').each(function () {
        var checkbox = $(this).find('input');
        var li = checkbox.closest('li');

        if (li.hasClass('selected')) {
            checkbox.prop('checked', true);
        } else {
            checkbox.prop('checked', false);
        }
    });
    // Adding class for active elements
    $('.field-dropdown-custom .dropdown-menu li').click(function () {
        var checkbox = $(this).find('input');
        var checkbox_text = $(this).text();
        var field = checkbox.closest('.field-dropdown');
        var li = checkbox.closest('li');
        var title = field.find('.dropdown-toggle span.title');
        field.find('.dropdown-menu li').each(function () {
            $(this).removeClass('selected');
            $(this).find('input').prop('checked', false);
        });

        if (field.hasClass('header-gender-filter')) {
            field.removeClass('man woman family kids');
            field.addClass($(this).find('span').attr('class'));
        } else {
            title.text(checkbox_text);
        }

        checkbox.prop('checked', true);
        li.addClass('selected');
        $('#searchForm').submit();
    });
    $('.field-dropdown.field-categories .dropdown-menu li').click(function (event) {
        $('.field-dropdown.field-categories .dropdown-menu li').removeClass('active');
        $(this).addClass('active');
        $('#searchForm').submit();
    });
}

function initStockNavigation() {
    $('.stock-navigation-item').hover(function () {
        var categories = $(this).find('.categories');
        var categories_offset = categories.offset();
        categories.css('display', 'block');
        setTimeout(function () {
            categories.addClass('hover');
        }, 80);
    }, function () {
        var categories = $(this).find('.categories');
        setTimeout(function () {
            categories.removeClass('hover');
        }, 80);
        categories.css('display', 'none');
    });

    $('.stock-navigation-label').click(function () {
        var nav = $(this).closest('.stock-navigation-wrapper');
        var label = $(this).find('b');
        if (nav.hasClass('open')) {
            nav.removeClass('open');
            label.text('Показать все');
        } else {
            nav.addClass('open');
            label.text('Скрыть');
        }
    });
}

function initComments() {
    $('[data-action="comment_reply"]').click(function (event) {
        var idComment = $(this).attr('id-comment');
        $('#parentCommentId').val(idComment);
        $('#add_comment').css('display', 'inline-block');
    });

    $('[data-action="comment_delete"]').click(function (event) {
        $('#add_comment').css('display', 'none');
    });

    $('[data-action="comment_reply_delete"]').click(function (event) {
        if (($(".form-element").is("#comment_reply_textarea"))) {
            $('#comment_reply_div').remove();
        }
    });

    $('[data-action="comment_add"]').click(function (event) {
        $('#add_comment').css('display', 'inline-block');
    });

    $('#adminDetailOrderForm').on('submit', function () {
        $('#replenishBalanceButtonContainer').text('Идёт пополнение баланса...');
    });

    $('.scrolltop').click(function () {
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });

    $(document).on('click', '.comments-list-item .megaphone', function () {
        var userComments = $(this).closest('.comments-list-item').find('.all-in-offer-by-user');
        var commentsList = $(this).closest('.comments-list-item').find('.all-in-offer-by-user--comments');
        if (commentsList.html() == "") {
            commentsList.html('<div class="loader"></div>');
            $.get($('.user-comments-url', userComments).val()).done(function (html) {
                commentsList.html(html);
            });
        }
        $(userComments).toggle();
    });
}

function initStyleFieldsDownloading() {
    $('.field-upload input[type="file"]').change(function () {
        var field = $(this).closest('.field');
        var title = field.find('.title');
        var input = $(this);
        var filename = input.val().split('\\').pop();
        var clear_btn = field.find('.clear');

        if (!field.hasClass('field-upload-docs')) {
            var placeholder = 'Загрузить фотографию';
        } else {
            var placeholder = 'Ваше резюме (DOC, PDF, JPG)';
        }

        if (filename == '') {
            field.removeClass('added');
            title.text(placeholder);
            field.find('.clear').remove();
        } else {
            field.addClass('added');
            title.text(filename);
            input.attr('title', filename);
            // Очистка поля
        }

        clear_btn.on("click", function () {
            input.replaceWith(input.val('').clone(true));
            title.text(placeholder);
            field.removeClass('added');
            $(this).closest('.field').find('input').attr('title', placeholder);
        });
    });
}

function initPasswordRemember() {
    $('[data-action="remember-password-form"]').on('submit', function () {
        $(document.body).css({cursor: 'wait'});
        $.post(
            $('#remember-password-action-url').val(),
            {email: $('#remember-password-email').val()},
            function (data) {
                $('#modal_remember_password').modal('hide');
                showInfoDialog(data);
                $(document.body).css({cursor: 'default'});
            }
        );
        return false;
    });
}

function stock_location() {
    var mapCanvas = document.getElementById('stock_location');
    var mapOptions = {
        center: new google.maps.LatLng(55.757342, 37.536714, 17),
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    var myLatlng = new google.maps.LatLng(55.757342, 37.536714, 17);

    // To add the marker to the map, use the 'map' property
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: 'images/map-marker.png'
    });
}

function show_stock_map2() {
    var mapCanvas = document.getElementById('stock_map2');
    var mapOptions = {
        center: new google.maps.LatLng(55.7571808, 37.6224087, 13),
        zoom: 12,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    var myLatlng = new google.maps.LatLng(55.7571808, 37.6224087, 13);

    var locations = [
        ['Bondi Beach', 55.7433654, 37.6404332, 11, 4],
        ['Coogee Beach', 55.7828664, 37.5762318, 13, 5],
        ['Cronulla Beach', 55.7501288, 37.6088475, 13, 3],
        ['Manly Beach', 55.7364075, 37.63494, 13, 2],
        ['Maroubra Beach', 55.7570842, 37.6512478, 13, 1]
    ];

    var marker, i;

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            icon: 'images/map-marker.png'
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(locations[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

// TODO привязать к типу страницы
function show_stock_map() {
    var mapCanvas = document.getElementById('stock_map');
    var mapOptions = {
        center: new google.maps.LatLng(55.7571808, 37.6224087, 13),
        zoom: 12,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    var myLatlng = new google.maps.LatLng(55.7571808, 37.6224087, 13);

    var locations = [
        ['Bondi Beach', 55.7433654, 37.6404332, 11, 4],
        ['Coogee Beach', 55.7828664, 37.5762318, 13, 5],
        ['Cronulla Beach', 55.7501288, 37.6088475, 13, 3],
        ['Manly Beach', 55.7364075, 37.63494, 13, 2],
        ['Maroubra Beach', 55.7570842, 37.6512478, 13, 1]
    ];

    var marker, i;

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            icon: 'images/map-marker.png'
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(locations[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

function initBalanceAndPhoneDropdown() {
    $('li.balance, .phones').click(function () {
        if ($(this).hasClass("open")) {
            $(this).removeClass("open");
        }
        else {
            $(this).addClass("open");
        }
    })
}

function plus(marketActionOID) {
    var unitsElement = $("#units");
    var units = unitsElement.text();
    var unitPrice = $("#unitPrice").text();
    var codesLeft = $("#codeForUse").html();
    var balance = $("#balance").text();
    units++;
    var currentPrice = unitPrice * units;
    if (codesLeft >= units && balance >= currentPrice) {
        unitsElement.text(" " + units + " ");
        $("#currentPrice").text(currentPrice);
        if (units == 2) {
            $(".minusUnit").removeClass("inactive");
        }
        if (units == codesLeft) {
            $(".plusUnit").addClass("inactive");
        }
    } else if (balance < currentPrice) {
        newOrderNumber(units, marketActionOID);
        $('#modal_phone_code').modal();
    }
    setCodesText();
}

function minus() {
    var unitsElement = $("#units");
    var codesLeft = $("#freeCodeCount").text() - $("#usedCodeCount").text();
    var units = unitsElement.text();
    var unitPrice = $("#unitPrice").text();
    if (units > 1) {
        units--;
        var currentPrice = unitPrice * units;
        unitsElement.text(" " + units + " ");
        $("#currentPrice").text(currentPrice);
        if (units == 1) {
            $(".minusUnit").addClass("inactive");
        }
        if (units == codesLeft - 1) {
            $(".plusUnit").removeClass("inactive");
        }
    }
    setCodesText();
}


function newOrderNumber(units, marketActionOID) {
    var link = '/new_order/' + marketActionOID + '/' + units;
    viewNewOrderNumber(link, units);
}

function setCodesText() {
    var codesCount = $("#units").text().trim();
    var codesText = "кодов";
    if (codesCount < 10 || codesCount > 20) {
        var lastDigit = codesCount[codesCount.length - 1];
        if (lastDigit == 1) {
            codesText = "код";
        } else if (lastDigit > 1 && lastDigit < 5) {
            codesText = "кодов";
        }
    }
    $('#codeString').text(codesText);
}

function initTooltip() {
    if (!isMobile.any()) {
        $('[data-toggle="tooltip"]').tooltip({html: true});
    }
}

function initMapClick() {
    // Открытие карты
    var showOnMapElement = $('[data-action="show_on_map"]');
    showOnMapElement.off('click');
    showOnMapElement.on('click', function () {
        var map = $(this).closest('.stock-group').find('.stock-group-map');
        if (!map.hasClass('stock-group-map--opened')) {
            map.addClass('stock-group-map--opened');
            button.text('Свернуть');
        } else {
            map.removeClass('stock-group-map--opened');
            button.text('Показать на карте');
        }
    });
}

function reloadPage(categoryOID, idStockGroupElement) {
    var url = window.location.protocol + '//' + window.location.host + '/slivki/div/business/tiles/boxes/category_box.jsp?selectedCategory=' + categoryOID;
    $.ajax({
        url: url,
        type: 'POST',
        success: function setData(data) {
            var stockGroupElement = $('#' + idStockGroupElement);
            stockGroupElement.show();
            var actionsElements = $(data).find('.stock-group-list').html();
            stockGroupElement.find('.stock-group-list').html(actionsElements);
            if ($('.stock-group').length > 3) {
                if (stockGroupElement.find('.stock-group-item').length == 0)
                    stockGroupElement.hide();
                stockGroupElement.find('.div-scroll-pane').remove();
            }
            replaceCountActions(stockGroupElement);
            initLazyload();
        }
    });
}

function replaceCountActions(stockGroupElement) {
    var idElement = parseInteger(stockGroupElement.attr('id'));
    var filterListSize = stockGroupElement.find('div[data-category-OID=' + idElement + ']').attr('data-count-actions');
    if (filterListSize == undefined) {
        filterListSize = 0;
    }
    var title = stockGroupElement.find('.stock-group-header .title');
    var titleText = title.html();
    var matches = titleText.match(/([^\)]+)\((.*)\)/);
    var titleTextWithCount = titleText.replace('(' + parseInteger(matches[matches.length - 1]) + ')', '(' + filterListSize + ')');
    title.html(titleTextWithCount);
}

function initAutocomplete() {
    $('#searchField').autocomplete({
        source: $('[name=autocompleteUrl]').val(),
        select: function (event, ui) {
            $('#searchField').val(ui.item.value);
            isSearchFieldChanged = false;
            $('#searchForm').submit();
        },
        delay: 700
    });
}

function loadMarketActions(categoryID, cityOID, lastID, moreCount, categoryBoxId, selector, position, isMailing) {
    backFromMarket = $.cookie("market");
    if (moreCount == 0) {
        var count = $.cookie(String(categoryID));
        count = Number(count);
        if (isNaN(count)) {
            count = 0;
        }
        if (backFromMarket == "false") {
            count++;
        }
        $.cookie(String(categoryID), count);
        if (backFromMarket) {
            moreCount = 150 * count;
        }
        window.currentViewBoxSelector = '#categoryBox' + categoryID;
    }
    else {
        $.cookie(categoryID, 0);
        window.currentViewBoxSelector = null;
    }
    var link = '';
    if (isMailing) {
        link += 'mailing_market_action_list_items_boxes.jsp';
    } else {
        link = 'moreOffers';
    }
    if (moreCount == 0) {
        moreCount = 15;
    }
    link += '?categoryID=' + categoryID + '&lastID=' + lastID + '&categoryBoxId=' + categoryBoxId +
        '&moreCount=' + moreCount + '&position=' + position;
    //remove old more loaded button
    var expanderBox = $(selector + " a.expanderBox");
    expanderBox.html("<img class='ajaxLoader' src='/images/ajax_loading.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            if (isMailing) {
                var categoryBox = $(selector);
                window.mlSelected = window.mlSelected - categoryBox.find('.marketActionCheckBox:checked').length;
                $('#MLselected').text(window.mlSelected);
                html = updateTeaserCheckBoxes(categoryID, html);
            }
            if (lastID == 0) {
                $(selector).html(html).show();
            } else {
                expanderBox.after(html);
                expanderBox.first().remove();
            }
            initLazyload();
            initTooltip();
            $('.discount-label').toggle().toggle();
            trimSideBar();
        }
    });
}

function extractId(str) {
    if (this.rx == null) this.rx = /(\d+)/;
    return parseInt(str.match(this.rx)[0]);
}

function updateTeaserCheckBoxes(categoryOID, html) {
    var categoryBox = $('#categoryBox' + categoryOID);
    var $this;
    $this = $(categoryBox);
    var teaserItems = $(html);
    var stockItemArray = [];
    teaserItems.each(function () {
        var stockItem = $(this);
        if (stockItem.hasClass('stock-group-item')) {
            var hash, id;
            $this = $(stockItem);
            hash = $this.attr('id');
            id = extractId(hash);
            $this.find('a.title').attr('onclick', function () {
                return false;
            });
            if (id == window.mainActionId) {
                $this.prepend('<input type="checkbox" class="marketActionCheckBox" data-category-id="' + categoryOID + '" data-id="' + id + '" />' +
                    '<input type="checkbox" style="float:left" name="mainTeaser" class="marketActionRadio" data-category-id="' + categoryOID + '" value="' + id + '" checked/>');
            } else {
                $this.prepend('<input type="checkbox" class="marketActionCheckBox" data-category-id="' + categoryOID + '" data-id="' + id + '" />' +
                    '<input type="checkbox" style="float:left" name="mainTeaser" class="marketActionRadio" data-category-id="' + categoryOID + '" value="' + id + '"/>');
            }
            stockItemArray.push(stockItem);
        }
    });

    for (var i = 0; i < stockItemArray.length; i++) {
        var marketActionCheckBox = $(stockItemArray[i]).find('.marketActionCheckBox');
        marketActionCheckBox.off("mousedown");
        marketActionCheckBox.on("mousedown", function (event) {
            if (($(this)).is(':checked')) {
                window.mlSelected--;
            } else {
                window.mlSelected++;
            }
            $('#MLselected').text(window.mlSelected);
            if (window.mlSelected > 0) {
                return ($('#MLpreview')).css('color', '#FF9933');
            } else {
                return ($('#MLpreview')).css('color', '#555');
            }
        });
    }
    return teaserItems;
}

function loadLiveCommentsBox() {
    if ($('.content-wrapper').has('.live-comments').length < 1) {
        $.ajax({
            url: window.location.protocol + '//' + window.location.host + "/znijki/div/common/tiles/structure/live_comments.jsp"
        }).done(function (data) {
            var contentWrapper = $('.content-wrapper');
            contentWrapper.html(data + contentWrapper.html());
            initTooltip();
        });
    }
}

function clickCategory(parentID, OID, cityOID, marketActionsBoxSelector, encodedCategoryUrl, matchingUsvAlias, encodedCategoryList, encodedCategoryDescriptionUrl, allListCategories) {
    if (getElement(OID).classList.contains('all-cat')) {
        loadPage(allListCategories, '/', '');
    } else {
        if ($('.marketAction').length || $('#categories-list').length) {
            loadMarketActions(parentID, cityOID, 0, 0, OID, marketActionsBoxSelector, '0', false);
            loadSubcategoryDescription(parentID, encodedCategoryDescriptionUrl);
            updateMapForCategory(parentID, OID);
            removeCookieForAutoSelection();
            loadPage(encodedCategoryList, encodedCategoryUrl, matchingUsvAlias);
        }
        else {
            window.location.href = encodedCategoryUrl;
        }
    }
}

function loadPage(url, encodedCategoryUrl, matchingUsvAlias) {
    $.ajax({
        url: url,
        type: 'POST',
        success: function setData(data) {
            var categoryList = $('#categories-list');
            if (categoryList.length) {
                categoryList.html(data);
            } else {
                $('.marketAction').html(data);
            }
            createdMaps = {};
            openedMaps = {};
            initMapClick();
            initLazyload();
            updateCategoryUrl(encodedCategoryUrl, matchingUsvAlias);
        }
    });
}

function updateCategoryUrl(categoryUrl, categoryName) {
    if (isHistoryApiAvailable()) {
        history.replaceState(null, null, categoryUrl);
    } else {
        location.hash = categoryName;
    }
}

function initCaretAtSearchField() {
    var searchField = $('#searchField');
    if (!isBlank(searchField.val())) {
        setCaretToPos(searchField, searchField.val().length);
    }
}

function showInfoDialog(content) {
    $('#info_dialog_content').html(content);
    $(".modal").not('#info_dialog').each(function () {
        $(this).modal("hide");
    });
    $('#info_dialog').modal();
}

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else {
        if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }
}

function setCaretToPos(input, pos) {
    setSelectionRange(input, pos, pos);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

/*in plugin added opera ios*/
function initSmartBanner() {
    $.smartbanner({
        button: 'Скачать',
        appendToSelector: '#apkBanner',
        title: 'Slivki.by',
        icon: '/images/app_icon.png',
        price: 'Бесплатно',
        inGooglePlay: 'В Google Play',
        inAppStore: 'В App Store',
        author: ' ',
        layer: true,
        iconGloss: false,
        scale: 'auto'
    });
    if ($('#smartbanner').length) { //if exists element #smartbanner
        $('.header').css('margin-top', '82px');
    }
}

function loadUserEvents(url, lastOID, isEven, showOldEvents, moreCount, paramPage) {
    var link = url + '?lastOID=' + lastOID + '&isEven=' + isEven + '&showOldEvents=' + showOldEvents + '&showCount=' + moreCount + '&page_profile=' + paramPage;
    $("#moreEvents_" + paramPage).find("span").html("<img class='ajaxLoader' src='/images/ajax_loading.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            $("#moreEvents_" + paramPage).remove();
            $("#bonusForHighActivityEvent").remove();
            switch (paramPage) {
                case 'all':
                    $("#profile_all").append(html);
                    break;
                case 'exist':
                    $("#profile_codes_exist").append(html);
                    break;
                case 'balance':
                    $("#profile_balance_list").append(html);
                    break;
                case 'bonus':
                    $("#profile_bonus_list").append(html);
                    break;
                default:
                    break;
            }

            checkPrintButtonVisibility();
            initLazyload();
        }
    });
}

function showDialog(id, width, height, resizable, draggable, position, modal) {
    id = "#" + id;
    $(id).dialog({
        width: width,
        height: height,
        resizable: resizable,
        draggable: draggable,
        position: position,
        modal: modal
    });
    $(id).dialog('open');
}

function checkPrintButtonVisibility() {
    var userAccountTable = $('#userAccountTable').get(0);
    var userEvent = $('.event .categoryBox');
    if (userEvent.length < 1) {
        $('#showPrintCheckboxes').hide();
    }
    else {
        $('#showPrintCheckboxes').show();
    }
}

function useCode(url, codeOID, id, hash) {
    var link = url + '?c=' + codeOID + '&h=' + hash;
    $.ajax({
        url: link,
        success: function (html) {
            $("." + id).addClass('usedCode');
            $("." + id + " span").remove();
        }
    });
}

function loadUserFavourites(url, lastOID, moreCount, type) {
    var link = url + '?lastOID=' + lastOID + '&showCount=' + moreCount + '&type=' + type;
    $("#more-favourites_" + type).find("span").html("<img class='ajaxLoader' src='/images/ajax_loading.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            $("#more-favourites_" + type).remove();
            switch (type) {
                case 'all':
                    $("#favorites_codes_all").append(html);
                    break;
                case 'active':
                    $("#favorites_codes_active").append(html);
                    break;
                case 'past':
                    $("#favorites_codes_past").append(html);
                    break;
                default:
                    break;
            }
            initLazyload();
        }
    });
}

function commentAdd(id, offerID) {
    $('#parentCommentId').val(id);
    $('#addVoteBox .publish').attr('onclick', "sendNewVote('/comments/add/" + offerID + "')");
    isUserAllowedToRate(offerID);
    $('#add_comment').css('display', 'inline-block');
}

function isUserAllowedToRate(offerID) {
    $.post( "/comment/is_user_allowed_to_rate/" + offerID, function( data ) {
        if(data == 'true') {
            $('#addVoteBox .rating').removeClass('rating-disabled');
            $('#addVoteBox .rating').removeAttr('data-original-title');
            $('#addVoteBox .rating').removeAttr('data-toggle');
            $('#addVoteBox .rating').removeAttr('data-placement');
        } else {
            $('#addVoteBox .rating').addClass('rating-disabled');
            $('#addVoteBox .rating').attr('data-original-title', 'Оценивать акцию можно не чаще одного раза в 7 дней');
            $('#addVoteBox .rating').attr('data-toggle', 'tooltip');
            $('#addVoteBox .rating').attr('data-placement', 'bottom');
        }
        initVoteRating();
    });
}

function commentEdit(id) {
    var url = "/comment/get/" + id;
    $.getJSON(url)
        .done(function( comment ) {
            $('#editCommentID').val(comment['ID']);
            $('#editComment').val(comment['comment']);
            var rating = parseInt(comment['rating']);
            if(rating > 0) {
                $('#editVoteBox .rating').removeClass('rating-disabled');
                var stars = $('#editRateForm').find('li');
                stars.removeClass('rated');
                stars.first().addClass('rated');
                var currentStar = stars.first();
                for(i = 1; i < rating; i++ ) {
                    currentStar = currentStar.next();
                    currentStar.addClass('rated');
                }
                $('#actionEditRating').val(rating);
            } else {
                $.post( "/comment/is_user_allowed_to_rate/" + comment['entityID'], function( data ) {
                    if(data == 'true') {
                        $('#editVoteBox .rating').removeClass('rating-disabled');
                        $('#editVoteBox .rating').removeAttr('data-original-title');
                        $('#editVoteBox .rating').removeAttr('data-toggle');
                        $('#editVoteBox .rating').removeAttr('data-placement');
                    } else {
                        $('#editVoteBox .rating').addClass('rating-disabled');
                        $('#editVoteBox .rating').attr('data-original-title', 'Оценивать акцию можно не чаще одного раза в 7 дней');
                        $('#editVoteBox .rating').attr('data-toggle', 'tooltip');
                        $('#editVoteBox .rating').attr('data-placement', 'bottom');
                    }
                    initEditVoteRating();
                });
            }
            if(comment['childAmount'] > 0) {
                $('#editComment').prop('disabled', true);
                $('#editComment').attr('title', 'Редактирование комментария запрещено!');
            } else {
                $('#editComment').prop('disabled', false);
                $('#editComment').removeAttr('title');
            }
            $('#editVoteBox').modal();
        });
}

$('#editVoteBox').on('hidden.bs.modal', function () {
    var stars = $('#editRateForm').find('li');
    $('#actionEditRating').val(0);
    $('#editVoteBox .rating').addClass('rating-disabled');
    stars.removeClass('rated');
});

function editComment() {
    var url = "/comment/edit/" + $('#editCommentID').val();
    $.post(url, {comment: $('#editComment').val(), rating: $('#actionEditRating').val()})
        .done(function( data ) {
            var comment = JSON.parse(data);
            $('.comments-list-item[data-id=' + comment['ID'] + '] .message').html(comment['comment']);
            var rating = parseInt(comment['rating']);
            if(rating != 0) {
                var stars = $('.comments-list-item[data-id=' + comment['ID'] + '] .rating--stars li');
                stars.removeClass('rated');
                stars.first().addClass('rated');
                var currentStar = stars.first();
                for(i = 1; i < rating; i++ ) {
                    currentStar = currentStar.next();
                    currentStar.addClass('rated');
                }
            }
            $('#editVoteBox').modal('hide');
        });
}

function isMainPage() {
    var pathName = window.location.pathname;
    return pathName === '/' || pathName === 'slivki/index.jsp';
}
function hideDescriptionCategories() {
    if (isMainPage()) {
        $('.div-scroll-pane').css('display', 'none');
    }
}

function scrollDecriptionCategory() {
    var scrollPane = $('.scroll-pane');
    if (scrollPane.length == 0) {
        return;
    }
    scrollPane.jScrollPane({
        hideFocus: true
    });
}

function initMailingButton(campaignId, state, autoload, campaingName) {
    window.mlId = campaignId;
    window.mlData = state;
    window.mlAutoload = autoload;
    window.mlName = campaingName;
    $(document).ready(function () {
        ($('#mailingCreateButton')).click();
    });
}

function initMailingSaleButton() {
    $(".sale-list-box-table").find("li").each(function () {
        var id = $(this).attr("data-oid");
        $(this).prepend('<input type="checkbox" class="saleCheckBox" data-id="' + id + '" />');
    });
}

function initDatepicker(fromUnixTime, toUnixTime, URL) {
    var dateFormat = "dd.mm.yy";
    if (fromUnixTime > 0) {
        var defaultFromDate = new Date(fromUnixTime);
        var fromDate = $('#fromDate');
        fromDate.datepicker('setDate', defaultFromDate);
        fromDate.val($.datepicker.formatDate(dateFormat, defaultFromDate));
    }
    if (toUnixTime > 0) {
        var defaultToDate = new Date(toUnixTime);
        var toDate = $('#toDate');
        toDate.datepicker('setDate', defaultToDate);
        toDate.val($.datepicker.formatDate(dateFormat, defaultToDate));
    }

    $.datepicker.setDefaults($.datepicker.regional["ru"]);
    var datepickers = $("#fromDate, #toDate").datepicker({
        dateFormat: dateFormat,
        changeMonth: true,
        changeYear: true
    });

    $("#refresh").click(function (e) {
        updateDateFields();
        $('#hiddenActionForm').attr('action', '');
        return true;
    });
    if (URL != '')
        $("#getCSV").click(function (e) {
            updateDateFields();
            $('#hiddenActionForm').attr('action', URL);
            return true;
        });
    return false;
}


function initUserStatistics(fromUnixTime, toUnixTime, URL) {
    initDatepicker(fromUnixTime, toUnixTime, URL);
    $('#userTable').find('th').click(function (e) {
        var sortField = $(this).attr('data-sort');
        var sortHiddenInput = $('#sortHiddenInput');
        var descHiddenInput = $('#descHiddenInput');
        if (sortHiddenInput.val() == sortField) {
            descHiddenInput.val(descHiddenInput.val() != 'true');
        } else {
            sortHiddenInput.val(sortField);
            descHiddenInput.val(true);
        }
        $('#hiddenActionForm').attr('action', '#' + this.id);
        $('#refresh').click();
    });


}

function updateDateFields() {
    var from = $('#fromDate').datepicker("getDate");
    var to = $('#toDate').datepicker("getDate");
    $('#fromHiddenInput').val((from != null) ? from.getTime() : '');
    $('#toHiddenInput').val((to != null) ? to.getTime() : '');
}

function initSellingStatistics() {
    $.datepicker.setDefaults($.datepicker.regional['ru']);
    $('#beginDate, #endDate').datepicker({
        dateFormat: 'dd.mm.yy'
    });
    $("#refresh").click(function (e) {
        $('#hiddenActionForm').attr('action', '');
        return true;
    });
}

function createDatepickerButton(classes) {
    $(classes).datepicker({
        showOn: "button",
        buttonImage: "/images/calendar.gif",
        buttonImageOnly: true,
        showAnim: 'fadeIn',
        showOtherMonths: true,
        closeText: 'Закрыть',
        prevText: '&#x3c;Пред',
        nextText: 'След&#x3e;',
        currentText: 'Сегодня',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        weekHeader: 'Не',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    });
}

function createDatepicker(classes) {
    $(classes).datepicker({
        buttonImageOnly: true,
        showAnim: 'fadeIn',
        showOtherMonths: true,
        closeText: 'Закрыть',
        prevText: '&#x3c;Пред',
        nextText: 'След&#x3e;',
        currentText: 'Сегодня',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        weekHeader: 'Не',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    });
}

function changeBonusValue(balanceReplenishment, balanceReplenishmentBonus, eventSource) {
    eventSource = $(eventSource).closest('.adminOrderDetail');
    var balanceValue = $('.balanceSelect', eventSource).val();
    var bonusValue = (parseInt(balanceValue / balanceReplenishment)) * balanceReplenishmentBonus;
    $('.bonusValue', eventSource).html(bonusValue);
    if (bonusValue > 0) {
        $('.bonusCheckbox', eventSource).prop('checked', true);
        $(".bonusCheckbox", eventSource).val("on");
        $(".bonusLine", eventSource).show();
    } else {
        $('.bonusCheckbox', eventSource).prop('checked', false);
        $(".bonusCheckbox", eventSource).val();
        $(".bonusLine", eventSource).hide();
    }
}

function inityMap(cityLatitude, cityLongitude) {
    ymaps.ready(function () {
        var yMap = new ymaps.Map('yMapContainer', {
            center: [cityLatitude, cityLongitude],
            zoom: 11
        });
        yMap.controls.add('zoomControl', {left: 5, top: 5});
        yMap.geoObjects.add(new ymaps.Placemark([cityLatitude, cityLongitude]));
        yMap.events.add(['contextmenu'], function (e) {
            var position = e.get('coords');
            removeGeoObjects(yMap);
            yMap.geoObjects.add(new ymaps.Placemark(position));
            $('#latitude').attr("value", position[0]);
            $('#longitude').attr("value", position[1]);
        });
    });
}

function removeGeoObjects(map) {
    map.geoObjects.each(function (geoObject) {
        map.geoObjects.remove(geoObject);
    });
}

function showSendMessageToDirectorWindow(voteOID) {
    showDialog('sendMessageToDirectorWindow' + voteOID, 640, 'auto', false, false, 'center', true);
}

function sendFormToDirector(userVoteOID, URL) {
    var waitCursorCSS = {cursor: 'wait'};
    $(document.body).css(waitCursorCSS);
    $('label').css(waitCursorCSS);
    $.post(URL,
        $('#sendMessageToDirectorWindow' + userVoteOID + ' .sendMessageToDirectorForm').serialize(), function (data) {
            var defaultCursorCSS = {cursor: 'default'};
            $(document.body).css(defaultCursorCSS);
            $('label').css(defaultCursorCSS);
            showInfoDialog(data);
        });
}

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

function handleWpForm(wmOrderLink, seed) {
    var amountInput = $("#amountInput");
    $("#totalAmount").val(amountInput.val());
    $("#itemPrice").val(amountInput.val());
    $.ajax({
        url: wmOrderLink,
        data: {
            'amount': amountInput.val(),
            'seed': seed
        },
        success: function (data) {
            var json = JSON.parse(data);
            $("#wpBalanceOrderId").val(json.orderId);
            $("#signature").val(json.signature);
            $("#sandboxForm").submit();
        }
    });
    return false;
}

function handleWmForm(wmOrderLink) {
    $.ajax({
        url: wmOrderLink,
        success: function (html) {
            document.getElementById('wmBalanceOrderID').value = html;
            document.getElementById('wmForm').submit();
        }
    });
    return false;
}

function onFavouriteClickFunction(marketActionOID, deleteFromFavourites, isUserAuthenticated, actionFavouriteURL) {
    $(document.body).css({cursor: 'wait'});
    if (!isUserAuthenticated) {
        $("#unauthorized").modal('show');
        $(document.body).css({cursor: 'default'});
        return false;
    } else {
        if (deleteFromFavourites) {
            $("#delete_from_favourite").modal('show');
        } else {
            $("#add_to_favourite").modal('show');
        }
    }
    $.ajax({
        url: actionFavouriteURL,
        success: function () {
        }
    });
    if (deleteFromFavourites) {
        var s = 'a[onclick*="' + marketActionOID + '"]';
        var teaser = $(".stock-group-item").has(s);
        teaser.each(function() {
            var amount = $('.content-filter li a[href=#' + $( this ).closest('.tab-pane').attr('id') + '] .favourites-amount');
            amount.text(parseInt(amount.text()-1));
        });
        teaser.remove();
    }
    $(document.body).css({cursor: 'default'});
    return false;
}

function initSocialNetworks() {
    window.vkAsyncInit = function () {
        VK.init({
            apiId: 3559291, /*live*/
            //apiId: 3564543, /*demohoster*/
            onlyWidgets: true
        });
    };

    setTimeout(function () {
        var el = document.createElement("script");
        el.type = "text/javascript";
        el.src = "//vk.com/js/api/openapi.js?87";
        el.async = true;
        document.getElementById("vk_api_transport").appendChild(el);
    }, 0);

    if (window.addEventListener) {
        window.addEventListener("load", setVKButton, false);
        window.addEventListener("load", addFacebookScript, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", setVKButton);
        window.attachEvent("onload", addFacebookScript);
    }

}

function setVKButton() {
    var divVk = $("div[id^='vk_like']");
    var countVkElement = 6;
    if (window['VK'] != undefined && divVk.length > 0) {
        if ($('#vk_like').length > 0)
            VK.Widgets.Like("vk_like", {type: "button", height: 18});
        for (var i = 0; i <= countVkElement; i++) {
            if ($("#vk_like" + i).length > 0)
                VK.Widgets.Like("vk_like" + i, {type: "button", height: 18});
        }
    }
}
function addFacebookScript() {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/ru_RU/all.js#xfbml=1";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}

function initTwitter(URL) {
    twttr = (function (d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = {
                _e: [], ready: function (f) {
                    t._e.push(f)
                }
            });
    }(document, "script", "twitter-wjs"));
}

function uploadPhoto(action, url) {
    var imgIndex = 0;
    new AjaxUpload($('#ajaxImageSubmit'), {
        action: action,
        name: 'imageUploadForm',
        onSubmit: function (file, ext) {
            var parentID = $("#parentCommentId").val();
            if ($('.previewImage').length == 0) {
                $('.addVoteTextField textarea').css({height: '185px'});
                $('.uploadedImagePreview').show();
            }
            $('<div></div>').appendTo('.uploadedImagePreview').html('<img src="/images/image-preview-ajax-loader.gif">')
                .addClass('previewImage loader');
        },
        onComplete: function (file, response) {
            var parsedResponse = parseResponse(response, '=');
            var uploadResult = getUploadResult(parsedResponse, "result");
            var isError = getUploadResult(parsedResponse, "error");
            if (isError == "true") {
                $('.uploadedImagePreview .loader').remove();
                var messagePopupBoxContainer = $('#messagePopupBoxContainer');
                messagePopupBoxContainer.html('<div id="errorBox"><div class="voteMessage">' + uploadResult + '</div></div>');
                messagePopupBoxContainer.show();
                if ($('.previewImage').length == 0) {
                    $('.addVoteTextField textarea').css({height: '245px'});
                    $('.uploadedImagePreview').hide();
                }
            } else if (!!uploadResult) {
                $('#imageUploadForm').attr('style', 'display:none');
                $('.previewImage').last().remove();
                var previewLink = '<img src=\"' + uploadResult + '\" alt=\"' + file + '\"/>';
                var preview = $('<div></div>').appendTo('.uploadedImagePreview').html(previewLink).addClass('previewImage');
                $('<div></div>').appendTo(preview).addClass('removeImage');
                preview.attr('imgindex', imgIndex + '');
                imgIndex++;
                $('.removeImage').click(function () {
                    $(this).parent().effect('drop', {}, 500, function () {
                        $(this).remove();
                        $.ajax({
                            type: 'POST',
                            url: url,
                            data: {
                                imageIndex: $(this).attr('imgindex')
                            }
                        });
                        var index = 0;
                        var $removeImage = $('.removeImage');
                        if ($removeImage.length == 0) {
                            $('.addVoteTextField textarea').css({height: '245px'});
                            $('.uploadedImagePreview').hide();
                            return;
                        }
                        $removeImage.each(function () {
                            $(this).parent().attr('imgindex', index + '');
                            index++;
                        });
                        imgIndex = index;
                    });
                });
            }
        }
    });
    var $input = $('input[name=imageUploadForm]');
    $input.attr('title', 'Добавить фото');
}

function initDetailBox() {
    $(document).click(function (e) {
        if ($(e.target).parents().filter('#sendMessageBox:visible').length != 1 && e.target.id != 'sendMessageLink' && !$(e.target).hasClass('buttonImg')) {
            $('#sendMessageBox').hide();
        }
    });
    $(document).ready(function () {
        $('.voteComment').each(function () {
            $(this).html($(this).html().linkify());
        });
        $('.adminComment').each(function () {
            $(this).html($(this).html().linkify());
        });

        var descriptionLinks = $('#marketActionConditionColumn a, #marketActionAddressColumn a, #marketActionFeaturesColumn a, #descriptionText a:not(:has(img))');
        if (descriptionLinks.length > 0) {
            descriptionLinks.attr('target', '_blank');
        }
    });
}

// manageControls: Hides and Shows controls depending on currentPosition
function manageControls(position) {
    // Hide left arrow if position is first slide
    if (position == 0) {
        $('#' + listID + ' #leftControl').hide()
    } else {
        $('#' + listID + ' #leftControl').show()
    }
    // Hide right arrow if position is last slide
    if (position == numberOfSlides - 3) {
        $('#' + listID + ' #rightControl').hide()
    } else {
        $('#' + listID + ' #rightControl').show()
    }
}

function initListBoxPage(listID, marketActionsSize) {
    var currentPosition = 0;
    var slideWidth = 290;
    var slides = $('#' + listID + ' .slide');
    var numberOfSlides = slides.length;

    // Remove scrollbar in JS
    $('#' + listID + ' #slidesContainer').css('overflow', 'hidden');

    // Wrap all .slides with #slideInner div
    slides
        .wrapAll('<div id="slideInner"></div>')
        // Float left to display horizontally, readjust .slides width
        .css({
            'float': 'left',
            'width': slideWidth
        });

    // Set #slideInner width equal to total width of all slides
    $('#' + listID + ' #slideInner').css('width', slideWidth * numberOfSlides);

    // Insert controls in the DOM
    if (marketActionsSize > 3) {
        $('#' + listID + ' #slideshow')
            .prepend('<span class="control" id="leftControl" title="назад">назад</span>')
            .append('<span class="control" id="rightControl" title="еще акции">еще акции</span>');
    }

    // Hide left arrow control on first load
    manageControls(currentPosition);

    // Create event listeners for .controls clicks
    $('#' + listID + ' .control')
        .bind('click', function () {
            // Determine new position
            currentPosition = ($(this).attr('id') == 'rightControl') ? currentPosition + 1 : currentPosition - 1;

            // Hide / show controls
            manageControls(currentPosition);
            // Move slideInner using margin-left
            $('#' + listID + ' #slideInner').animate({
                'marginLeft': slideWidth * (-currentPosition)
            });
        });
}

function sendMessageToSupport(url, marketActionTitle, actionLink, marketActionOID) {
    $(document.body).css({cursor: 'wait'});
    $('#sendMessageBox').hide();
    $('#bodyOfMessage').hide();
    $('#clean_body').val($('#bodyOfMessage').val() + '\n<a href="' + document.location + '">' + document.location + '</a>');
    $('#bodyOfMessage').val($('#bodyOfMessage').val() + '<br/><a href="' + document.location + '">' + document.location + '</a>');
    $.post(url, $("#submitMessageForm").serialize(), function (data) {
        if ($(data).attr('id') == 'errorBox') {
            $('#send_message_form_for_OID').find('#errorMessage').html(data);
        } else {
            showInfoDialog(data);
        }
        $(document.body).css({cursor: 'default'});
    });
    return false;
}

function changeHtml(url, isSendVote) {
    document.getElementById("voteBox").style.cursor = "wait";
    var textComment = document.getElementById("comment") == null ? "" : document.getElementById("comment").value;
    if (isSendVote) {
        $.post(url,
            {comment: textComment},
            function (data) {
                $('#voteBox').html(data);
                document.getElementById("voteBox").style.cursor = "default";
            },
            "html");
    }
}

function sendVote(answerIDList, isUserAuthenticated, showLogin, url) {
    if ("false" == isUserAuthenticated) {
        url += addParameter("email") +
            addParameter("password");
        if ("true" != showLogin) {
            url += ( addParameter("confirmPassword") +
            addParameter("company") +
            addParameter("salutation") +
            addParameter("firstName") +
            addParameter("lastName") +
            addParameter("address") +
            addParameter("zipCode") +
            addParameter("city") +
            addParameter("countryOID") +
            addParameter("referedBy") );
        }
    }
    var voteAnswer = $('input[name=voteanswer]:checked');
    if (voteAnswer != null)
        url += "\u0026voteanswer=" + voteAnswer.val();

    url += addParameter("access");
    changeHtml(url, true);
    return false;
}

function changeRegForm(url) {
    changeHtml(url, false);
}

function selectVotePage(url) {
    document.getElementById("voteResultBox").style.cursor = "wait";
    $.post(url, null,
        function (data) {
            $('#voteResultBox').html(data);
            document.getElementById("voteResultBox").style.cursor = "default";
        },
        "html");
}

function addParameter(name) {
    return ("\u0026" + name + "=" + document.getElementById(name).value).toString();
}

function initVoteBox() {
    $(document).ready(function () {
        $("#addVoteLink").click(function () {
            $("#parentCommentId").val("");
            var offerID = $(this).data('oid');
            $('#addVoteBox .publish').attr('onclick', "sendNewVote('/comments/add/" + offerID + "')");
            isUserAllowedToRate(offerID);
            var divId = $("#divId");
            if (divId.css('display') == 'none') {
                divId.show(400);
            } else {
                divId.hide(200);
            }
        })
    });
}

function initPhotoSendSale(action) {
    var uploadedDivElement = $('#uploadedPhotos > div:first-child');
    new AjaxUpload($('#photo_input'), {
        action: action,
        name: 'imageUploadFormForNewSale',
        onSubmit: function (file, ext) {
            $('#photo_input').hide();
            $('#uploadedPhotos').css('display', 'inline-block');
            $('<div></div>').prependTo('#uploadedPhotos').html('<img width="25px" src="/images/image-preview-ajax-loader.gif">')
                .addClass('loader');
        },
        onComplete: function (file, response) {
            $('#photo_input').show();
            $('#uploadedPhotos').css('display', 'block');
            var parsedResponse = parseResponse(response, '=');
            var uploadResult = getUploadResult(parsedResponse, "result");
            var isError = getUploadResult(parsedResponse, "error");
            if (isError == 'true') {
                $('#messagePopupBoxContainer').html('<div id="errorBox"><div class="voteMessage">' + uploadResult + '</div></div>');
                showInfoDialog('messagePopupBoxContainer');
                uploadedDivElement.remove();
            } else if (!!uploadResult) {
                uploadedDivElement.removeClass('loader');
                uploadedDivElement.text(file);
            }
        }
    });
}

function updateUserPassword(url, popupID) {
    $(document.body).css({cursor: 'wait'});
    $.post(url, {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        password: document.getElementById("popupPassword").value,
        confirmPassword: document.getElementById("confirmPopupPassword").value,
        customertAgreement: document.getElementById("customertAgreement").checked ? 'on' : 'off',
        popup_id: popupID
    }, function (data) {
        $(document.body).css({cursor: 'default'});
        $("#" + popupID).html(data);
    });
}

function initPopupSetUserData() {
    getElement('popupPassword').blur();
    getElement('confirmPopupPassword').blur();
    getElement('firstName').blur();
    getElement('lastName').blur();

    if ($('#popupPassword').val() != "") {
        $('#popupPassordValue').css({display: 'none'})
    }
    if ($('#confirmPopupPassword').val() != "") {
        $('#confirmPopupPassordValue').css({display: 'none'})
    }
}

function sendUserData(url, popupID) {
    $(document.body).css({cursor: 'wait'});
    $.post(url, $("#userEditForm").serialize(), function (data) {
        $(document.body).css({cursor: 'default'});
        $("#" + popupID).html(data);
    });
}

function sendUserNewslettersData(url, popupID) {
    $(document.body).css({cursor: 'wait'});
    $.post(url, $("#userNewslettersForm").serialize(), function (data) {
        $(document.body).css({cursor: 'default'});
        $("#" + popupID).html(data);
    });
}

function headNewRelic() {
    var documentIsReady = false;
    window.onload = function () {
        documentIsReady = true
    };
    var javascriptErrorCount = 0;
    var javascriptMaxErrorCount = 20;
    window.onerror = function (errorMsg, file, lineNumber) {
        javascriptErrorCount += 1;
        if (javascriptErrorCount < javascriptMaxErrorCount) {
            // post the error with all the information we need.
            jQuery.post(window.location.protocol + '//' + window.location.host + '/znijki/error/javascript_error.jsp', {
                error: errorMsg,
                file: file,
                location: window.location.href,
                lineNumber: lineNumber,
                userId: 0,
                documentReady: documentIsReady,
                ua: navigator.userAgent
            });
        }
    }
}

function transformFormPrinting() {
    var showPrintCheckboxesButton = $('#showPrintCheckboxes');
    var printCodesButton = $('#printCodesButton');
    var printCheckBoxesSpan = $('#printCheckBoxesSpan');
    printCodesButton.show();
    printCheckBoxesSpan.show();
    showPrintCheckboxesButton.hide();
    $('.printCheckBox').each(function () {
        $(this).show();
    });
    return false;
}

function viewText(link) {
    var showTextLink = $('#showTextLink');
    if (showTextLink.html() != "") {
        return;
    }
    showTextLink.html("<img class='ajaxLoader' src='/common-img/d.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            $("#showTextLink").html(html).show();
        }
    });
}

function showTextMarketAction(link) {
    $("#showTextLink").html("<img class='ajaxLoader' src='/common-img/d.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            $("#showTextLink").html(html).show();
        }
    });
}

function initMarketAction() {
    $('.expandableBox .info .ellipsis').fadeIn();
    $('.expandableBox').hover(
        function () {
            $(this).find('.info').removeAttr('style');
            $(this).find('.info').find('h2').find('.ellipsis').stop(true, true).fadeOut();
            $(this).find('.info').addClass('expanded', 300);
        }, function () {
            $(this).find('.info').stop(true, true).animate({height: 15}, 300);
            $(this).find('.info').removeClass('expanded');
            $(this).find('.info').find('h2').find('.ellipsis').stop(true, true).fadeIn();
        }
    );
}

function loadUserEventsActions(link) {
    $("#moreEvents").find("span").html("<img class='ajaxLoader' src='/common-img/d.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            $("#moreEvents").remove();
            $("#bonusForHighActivityEvent").remove();
            var userAccountTable = $("#userAccountTable");
            userAccountTable.html(userAccountTable.html() + html).show();
            checkPrintButtonVisibility();
            initLazyload();
        }
    });
}

function loadLastComments(url, lastOID, showCount) {
    var link = url + '?lastOID=' + lastOID + '&showCount=' + showCount;
    $("#moreCommentsButton").html("<img class='ajaxLoader' src='/images/image-preview-ajax-loader.gif' alt='Загрузка...'/>");
    $.ajax({
        url: link,
        success: function (html) {
            var lastCommentsTable = $(".comments-list");
            $("#moreCommentsButton").remove();
            lastCommentsTable.append(html).show();
            initTooltip();
        }
    });
}

function sendAddMarketActionMessage() {
    if (areFieldsCorrect()) {
        var waitCursorCSS = {cursor: 'wait'};
        $(document.body).css(waitCursorCSS);
        $('label').css(waitCursorCSS);
        fillBody();
        $('#addMarketActionForm').ajaxSubmit({
            url: 'http://' + window.location.hostname + '/znijki/div/common/tiles/boxes/popups/send_add_market_action_message.jsp',
            success: function (data) {
                showInfoDialog(data);
                var defaultCursorCSS = {cursor: 'default'};
                $(document.body).css(defaultCursorCSS);
                $('label').css(defaultCursorCSS);
            }
        });
    }
    return false;
}

function areFieldsCorrect() {
    var errorMessage = '';
    var hasErrors = false;
    if (isAnyFieldIsEmpty()) {
        $("#error_messages").html('Заполните, пожалуйста, все обязательные поля формы.');
        hasErrors = true;
    } else {
        $("#error_messages").html('');
    }
    return !hasErrors;
}

function isAnyFieldIsEmpty() {
    var hasEmptyFields = false;
    var addMarketActionForm = $('#addMarketActionForm');
    addMarketActionForm.find('input').each(function () {
        if ($(this).attr('type') == 'text' && $(this).attr('id') != 'siteHref') {
            if (isBlank($(this).val())) {
                hasEmptyFields = true;
            }
        }
    });
    addMarketActionForm.find('textarea').each(function () {
        if (isBlank($(this).val())) {
            hasEmptyFields = true;
        }
    });
    return hasEmptyFields;
}

function showFileName() {
    $('#fileInputValue').html($('#fileInput').val().split('\\').pop());
}

function fillBody() {
    $('#bodyOfAddMarketActionForm').val(
        'Организация, ИП: ' + $('#organization').val() + '\n'
        + 'Юридический адрес: ' + $('#legalAddress').val() + '\n'
        + 'Реквизиты: ' + $('#requisites').val() + '\n'
        + 'Контактное лицо, телефон: ' + $('#contactPersonPhone').val() + '\n'
        + 'e-mail: ' + $('#mail').val() + '\n'
        + 'Тема акции: ' + $('#theme').val() + '\n'
        + 'Полная стоимость: ' + $('#fullCost').val() + '\n'
        + 'Скидка: ' + $('#discount').val() + '\n'
        + 'Стоимость со скидкой: ' + $('#bargainPrice').val() + '\n'
        + 'Условия акции: ' + $('#termsOfPromotion').val() + '\n'
        + 'Особенности: ' + $('#features').val() + '\n'
        + 'Телефоны в акции: ' + $('#phonesInAction').val() + '\n'
        + 'Где?: ' + $('#where').val() + '\n'
        + (isBlank($('#siteHref').val()) ? '' : ('Ссылка, сайт: ' + $('#siteHref').val()))
    );
}

function alertMessage(message) {
    alert(message);
    $('#mlClose').click();
}

function sendSaleMessage() {
    if (areFieldsCorrectSale()) {
        var waitCursorCSS = {cursor: 'wait'};
        $(document.body).css(waitCursorCSS);
        $('label').css(waitCursorCSS);
        fullBodySale();
        $('#addSaleForm').ajaxForm({
            url: '/znijki/div/common/tiles/boxes/popups/send_sale_message.jsp',
            success: function (data) {
                showInfoDialog('Информация добавлена. Благодарим Вас!');
                clearFormAddSale();
                var defaultCursorCSS = {cursor: 'default'};
                $(document.body).css(defaultCursorCSS);
                $('label').css(defaultCursorCSS);

            }
        }).submit();
        $('#messageErrorSale').html('');
    }
    return false;
}

function areFieldsCorrectSale() {
    var errorMessage = '';
    var hasErrors = false;
    if (isAnyFieldIsEmptySale()) {
        errorMessage = 'Заполните, пожалуйста, все обязательные поля формы.';
        $('#messageErrorSale').html(errorMessage);
        hasErrors = true;
    }
    $('#messagePopupBoxContainerForAddSale').html(
        '<div id="errorBox"><div class="errorInAddMarketActionMessage">' + errorMessage + '</div>' +
        '<div class="button"><img  src="/common-img/d.gif" alt="" class="buttonImg"' +
        'onclick="closeDialog(\'messagePopupBoxContainerForAddSale\');return false;"/></div></div>'
    );
    return !hasErrors;
}

function isAnyFieldIsEmptySale() {
    var hasEmptyFields = false;
    $('#addSaleForm input').each(function () {
        if ($(this).attr('type') == 'text' && $(this).attr('name') == 'saleEmail') {
            if (isBlank($(this).val())) {
                hasEmptyFields = true;
            }
        }
    });
    $('#addSaleForm textarea').each(function () {
        if (isBlank($(this).val()) && $(this).attr('name') == 'saleEmail') {
            hasEmptyFields = true;
        }
    });
    return hasEmptyFields;
}

function fullBodySale() {
    $('#bodyOfSendSaleForm').val(
        'Название компании: ' + $('#saleCompanyName').val() + '\n'
        + 'Название акции: ' + $('#saleName').val() + '\n'
        + 'Начало акции: ' + $('#saleBegin').val() + '\n'
        + 'Завершение акции: ' + $('#saleEnd').val() + '\n'
        + 'Описание акции: ' + $('#saleDescription').val() + '\n'
        + 'Бренды: ' + $('#saleBrends').val() + '\n'
        + 'Товары: ' + $('#saleProductsList').val() + '\n'
        + 'Ссылка на акцию: ' + $('#linkToSale').val() + '\n'
        + 'Адрес сайта: ' + $('#saleAddressOfSite').val() + '\n'
        + 'Адреса магазинов: ' + $('#saleShopAddresses').val() + '\n'
        + '\nИнформация для администратора\n'
        + 'Имя: ' + $('#saleAuthorName').val() + '\n'
        + 'Телефон: ' + $('#salePhone').val() + '\n'
        + 'E-mail: ' + $('#saleEmail').val() + '\n'
    );
}

function clearFormAddSale() {
    $('#saleCompanyName').val("");
    $('#saleName').val("");
    $('#saleBegin').val("");
    $('#saleEnd').val("");
    $('#saleDescription').val("");
    $('#saleBrends').val("");
    $('#saleProductsList').val("");
    $('#linkToSale').val("");
    $('#saleAddressOfSite').val("");
    $('#saleShopAddresses').val("");
    $('#saleAuthorName').val("");
    $('#salePhone').val("");
    $('#saleEmail').val("");
    $(".clear").click();
    $("#uploadedPhotos").html("");
}

function parseInteger(str) {
    if (str == undefined) {
        return 0;
    }
    return parseInt(str.replace(/\D+/g, ""));
}

function wrongClickHandler(wrongClickAddress, marketActionOID, userOID) {
    $.ajax({
        url: wrongClickAddress,
        data: {
            marketActionOID: marketActionOID,
            userOID: userOID
        }
    });
    return false;
}

function sendOrder(url) {
    var units = $("#units");
    if (units.text().trim() == "") {
        url += "1";
    } else {
        url += units.text().trim();
    }
    if (isPageProfile) {
        $.ajax({
            type: 'GET',
            url: url,
            data: {},
            success: function () {
                isPageProfile = false;
                window.location.replace(window.location.protocol + '//' + window.location.host + "/slivki/div/user/profile.jsp");
            }
        });
    }
    else {
        $.get(url, function(data) {
            if(data == '') {
                $('.modal').modal('hide');
                $('#modalAlert .modal-title').html('Произошла ошибка');
                $('#modalAlert .message').html('Невозможно совершить покупку!');
                $('#modalAlert').modal('show');
            } else {
                var currentUserBalance = $("#currentUserBalance", data).text();
                $('.balance #balance').html(currentUserBalance);
                $('.stock-top .stock-information').replaceWith(data);
                $('.modal').modal('hide');
            }
        });
    }
}

function showUnsubscribe() {
    $('#unsubscribe').hide();
    $('.unsubscribeNewslettersList').fadeIn('slow');
}

function clickByTime(idLink, timeout) {
    setTimeout(function () {
        $('#' + idLink)[0].click();
    }, timeout);
}

function initSendCommentButton(OID) {
    $.ajax({
        url: window.location.protocol + '//' + window.location.host + "/slivki/area/business/content.jsp?oid=" + OID,
        context: document.body
    }).done(function (data) {
        var onclick = $(data).find('#addVoteBox').find('.addVoteBoxContent .button').attr('onclick');
        // eval(onclick);
        $('#addVoteBox').find('.addVoteBoxContent .button').attr('onclick', onclick.replace('Vote', 'Comment'));
    });
    $('#addVoteBox').modal();
    $('#addVoteBox').modal('show');
}

function updateLastCommentsPage() {
    var url = window.location.protocol + '//' + window.location.host + "/znijki/div/vote/comments_list.jsp?lastOID=0&showCount=20";
    $.ajax({
        url: url
    }).done(function (data) {
        var commetsList = $('.comments-list')
        commetsList.find('.comments-list-item').remove();
        commetsList.find('#moreCommentsButton').remove();
        commetsList.html(commetsList.html() + data);
    });
}

function sendNewComment(url) {
    $.ajax({
        type: 'POST',
        url: url,
        data: {
            comment: $('#comment').val(),
            parentVoteId: $('#parentCommentId').val()
        },
        success: function () {
            $(document.body).css({cursor: 'default'})
        },
        statusCode: {
            200: function (data) {
                $('#addVoteBox').modal('hide');
                $('#comment').val('');
                $('.uploadedImagePreview').empty().hide();
                $('#messagePopupBoxContainer').empty();
                updateLastCommentsPage();
            },
            400: function (data) {
                var messagePopupBoxContainer = $('#messagePopupBoxContainer');
                messagePopupBoxContainer.html(data.responseText);
                messagePopupBoxContainer.show();
            }
        }
    });
    return false;
}

function sendNewVote(url) {
    $('.ajaxLoader').show();
    $.ajax({
        type: 'POST',
        url: url,
        data: {
            comment: $('#comment').val(),
            parentVoteId: $('#parentCommentId').val(),
            actionRating: $('#actionRating').val()
        },
        success: function () {
            $(document.body).css({cursor: 'default'})
        },
        statusCode: {
            200: function (data) {
                $('#comment').val('');
                $('.uploadedImagePreview').empty().hide();
                $('#messagePopupBoxContainer').empty();
                showInfoDialog(data);
                loadComments($('#stock-id').val(), 0);
                setInterval(function () {
                    $('#info_dialog').modal('hide');
                }, 5000);
                setInterval(function () {
                    $('.ajaxLoader').hide();
                }, 2000);
                var commentsCount = $('.comments-count');
                commentsCount.text(parseInteger(commentsCount.text()) + 1);
                $('.add-vote-box-bottom .rating').addClass('rating-disabled');
                $('#actionRating').val(0);
            },
            400: function (data) {
                var messagePopupBoxContainer = $('#messagePopupBoxContainer');
                messagePopupBoxContainer.html(data.responseText);
                messagePopupBoxContainer.show();
                $('.ajaxLoader').hide();
            }
        }
    });
    return false;
}

function initButtonToActions() {
    var marketActionList = $('.altMarketActionsBox');
    if (null != marketActionList.offset()) {
        var marketListPos = marketActionList.offset().top;
        var marketInfoHeight = $('#marketActionAdditionalInfo').height();
        var scroll, scrollTime, currentScroll;
        currentScroll = $(this).scrollTop();
        if (marketInfoHeight != undefined) {
            $('#scrollBtnToAction').fadeIn();
        }
        $(document).scroll(function () {
            if ($('.altMarketActionsBox').length == 0) return;
            currentScroll = $(this).scrollTop();
            marketListPos = $('.altMarketActionsBox').offset().top;
            if (currentScroll > marketListPos) {
                $('#btnToActionArrow').removeClass("arrowDown").addClass("arrowUp");
            } else {
                $('#btnToActionArrow').removeClass("arrowUp").addClass("arrowDown");
            }
        });
        $('#scrollBtnToAction').click(function (event) {
            event.preventDefault();
            marketListPos = $('.altMarketActionsBox').offset().top;
            scroll = marketListPos - 80;
            scrollTime = Math.abs(marketListPos - currentScroll) / 2;
            $('html, body').animate({scrollTop: scroll + 'px'}, trimTime(scrollTime));
        });
    }
    function trimTime(scrollTime) {
        if (600 > scrollTime) {
            scrollTime = 600;
        }
        if (scrollTime > 1500) {
            scrollTime = 1500;
        }
        return scrollTime;
    }
}

function trimSideBar() {
    var worksheet = $('.content--main');
    var salesList = $('.aside-discounts-category').slice(1);
    salesList.each(function () {
        var mainContentHeight = worksheet.offset().top + worksheet.height();
        var newSideBarHeight = $(".content--aside").height() + $(this).height();
        if (newSideBarHeight <= mainContentHeight) {
            $(this).show();
        }
        else {
            return false;
        }
    });
    if (salesList.children().length == 0) {
        $('.aside-discounts').remove();
    }
}

function viewNewOrderNumber(link, units) {
    $("#newOrderNumber").html("<img class='ajaxLoader' src='/common-img/d.gif' alt='Загрузка...'/>");
    $.getJSON(link).done(function(data) {
        $('#modal_phone_code .action-order-oid').val(data.orderOID);
        $("#newOrderNumber").html(data.orderNumber).show();
        $('.payment-codes-count').val(units);
        $('#modal_phone_code').modal();
    });
}

function showFakeButtons(activeAssist) {
    $('#buyCodeButton').hide();
    $('#buyCodeButtonFake').show();
    $('.button-get-code').hide();
    $('.button-get-code-fake').show();
    if (activeAssist) {
        $('#assistTab').click();
    }
}

function hideFakeButtons() {
    $('#buyCodeButtonFake').hide();
    $('#buyCodeButton').show();
    $('.button-get-code').show();
    $('.button-get-code-fake').hide();
}

function clickCategoryTitle(stockGroupTitle) {
    var stockGroup = $(stockGroupTitle).closest('.stock-group');
    var expand = stockGroup.find('.expanderBox');
    var reduce = stockGroup.find('.reducerBox');
    if (expand.length > 0) {
        $(expand).click();
    } else if (reduce.length > 0) {
        $(reduce).click();
    }
}

function getModalInProfile(e) {
    isPageProfile = true;
    var element = $(e);
    showFakeButtons(false);
    var link = $(element).parent().attr("data-link");
    $.ajax({
        url: link,
        type: 'GET',
        success: function (data) {
            var marketActionOID = $(data).find('#stock-id').val();
            var url = '/slivki/div/business/create_new_order.jsp?actionRequest=marketActionOrder' + '&marketActionOID=' + marketActionOID +
                '&numberOfCodes=0';
            $.ajax({
                url: url,
                success: function (html) {
                    showModalInProfile(data, $.trim(html));
                }
            });
        }
    });
}

function showModalInProfile(data, html) {
    var parsedResponse = parseResponse(html, '=');
    var orderNumber = getUploadResult(parsedResponse, "orderNumber");
    var orderOID = getUploadResult(parsedResponse, "orderOID");
    var modalId = $(data).find("#buyCodeButton").attr("data-target");
    var modal = $(data).find(modalId);
    if (modal.length == 0) {
        modal = $(data).filter("[id^='modal_phone']");
    }
    var container = $('#action_modal_windows');
    container.html('');
    container.append(modal);
    container.append($(data).find('#freeCodeCount').hide());
    container.append($(data).find('#usedCodeCount').hide());
    container.append($(data).find('#codeForUse').hide());
    container.append($(data).filter("[id^='modal_phone']"));
    moveModal(modalId);
    $(document).on('hidden.bs.modal', '.modal', function () {
        hideFakeButtons();
    });
    $(modal).find("#newOrderNumber").html(orderNumber).show();
    $('#modal_phone_code .assist-balance-order-comment').val(orderOID);
    $('#modal_phone_code .wm-action-order-oid').val(orderOID);
    $(modal).modal("show");
}
// align blocks height
function initSameHeight() {
    updateSideBar();
}

function parseLocationHash() {
    var parsedHash = {};
    if (location.hash != "") {
        var hash = location.hash.replace(/^#/, '');
        var splittedHash = hash.split('&');
        for (var i = 0; i < splittedHash.length; i++) {
            var hashParameter = splittedHash[i].split('=');
            parsedHash[hashParameter[0]] = hashParameter[1];
        }
    }
    return parsedHash;
}

function search() {
    var hashData = parseLocationHash();
    if (hashData.c && hashData.p && hashData.g) {
        hashData.actionRequest = "search";
        hashData.categoryOID = hashData.c;
        hashData.priceCategoryOID = hashData.p;
        hashData.genderCategoryOID = hashData.g;
        hashData.searchText = hashData.q;
    }
    if (hashData.actionRequest && hashData.actionRequest == "search") {
        var searchForm = $('#searchForm');
        var searchField = $('#searchField');
        searchField.addClass('loading');
        var categoryOID = hashData.categoryOID;
        var priceCategoryOID = hashData.priceCategoryOID;
        var genderCategoryOID = hashData.genderCategoryOID;
        if (hashData.searchText) {
            searchField.val(decodeURI(hashData.searchText));
        } else {
            searchField.val('');
        }
        $.get(searchForm.attr('action'), searchForm.serialize() + "&categoryOID=" + categoryOID
            + "&price=" + priceCategoryOID + "&genderCategoryOID=" + genderCategoryOID, function (data) {
            $(window).scrollTop(0);
            $('#contentContainer').removeClass('content').html(data);
            searchField.removeClass('loading');
            initLazyload();
            restoreState = false;
            searchField.blur();
        });
    }
    initSearch();
}

function initMailingPage() {
    $(document).ready(function () {
        $(".sale-list-box-title").click(function () {
            var element = $(".sale-list-box-table");
            if (element.is(':visible')) {
                element.hide();
            }
            else {
                element.show();
            }
        });
    });
    initMailingSaleButton();
}

function initAutoLoadMarketActions() {
    $(document).scroll(function () {
        if (window.lastScrollPosition == undefined) {
            window.lastScrollPosition = 0;
        }
        var element = $(window.currentViewBoxSelector).find('.expanderBox');
        var delta = window.lastScrollPosition - $(window).scrollTop();
        if ((delta <= 0) && element != null) {
            var position = element.position();
            if (position != null) {
                var distance = position.top - $(window).scrollTop();
                if (distance > 0 && distance < 2000) {
                    element.click();
                }
            }
        }
        window.lastScrollPosition = $(window).scrollTop();
    });
    showCategories();
}

function loadCategories() {
    var categories = $('div[id^="categoryBox"]');
    backFromMarket = $.cookie("market");
    categories.each(function () {
        var id = parseInteger($(this).attr("id"));
        var countOpenings = $.cookie(String(id));
        if (countOpenings > 0 && backFromMarket) {
            $(this).find(".expanderBox").click();
        }
        else {
            $.cookie(id, 0);
        }
    });
    $.cookie("market", false);
}
function showCategories() {
    if (backFromMarket === "false") {
        return false;
    }
    if (!isMainPage()) {
        return false;
    }
    var show = false;
    var lastCategory = $.cookie("last-category");
    $(".stock-group").each(function () {
        if ($(this).attr("id") == lastCategory) {
            show = true;
        }
    });
    var loading = false;
    var categoryList = $("#categories-list");
    var categoryOIDlist = $("li [data-oid]");
    var url = getLinkSite() + "/slivki/div/business/tiles/category_preview_list.jsp?showAll=true";
    $.ajax({
        url: url,
        method: 'GET'
    }).done(function (data) {
        if (!show && lastCategory != 0) {
            categoryOIDlist.each(function () {
                var OID = parseInteger($(this).attr("data-oid"));
                var categorySelector = "#categoryBox" + OID;
                if (OID != 0 && $(categorySelector).length == 0) {
                    var category = $(data).filter(categorySelector);
                    categoryList.append(category);
                    loading = false;
                    $('#imageLoading' + OID).remove();
                    if (lastCategory == OID) {
                        $.cookie("last-category", lastCategory);
                        return false;
                    }
                    $.cookie("last-category", 0);
                }
            });
            loadCategories();
        }
        initLazyload();
        initTooltip();
        trimSideBar();
        hideDescriptionCategories();
        initMobileDevice();
    });
}

function initAutoLoad() {
    var loading = false;
    var lastCategory = false;
    var lastCategoryOID = $("li [data-oid]:last").attr("data-oid");
    var categoryList = $("#categories-list");
    var listLi = $("li [data-oid]");
    $(document).scroll(function () {
        var element = $(".stock-group-item:visible").last();
        if (!lastCategory && element != null) {
            var position = element.position();
            if (position != null) {
                var distance = position.top - $(window).scrollTop();
                if (distance > 0 && distance < 2000) {
                    listLi.each(function () {
                        var oid = $(this).attr("data-oid");
                        var url = getLinkSite() + "/categoryBoxNotExpanded/" + oid;
                        if ($(".stock-group#categoryBox" + oid).length == 0 && !loading) {
                            if (oid == lastCategoryOID) {
                                lastCategory = true;
                            }
                            loading = true;
                            categoryList.append("<img id='imageLoading" + oid + "' src='/images/image-preview-ajax-loader.gif' alt='Загрузка...'/>");
                            $.ajax({
                                url: url,
                                method: 'GET'
                            }).done(function (data) {
                                categoryList.append(data);
                                initLazyload();
                                initTooltip();
                                trimSideBar();
                                hideDescriptionCategories();
                                initMobileDevice();
                                loading = false;
                                setCookie("last-category", oid);
                                $('#imageLoading' + oid).remove();
                            });
                            return false;
                        }
                    });
                }
            }
        }
    });
}

function getLinkSite() {
    return window.location.protocol + '//' + window.location.host;
}

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function resizeElementByMobileDevices() {
    var maps = $(".ymaps-2-1-29-map.ymaps-2-1-29-i-ua_js_yes.ymaps-2-1-29-map-ru");
    var mapCanvas = $('.mapCanvas');
    var mql = window.matchMedia("(orientation: portrait)");
    if (mql.matches) {
        mapCanvas.css("width", "960px");
        maps.css("width", "960px");
    }
    else {
        mapCanvas.css("width", "685px");
        maps.css("width", "685px");
    }
    if (isMobile.any) {
        $('.mapBtn').css("right", "40px");
    }
}

function initMobileDevice() {
    if (isMobile.any()) {
        $(".logo").addClass("margin-left");
        $("li div.field-dropdown").addClass("margin-left");
        $('div[data-action~=show_on_map]').hide();
        resizeElementByMobileDevices();
        window.addEventListener("orientationchange", function () {
            resizeElementByMobileDevices();
        }, false);
        $(window).on("orientationchange", function (event) {
            resizeElementByMobileDevices();
        });
        window.addEventListener("resize", function () {
            // Get screen size (inner/outerWidth, inner/outerHeight)
            resizeElementByMobileDevices();
        }, false);
    }
}

function animateRatingStars() {
    if ($('#actionRating').val() > 0 || !$('#addVoteBox').data('bs.modal').isShown || $('#addVoteBox .rating').hasClass('rating-disabled')) {
        return;
    }
    var ratedStar = $('#rateForm li.rated');
    $('#rateForm li').removeClass('rated');
    if (ratedStar.size() == 0) {
        $('#rateForm li').first().addClass('rated');
    } else {
        var nextStar = ratedStar.next();
        if (nextStar.size() == 0) {
            $('#rateForm li').first().addClass('rated');
        } else {
            $(nextStar).addClass('rated');
        }
        nextStar.addClass('rated');
    }
    setTimeout(animateRatingStars, 200);
}

function animateEditRatingStars() {
    if ($('#actionEditRating').val() > 0 || !$('#editVoteBox').data('bs.modal').isShown || $('#editVoteBox .rating').hasClass('rating-disabled') ) {
        return;
    }
    var ratedStar = $('#editRateForm li.rated');
    $('#editRateForm li').removeClass('rated');
    if (ratedStar.size() == 0) {
        $('#editRateForm li').first().addClass('rated');
    } else {
        var nextStar = ratedStar.next();
        if (nextStar.size() == 0) {
            $('#editRateForm li').first().addClass('rated');
        } else {
            $(nextStar).addClass('rated');
        }
        nextStar.addClass('rated');
    }
    setTimeout(animateEditRatingStars, 200);
}

function initVoteRating() {
    if ($('#addVoteBox .rating.rating-disabled').size() > 0) {
        return;
    }
    $('#addVoteBox').on('shown.bs.modal', function () {
        setTimeout(animateRatingStars, 250);
    });
    $('#rateForm li').click(function () {
        if ($('.rating.rating-disabled').size() > 0) {
            return;
        }
        $('#rateForm li').removeClass('rated');
        var rating = $(this).attr('data-id');
        $(this).addClass('rated').prevAll().addClass('rated');
        $('#actionRating').val(rating);
    });
}

function initEditVoteRating() {
    if ($('#editVoteBox .rating.rating-disabled').size() > 0) {
        return;
    }
    $('#editVoteBox').on('shown.bs.modal', function () {
        setTimeout(animateEditRatingStars, 250);
    });
    $('#editRateForm li').click(function () {
        if ($('#editVoteBox .rating.rating-disabled').size() > 0) {
            return;
        }
        $('#editRateForm li').removeClass('rated');
        var rating = $(this).attr('data-id');
        $(this).addClass('rated').prevAll().addClass('rated');
        $('#actionEditRating').val(rating);
    });
}

function initViews() {
    $('li.views').click(function () {
        var visitedMarketActionsLink = getLinkSite() + "/znijki/div/common/tiles/boxes/visited_action_box.jsp";
        $.ajax({
            url: visitedMarketActionsLink,
            type: 'get'
        }).done(function (data) {
            var visitedContent = $('.visited.stock-group-list');
            visitedContent.find('img').hide();
            visitedContent.html(data);
            initTooltip();
        })
    });
}

function setCookie(name, value) {
    $.cookie(name, value, {
        expires: 30,
        path: '/'
    });
}

function initSendProblem() {
    $('.problem--button').click(function () {
        var formProblem = $('#problem');
        formProblem.find('input[name="action"]').val($(this).attr("data-action"));
        formProblem.find('input[name="OID"]').val($(this).attr("data-oid"));
        formProblem.submit();
    })
}

function sendSalePartnerMessages(url) {
    $.ajax({
        url: url + "?FROM_JS=true",
        type: 'post',
        data: $('form.admin-block').serialize()
    }).done(function (data) {
        alertMessage(data.trim());
    })
}

function sendUpdateUserForm(url) {
    $.post(url, $("form[action='" + url + "']").serialize(), function (data) {
        alertMessage(data.trim());
    });
}

function searchMarketAction() {
    $('#searchMarketAction').change(function () {   //slivki/div/search/ajax_search.jsp?text=суши
        if ($(this).val() == "") {
            return;
        }
        $("input").prop('disabled', true);

        $.ajax({
            url: getLinkSite() + "/slivki/div/search/ajax_search.jsp?text=" + $(this).val(),
            type: 'get'
        }).done(function (data) {
            $("#sortableMarketActionList").html("");
            $(data).find('.stock-group-item').each(function () {
                var liElement = $("<li></li>").append($(this));
                $("#sortableMarketActionList").append(liElement)
            });
            initLazyload();
            $("input").prop('disabled', false);
        })
    });

    $("#saveAdvertising").click(function () {
        var OIDs = "";
        $("#adsMarketActionList").find('.stock-group-item').each(function () {
            OIDs += parseInteger($(this).attr("id")) + ",";
        });
        $.ajax({
            url: getLinkSite() + "/slivki/div/admin/advertising_control.jsp?advertisingOIDs=" + OIDs + "&ads_domain=" + $(".list-ads option:selected").attr("data-domain") + "&action=" + $(this).attr("data-action"),
            type: 'get'
        }).done(function (data) {
            alertMessage(data.trim());
        })
    });

    $(function () {
        $("#sortableMarketActionList, #adsMarketActionList").sortable({
            connectWith: ".sortable"
        }).disableSelection();
    });
    $(".list-ads").change(function () {
        $(location).attr('href', getLinkSite() + "/slivki/div/admin/advertising_control.jsp?ads_domain=" + $(this).find("option:selected").attr("data-domain"));
    })
}

function registrationViaSocialNetwork(token) {
    $.getJSON("//ulogin.ru/token.php?host=" + getLinkSite() + "&token=" + token + "&callback=?",
        function (data) {
            data = $.parseJSON(data.toString());
            if (!data.error) {
                var registerForm = $('.register');
                registerForm.find('[name=email]').val(data.email);
                registerForm.find('[name=password]').val("");
                registerForm.find('[name=confirmPassword]').val("");
                registerForm.find('[name=token]').val(token);
                registerForm.find('[type=submit]').click();

            }
        });
}

function linkingAccount(token) {
    $.post("/ulogin", { token: token },
        linkingAccountSuccess
    );
}

function linkingAccountSuccess() {
    $.post( "/ajax_get_user_social_accounts", function( data ) {
        $( "#profile-social-account-list" ).html( data );
    });

    $('#modalAlert .modal-title').html('Успех!');
    $('#modalAlert .message').html("Аккаунт привязан!");
    $('#modalAlert').modal('show');
}

function getCategoriesOID() {
    var resultArray = [];
    $("li [data-oid]").each(function () {
        var OID = parseInteger($(this).attr("data-oid"));
        resultArray.push(OID);
    });
    return resultArray;
}

var createBeforeCookie = function () {
    var date = new Date();
    date.setTime(date.getTime() + (15 * 1000));
    $.cookie("market", 'true', {expires: date});
};

function initDetailBoxPage(marketActionOID) {
    initDetailBox();
    initButtonToActions();
    $('[data-target="#modal_phone_code"]').click(function () {
        newOrderNumber(1, marketActionOID)
    });
    $(window).on('beforeunload', createBeforeCookie);
    if (isMobile.any()) {
        $(window).unload(createBeforeCookie);
    }
}