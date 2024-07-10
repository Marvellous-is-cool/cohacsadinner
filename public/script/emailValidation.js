document.addEventListener("DOMContentLoaded", function () {
  var emailInput = document.getElementById("email");
  var emailError = document.getElementById("emailError");
  var continueButton = document.getElementById("continueButton");

  emailInput.addEventListener("input", function () {
    var email = this.value;
    var isValidEmail = validateEmail(email);

    if (isValidEmail) {
      // If valid, update text to green and enable Continue button
      emailError.textContent = "Valid email, click on Continue now.";
      emailError.classList.remove("text-danger");
      emailError.classList.add("text-success");
      continueButton.style.display = "block";
    } else {
      // If not valid, update text to red and hide Continue button
      emailError.textContent = "Invalid email: " + email;
      emailError.classList.remove("text-success");
      emailError.classList.add("text-danger");
      continueButton.style.display = "none";
    }
  });

  function validateEmail(email) {
    // Basic email validation using a regular expression
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
