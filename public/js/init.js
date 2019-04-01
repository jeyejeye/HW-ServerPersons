function ready() {
  
    requestRefreshAllEntries()
    .then(response => parseData(response))
        .then(response => renderTable())
        .catch(error => {
            console.log(error); // Error: Not Found
          });
     
    //Внутри этого метода dataArr нормально заполняется с сервера. А потом неожиданно его длинна становится = 0

//    alert('Почему то dataArr.length = ' + dataArr.length);

}

document.addEventListener("DOMContentLoaded", ready);
