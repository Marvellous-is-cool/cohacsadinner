// search.js
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const contestantsContainer = document.getElementById("contestantsContainer");
  const contestantCards =
    contestantsContainer.querySelectorAll(".contestant-card");
  let noResultsMessage = null;

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    let noResults = true;

    contestantCards.forEach(function (card) {
      const nickname = card.querySelector(".nickname").innerText.toLowerCase();

      if (nickname.includes(searchTerm)) {
        card.style.display = "block";
        noResults = false;
      } else {
        card.style.display = "none";
      }
    });

    // Show or update the no results message
    if (noResults) {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.classList.add("mt-3", "text-danger");
        contestantsContainer.appendChild(noResultsMessage);
      }
      noResultsMessage.innerText = `No contestant with the username "${searchTerm}" found.`;
    } else {
      // Remove the no results message if it exists
      if (noResultsMessage) {
        noResultsMessage.remove();
        noResultsMessage = null;
      }
    }
  });
});
