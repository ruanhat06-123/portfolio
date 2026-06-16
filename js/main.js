// ==============================
// ✅ RUN WHEN PAGE LOADS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  
  // ✅ Feather icons fix (VERY IMPORTANT)
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // ✅ Smooth page entry (scroll-in effect)
  document.body.classList.add("slide-in");

  setTimeout(() => {
    document.body.classList.remove("slide-in");
  }, 50);

});


// ==============================
// ✅ PAGE TRANSITION (SCROLL EFFECT)
// ==============================
document.querySelectorAll("a[href]").forEach(link => {
  const url = link.getAttribute("href");

  if (
    url &&
    !url.startsWith("http") &&
    !url.startsWith("mailto") &&
    !link.hasAttribute("target")
  ) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      document.body.classList.add("slide-out");

      setTimeout(() => {
        window.location.href = url;
      }, 500); // matches CSS timing
    });
  }
});


// ==============================
// ✅ FORM HANDLING (FORMSPREE)
// ==============================
const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      alert("✅ Message sent successfully!");
      form.reset();
    } else {
      alert("❌ Failed to send message.");
    }
  });
}


// ==============================
// ✅ BUTTON CLICK ANIMATION
// ==============================
document.querySelectorAll(".buttons a").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.add("active");
    setTimeout(() => button.classList.remove("active"), 300);
  });
});


// ==============================
// ✅ DEBUG (OPTIONAL)
// ==============================
console.log("✅ JS Loaded:", document.title);

//===============================
//Smooth drop down menu on the contact page
//===============================
const dropdown = document.querySelector(".custom-dropdown");
const selectedText = dropdown.querySelector(".selected-text");
const options = dropdown.querySelectorAll(".options div");
const hiddenInput = document.getElementById("subject");

// Toggle dropdown
dropdown.querySelector(".selected").addEventListener("click", () => {
  dropdown.classList.toggle("active");
});

// Select option
options.forEach(option => {
  option.addEventListener("click", () => {
    selectedText.textContent = option.textContent;
    hiddenInput.value = option.dataset.value;
    dropdown.classList.remove("active");
  });
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});