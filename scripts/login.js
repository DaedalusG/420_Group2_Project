const logInForm = document.querySelector(".log-in-form");

document.addEventListener("DOMContentLoaded", () => {
  logInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(logInForm);
    const email = formData.get("email");
    const password = formData.get("password");
    const body = { email, password };
    try {
      const res = await fetch("http://localhost:8080/users/login", {
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

      // redirect to home page to see explore page:
      window.location.href = "/explore";
    } catch (err) {
      console.log(`error with login. make custom error handler`);
    }
  });
});