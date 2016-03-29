function showSaleDialog(saleID) {
    readSaleInfoToBlock('saleContainer',
        window.location.protocol + '//' + window.location.host + '/znijki/div/common/sale_full_info.jsp?id=' +  saleID);
}

function readSaleInfoToBlock(blockId, url) {
    $.ajax({
        type:'GET',
        url:url,
        success:function (data) {
            $('#' + blockId).html(data);
            showDialog('saleContainer', 700, 'auto', false, false, 'center', true);
        }
    });
}