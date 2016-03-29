$ ->
  toRemoveElements = '.saleListBox, #mailingCreateButton, .noItemsBox, .marketActionTopInfo, .worksheetHeaderCategory, .marketActionItemDiscount'
  toHideElements = '#mailingCreateButton, #topNavigation'
  window.mlSelected = 0

  getUrl = ->
    url = 'http://' + window.location.hostname
    url += ':' + window.location.port if window.location.port
    return url
  
  campaignJspUrl = getUrl() + '/znijki/div/admin/mailing/campaign.jsp'

  # Replacing browser url
  replaceUrl = (id) ->
    window.history.pushState {}, "", (campaignJspUrl + '?cid=' + window.mlId)

  # Resuming State
  resumeState = ->
    ($ '#MLtitleInput').val window.mlName
    actions = window.mlData.split(' ')
    while actions.length > 0
      action = actions.splice(0, 2)
      actionId = action[0]
      catId = action[1]
      # We use [id^=..] instead of #.. becase there can be two same market actions that end with -dup..
      selector = '#categoryBox' + catId + ' [id^="galleryMarketAction' + actionId + '"] .marketActionCheckBox'
      $(selector).mousedown().click()

  # Extract id of category or marketAction
  extractId = (str) ->
    @rx ?= /(\d+)/
    return parseInt(str.match(@rx)[0])
  
  getMailingListHtml = (previewUrl, data, isSitePreview, callback) ->          
    data['isSitePreview'] = isSitePreview    
    $.ajax
      type: "POST"
      url: previewUrl
      data: data
      beforeSend: ->
        toggleLoader()
      success: (html) ->        
        if isSitePreview
          window.siteHtml = html
        else
          window.emailHtml = html        
        callback() if window.siteHtml and window.emailHtml 
        toggleLoader()

  # Showing and hiding loader
  toggleLoader = ->
    dataImg = ($ '#loading').attr('data-src')
    if dataImg
      $('#loading').attr 'src', dataImg
      $('#loading').attr 'data-src', ''
    else
      $('#loading').attr 'data-src', $('#loading').attr 'src'
      $('#loading').attr 'src', ''  
  
  ($ '#mailingCreateButton').click ->
    # Drawing the panel.
    ($ 'body').prepend '<div id="MLheaderContainer">
      <div id="MLheader">
        <h1>Создание рассылки</h1>
        <img id="loading" src="' + getUrl() + '"/znijki-media/ajax-loader.gif" widht="16" height="16" />
        <label for="MLtitleInput">Название:</label>
        <input id="MLtitleInput"></input>
        <span id="MLselectedText">Выбрано акций: </span>
        <span id="MLselected">0</span>
        <a href="#" id="MLpreview">Предпросмотр</a>
        <a href="#" id="MLclose">[x]</a>
      </div>
    </div>'
    # Hiding the noise.
    ($ toHideElements).hide()
    ($ toRemoveElements).remove()
    ($ '#mainContent').css('padding-top', 0)

    ($ '.categoryBox:first').css('padding-top', '20px')    
    # Expanding the market action lists.
    ($ '.subCategories a.all').click()
    ($ '.categoryBox:not(.expanded)').find('.expander a').click()    

    # Adding the checkboxes
    ($ '.categoryBox').each ->
      $this = ($ @)
      categoryId = extractId $this.attr 'id'
      $this.find('.galleryMarketActionItem').each ->
        $this = ($ @)
        hash = $this.attr 'id'
        id = extractId hash
        $this.find('.marketActionItemTitle').attr('onclick', -> false)
        $this.prepend '<input type="checkbox" class="marketActionCheckBox" data-category-id="' + categoryId +
                      '" data-id="' + id + '" />'
    
    # Tracking count of selected market actions
    ($ '.marketActionCheckBox').mousedown (event) ->
      if ($ @).is(':checked')
        window.mlSelected--
      else
        window.mlSelected++
      ($ '#MLselected').text window.mlSelected
      if window.mlSelected > 0
        ($ '#MLpreview').css('color', '#FF9933')
      else
        ($ '#MLpreview').css('color', '#555')
    
    # Marking checkboxes on click
    $('.marketActionItemImg a').click ->
      ($ @)
        .parents('.marketActionItem')
        .siblings('.marketActionCheckBox')
        .mousedown()
        .click()
      false    

    # Creating temporary mailing list object    
    if window.mlAutoload
      resumeState();
    else
      $.ajax
        type: 'POST'
        url: campaignJspUrl
        data: { 'action': 'new' }
        success: (data) ->
          window.mlId = parseInt(data)          
          setTimeout( replaceUrl, 500 )
          toggleLoader()                
      
    # Preview button handling
    ($ '#MLpreview').click ->     
      data = {}                  
      $checkboxes = ($ '.marketActionCheckBox:checked')
      if $checkboxes.length > 0
        toggleLoader()      
        marketActionsParam = ''
        prevCat = ''        

        $checkboxes.each (i) ->
          marketActionsParam += ' ' unless i == 0
          id = ($ @).attr('data-id')
          catId = ($ @).attr('data-category-id')  
          marketActionsParam += id + ' ' + catId                    
        
        previewUrl = getUrl() + '/znijki/div/admin/mailing/preview.jsp'
        window.mlData = marketActionsParam
        data['cid'] = window.mlId
        data['mlData'] = marketActionsParam
        data['title'] = ($ '#MLtitleInput').val()
        
        showPreviewPopup = ->          
          $('#MLresult').html '<div id="MLpreviewHeader"><a href="#" id="MLsave">Сохранить</a></div>' + window.emailHtml
          showDialog('MLresult', 800, 'auto', false, false, 'center', true)          
          $('body').css('background-color', '#EDEDED') # preventing background change
          # Save button handling
          ($ '#MLsave').click ->
            if confirm('Вы уверены?')              
              $.ajax
                type: 'POST'
                url: getUrl() + '/znijki/div/admin/mailing/create.jsp'
                data:
                  "campaignId" : window.mlId                  
                  "siteHtml" : window.siteHtml
                  "emailHtml" : window.emailHtml
                beforeSend: ->
                  toggleLoader() 
                success: (html) ->
                  toggleLoader()
                  ($ 'body').append html                                                    
        
        getMailingListHtml(previewUrl, data, true, showPreviewPopup)
        getMailingListHtml(previewUrl, data, false, showPreviewPopup)
        
        
    # Close button handling
    ($ '#MLclose').click ->      
      window.location.assign getUrl() + '/znijki/index.jsp'

  ($ '#mailingCreateButton').click() if window.mlAutoload
    
    