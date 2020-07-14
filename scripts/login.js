document.addEventListener("DOMContentLoaded", () => {
  const logInForm = document.querySelector(".login-form");
  const signupErrors = document.querySelector('.signup-errors');

  logInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(logInForm);
    const username = formData.get("username");
    const password = formData.get("password");
    const body = { username, password };

    try {

      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        throw res;
      } 
  
      const { token } = await res.json();
      localStorage.setItem("NOISEWAVE_ACCESS_TOKEN", token);
  
      window.location.href= '/explore';

    } catch (res) {
      const loginErrors = document.querySelector('.login-errors');
      // console.log('not valid login', err)
      // //reload form with error messages
      const errors = await res.json();
      loginErrors.innerText = errors.message;
      loginErrors.classList.add('errors')
    }
  });
});
