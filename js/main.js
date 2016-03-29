function lostPassword() {
    open("lost_password.jsp", "passwordWindow", "menubar=no, width=360, height=250");
}
function checkHeader() {
    var headerName = parent.header.location.pathname;
    if (headerName.indexOf("log_header.jsp") == -1) {
        parent.header.location.href = "log_header.jsp";
    }
}
function clickElement( id )
{
    var el = document.getElementById( id );
    if( el != null )
    {
        el.click();
    }
}

function getElement(elID) {
    return document.getElementById( elID );
}

function submitForm( formID )
{
    var form = getElement( formID );
    if( form != null )
        form.submit();
}

function fixPNG(element)
{
    if (/MSIE (5\.5|6).+Win/.test(navigator.userAgent))
    {
        var src;

        src = element.currentStyle.backgroundImage.match(/url\("(.+\.png)"\)/i);
        if (src)
        {
            src = src[1];
            element.runtimeStyle.backgroundImage="none";
        }
        if (src) element.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "',sizingMethod='scale')";
    }
}

function atrim(str) {
    return str.replace(/^\s*/,'').replace(/\s*$/,'');
}

function setRoundCorner( topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius, elementStr )
{
    settings = {
        tl: { radius: topLeftRadius },
        tr: { radius: topRightRadius },
        bl: { radius: bottomLeftRadius },
        br: { radius: bottomRightRadius },
        antiAlias: true,
        autoPad: true,
        validTags: ["div"]  }
    $(elementStr).corner(settings);
}

function changeRegInput(el, value)
{
    if(atrim(el.value) == value)
    {
        el.value='';
        $(el).removeClass('grey');
        $(el).addClass('black');
    }
    else if(atrim(el.value).length == 0)
    {
        el.value = value;
        $(el).removeClass('black');
        $(el).addClass('grey');
    }
}

function resetDialogBox( popupBoxId , contentPageUrl )
{
    $.post( contentPageUrl, null, function( data )
    {
        $( "#"+popupBoxId ).html( data );
    } );
}

(function( $, undefined ) {
    if ($.ui && $.ui.dialog) {
        $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function(event) { return event + '.dialog-overlay'; }).join(' ');
    }
}(jQuery));

if(!String.linkify) {
    String.prototype.linkify = function() {
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;
        return this
            .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

//VOTES

function showAddVoteDialog(id) {
    var addVoteBox = $('#addVoteBox').detach();
    $("#addVotesButton").append(addVoteBox);
    addVoteBox.show();
}

function parseResponse(response, equalSign) {
    var parsedResponse = [];
    var splittedResponse = response.split(";");

    for (var responseLine in splittedResponse) {
        parsedResponse.push([splittedResponse[responseLine].split(equalSign)[0],
            splittedResponse[responseLine].split(equalSign)[1]]);

    }
    return parsedResponse;
}

function getUploadResult(parsedResponse, key) {
    key = key.trim();
    for (var responseParameterIndex in parsedResponse) {
        if (key == parsedResponse[responseParameterIndex][0].trim()) {
            return parsedResponse[responseParameterIndex][1];
        }
    }
    return false;
}

//END VOTES

function checkWidthForMobileDevices() {
    var screenWidth = document.body.clientWidth;
    var stickyNavigation = $('#stickyNavigation');
    var topBanner = $('.topBanner');
    if (screenWidth > 1300) {
        topBanner.css('left','480px');
        stickyNavigation.css({'position':'fixed', 'top': 0, 'left': 0});
    } else {
        stickyNavigation.css('position','static');
        topBanner.css('left','320px');
    }
}

function loadSubcategoryDescription(categoryOID, encodedCategoryDescriptionUrl) {
    $('.scroll-pane').empty();
    $.ajax({
        url: encodedCategoryDescriptionUrl,
        data: {
            'categoryOID': categoryOID
        },
        success: function(html) {
            updatePanel(html);
            checkDescriptionPanelHeight();
        }
    });
}

function isHistoryApiAvailable() {
    return (window.history && history.replaceState);
}
