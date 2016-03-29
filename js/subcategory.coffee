# Author: v.rybakov
# Dated: 2011.12.30
# this coffee was compiled into js that can be found in /znijki-web/layout/common.jsp
# To get more information on CoffeeScript visit http://jashkenas.github.com/coffee-script/

$ ->
  teaserWrapperClass = '.galleryMarketActionItem'
  teaserImgClass = '.marketActionItemImg'
  expanderClass = '.expander'
  
  ###
    Solving trouble with duplicate ids
  ###

  ids = []
  $(teaserWrapperClass).each (i)->
    @id += '-dup' + i unless $.inArray( @id, ids ) == -1
    ids.push @id

  ###
    Expand/Collapse/Filter through subcategories
  ###

  ninjaShow = (e) ->
    img = $(e).children('.marketActionItem').children(teaserImgClass)
    ninjaStyle = img.attr 'data-style'
    if ninjaStyle
      img.attr 'style', ninjaStyle
      img.removeAttr 'data-style'
    $(e).show()

  onSubFilterLinkClick = ->
    isBottom = $(@).parent().hasClass('bottom')
    catBox = $(@).parent().parent()
    href = $(@).attr 'href'
    teasers = $(catBox).children('.content').children(teaserWrapperClass)

    unless $(@).hasClass('active')
      unless $(@).hasClass('all')
        $(catBox).attr 'data-filter', href
        $(catBox).addClass('expanded')
        $(catBox).children(expanderClass).children('a').text('Свернуть▲')
        $(teasers).each ->
          if $(@).hasClass(href)
            ninjaShow @
          else
            $(@).hide()
        $(catBox).children('.subCategories').children('a').each ->
          if $(@).attr('href') == href
            $(@).addClass 'active'
          else
            $(@).removeClass 'active'
        window.location.hash = $(catBox).attr('id') if isBottom
      else
        $(teasers).each ->
          ninjaShow @
        $(catBox).removeAttr 'data-filter'
        $(catBox).children('.subCategories').children('a').each ->
          $(@).removeClass('active')
        $(@).addClass('active')
    
    visibleCount = teasers.not(':hidden').length
    if visibleCount >= 9
      $(catBox).children('.subCategories.bottom').show()
    else
      $(catBox).children('.subCategories.bottom').hide()

    return false

  onExpanderClick = ->
    showCollapsedCount = 3
    href = $(@).attr 'href'
    catBox = $(href)
    showCount = $(catBox).attr('data-show-count')
    showCollapsedCount = parseInt(showCount) if showCount
    teasers = $(catBox).children('.content').children(teaserWrapperClass)
    filterString = ''
    filterString = '.' + $(catBox).attr('data-filter') if $(catBox).attr('data-filter')
    $(catBox).toggleClass('expanded')
    if $(catBox).hasClass('expanded')
      $(catBox).children(expanderClass).children('a').text('Свернуть▲')
      $(teasers).filter(filterString+':hidden').each ->
        ninjaShow @
      $(catBox).children('.subCategories.bottom').show() if teasers.length >= 9
      return false
    else
      $(catBox).children(expanderClass).children('a').text('Посмотреть весь раздел▼')
      $(teasers).filter(filterString+':visible').each (i) ->
        $(@).hide() if i >= showCollapsedCount
      $(catBox).children('.subCategories.bottom').hide()
      return true

  onHeaderClick = ->
    catBoxId = $(this).attr 'href'
    if $(catBoxId).attr('data-filter')
      $(catBoxId + ' .subCategories a.active').first().click()
    else
      $(catBoxId + ' .expander a').click()
    return false


  $('.categoryBox .subCategories a').click onSubFilterLinkClick
  $('.categoryBox h1 a').click onHeaderClick
  $(expanderClass + ' a').click onExpanderClick