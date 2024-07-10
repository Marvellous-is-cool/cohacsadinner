// copyLink.js
document.addEventListener("DOMContentLoaded", function () {
  const copyLinkButton = document.getElementById("copyLinkButton");

  copyLinkButton.addEventListener("click", function () {
    // Get the current page URL and copy it to the clipboard
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL);

    // Disable the button and change its text to "Copied!"
    copyLinkButton.disabled = true;
    copyLinkButton.textContent = "Copied!";
  });
});
