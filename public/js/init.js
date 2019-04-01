function ready() {
    requestRefreshAllEntries();
    //Внутри этого метода dataArr нормально заполняется с сервера. А потом неожиданно его длинна становится = 0

//    alert('Почему то dataArr.length = ' + dataArr.length);

    renderTable();
}

document.addEventListener("DOMContentLoaded", ready);
