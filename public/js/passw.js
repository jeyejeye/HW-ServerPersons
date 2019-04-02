message = document.getElementById('message');
password = document.getElementById('password');
repeatPassword = document.getElementById('repeatPassword');
signUpBtn = document.getElementById('signUpBtn');

repeatPassword.addEventListener('keyup', ()=>{
  if (password.value === repeatPassword.value) {
    message.style.display = "none";
    signUpBtn.disabled = false;
  } else {
    message.style.display = "block";
    signUpBtn.disabled = true;
  }
})