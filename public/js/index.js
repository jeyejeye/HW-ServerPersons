
// model

const dataArr = [];

function addEntry(id, fName, lName, age) {
  const person = {};
  person.id = id;
  person.fName = fName;
  person.lName = lName;
  person.age = age;
  dataArr.push(person);
}

function updEntry(indArr, fName, lName, age) {
  var user = dataArr[indArr];
  fName === '' ? user.fName = user.fName : user.fName = fName;
  lName === '' ? user.lName = user.lName : user.lName = lName;
  age === '' ? user.age = user.age : user.age = age;
}

function delEntry(indArr) {
  dataArr.splice(indArr, 1);
}

function clearData() {
  dataArr.length = 0;
}

function saveDataLS() {
  console.log(JSON.stringify(dataArr));
  localStorage.setItem('data', JSON.stringify(dataArr));
}

function parseData(json) {
  const allData = JSON.parse(json);
    for (let i = 0; i < allData.rows.length; i++) {
      addEntry(allData.rows[i].ID, allData.rows[i].FNAME, allData.rows[i].LNAME, allData.rows[i].AGE);
     } 
     document.getElementById('toolbar__caption').innerHTML += allData.user[0].NAME;
}

// отправка строки для записи в БД
function requestRefreshAllEntries() {
  return new Promise(function(resolve, reject) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');  
      console.log(this.response);   
      resolve(this.response);
    }
  };
  request.open("POST", "/refreshAllEntries", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send();
})
}


function requestAddNewEntry(id, fName, lName, age) {
  let formData = '&id=' + encodeURIComponent(id);
  formData += '&fName=' + encodeURIComponent(fName);
  formData += '&lName=' + encodeURIComponent(lName);
  formData += '&age=' + encodeURIComponent(age);
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');
    }
  };
  request.open("POST", "/addNewEntry", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(formData);
}

function requestUpdateEntry(id, fName, lName, age) {
  let formData = '&id=' + encodeURIComponent(id);
  formData += '&fName=' + encodeURIComponent(fName);
  formData += '&lName=' + encodeURIComponent(lName);
  formData += '&age=' + encodeURIComponent(age);
  console.log(formData);
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');
    }
  };
  request.open("POST", "/updateEntry", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(formData);
};

function requestRemoveEntry(id) {
  let formData = '&id=' + encodeURIComponent(id);
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');
    }
  };
  request.open("POST", "/removeEntry", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(formData);
}

function requestClearEntry() {
  let formData = '&clear=true';
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');
    }
  };
  request.open("POST", "/clearEntry", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(formData);
}

// veiw

const inputId = document.querySelector('#id');
const fName = document.querySelector('#fname');
const lName = document.querySelector('#lname');
const age = document.querySelector('#age');
const tableBody = document.querySelector('#tableBody');
const msgBox = document.querySelector('#msgBox');

function renderTable() {
  let insertData = '';

  for (let i = 0; i < dataArr.length; i++) {
    insertData += "<div class=\"row\">\n            <div class=\"col-2\">".concat(dataArr[i].id, "</div>\n            <div class=\"col-4\">").concat(dataArr[i].fName, "</div>\n            <div class=\"col-4\">").concat(dataArr[i].lName, "</div>\n            <div class=\"col-2\">").concat(dataArr[i].age, "</div>\n        </div>");
  }
  tableBody.innerHTML = insertData;
  return true;
}

function clearInput() {
  inputId.value = '';
  fName.value = '';
  lName.value = '';
  age.value = '';
  return true;
}

function renderMsg(msg) {
  if (msg) {
    msgBox.innerText = `${msg} - incorrect `;
  } else {
    msgBox.innerText = '';
  }
}

//controller

// кнопка create
function createEntry() {
  let id = inputId.value;

  if (check(id) && checkIdInArr(id) === -1) {
    addEntry(+id, fName.value, lName.value, age.value);
    requestAddNewEntry(+id, fName.value, lName.value, age.value);
    renderMsg();
    renderTable();
    clearInput();
  } else {
    renderMsg(id);
  }
}

// кнопка update
function updateEntry() {
  const id = inputId.value;
  const indArr = checkIdInArr(id);

  if (check(id) && indArr > -1) {
    updEntry(indArr, fName.value, lName.value, age.value);
    requestUpdateEntry(id, fName.value, lName.value, age.value);
    renderMsg();
    renderTable();
    clearInput();
  } else {
    renderMsg(id);
  }
}

// кнопка delete
function deleteEntry() {
  const id = inputId.value;
  const indArr = checkIdInArr(id);

  if (check(id) && indArr > -1) {
    delEntry(indArr);
    requestRemoveEntry(id);
    renderMsg();
    renderTable();
    clearInput();
  } else {
    renderMsg(id);
  }
}

// кнопка clear
function clearAll() {
  clearData();
  clearInput();
  requestClearEntry();
  renderMsg();
  renderTable();
}

function checkIdInArr(id) {
  for (let i = 0; i < dataArr.length; i++) {
    if (dataArr[i].id === +id) {
      return i;
    }
  }
  return -1;
}

function check(id) {
  if (!id) {
    return false;
  }

  if (parseInt(id) !== +id) {
    return false;
  }

  return true;
}





