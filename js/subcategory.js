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
    var catBox, href, isBottom, teasers, visibleCount;
    isBottom = $(this).parent().hasClass('bottom');
    catBox = $(this).parent().parent();
    href = $(this).attr('href');
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
        $(catBox).children('.subCategories').children('a').each(function() {
          if ($(this).attr('href') === href) {
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
        $(catBox).children('.subCategories').children('a').each(function() {
          return $(this).removeClass('active');
        });
        $(this).addClass('active');
      }
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
    href = $(this).attr('href');
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
    catBoxId = $(this).attr('href');
    if ($(catBoxId).attr('data-filter')) {
      $(catBoxId + ' .subCategories a.active').first().click();
    } else {
      $(catBoxId + ' .expander a').click();
    }
    return false;
  };
  $('.categoryBox .subCategories a').click(onSubFilterLinkClick);
  $('.categoryBox h1 a').click(onHeaderClick);
  return $(expanderClass + ' a').click(onExpanderClick);
});
