
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
  const user = dataArr[indArr];

  if (fName !== '') {
    user.fName = fName;
  }

  if (lName !== '') {
    user.lName = lName;
  }

  if (age !== '') {
    user.age = age;
  }
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

// отправка строки для записи в БД
function requestRefreshAllEntries() {
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log('удачно');
      const allData = JSON.parse(this.responseText);

      //Очистка всех предыдущих данных из таблицы
      //....

      for (let i = 0; i < allData.rows.length; i++) {
        addEntry(allData.rows[i].ID, allData.rows[i].FNAME, allData.rows[i].LNAME, allData.rows[i].AGE);
      }
    }
  };
  request.open("POST", "/refreshAllEntries", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send();
}


function requestAddNewEntry(id, fName, lName, age) {
  let userID = '1';
  let formData = 'userID=' + encodeURIComponent(userID);
  formData += '&id=' + encodeURIComponent(id);
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
  let userID = '1';
  let formData = 'userID=' + encodeURIComponent(userID);
  formData += '&id=' + encodeURIComponent(id);
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
}

function requestRemoveEntry(id) {
  let userID = '1';
  let formData = 'userID=' + encodeURIComponent(userID);
  formData += '&id=' + encodeURIComponent(id);
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
  let userID = '1';
  let formData = 'userID=' + encodeURIComponent(userID);
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

  return parseInt(id) === +id;
}




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
