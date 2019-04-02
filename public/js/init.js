function ready() {
  
    requestRefreshAllEntries()
    .then(response => parseData(response))
        .then(response => renderTable())
        .catch(error => {
            console.log(error); // Error: Not Found
          });

}

document.addEventListener("DOMContentLoaded", ready);
document.addEventListener('click', function (event) {
    let target = event.target;
  
    if (target.tagName !== 'BUTTON') {
      return;
    }
    if (target.id === 'createBtn') {
      createEntry();
    }
    if (target.id === 'updateBtn') {
      updateEntry();
    }
    if (target.id === 'removeBtn') {
      deleteEntry();
    }
    if (target.id === 'clearBtn') {
      clearAll();
    }
    if (target.id === 'saveBtn') {
      saveDataLS();
    }
  });
  
