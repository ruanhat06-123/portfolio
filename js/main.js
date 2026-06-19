// ==============================
// SUPABASE SETTINGS
// ==============================
// Replace these with your actual Supabase project values.
const SUPABASE_URL = "https://dvjosisqpvopbxcglwhl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0LJnUqBnCZohvWoIFn5NWA_B3UtoKFv";

let supabaseClient = null;

if (
  typeof supabase !== "undefined" &&
  SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==============================
// RUN WHEN PAGE LOADS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  // Feather icons
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Smooth page entry
  document.body.classList.add("slide-in");

  setTimeout(() => {
    document.body.classList.remove("slide-in");
  }, 50);

  setupPageTransitions();
  setupFormHandling();
  setupButtonAnimations();
  setupCustomDropdown();
  loadProjects();

  console.log("JS Loaded:", document.title);
});

// ==============================
// PAGE TRANSITION
// ==============================
function setupPageTransitions() {
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
        }, 500);
      });
    }
  });
}

// ==============================
// LOAD PROJECTS FROM SUPABASE
// ==============================
async function loadProjects() {
  const projectsContainer = document.getElementById("projects-container");
  const projectsStatus = document.getElementById("projects-status");

  // Only run this code on projects.html
  if (!projectsContainer) return;

  if (!supabaseClient) {
    projectsStatus.textContent =
      "Supabase is not connected yet. Please add your Supabase URL and anon key in main.js.";
    return;
  }

  try {
    const { data: projects, error } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      projectsStatus.textContent = "Failed to load projects from the database.";
      return;
    }

    if (!projects || projects.length === 0) {
      projectsStatus.textContent = "No projects found.";
      return;
    }

    projectsStatus.style.display = "none";
    projectsContainer.innerHTML = "";

    projects.forEach(project => {
      const projectCard = createProjectCard(project);
      projectsContainer.appendChild(projectCard);
    });

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  } catch (error) {
    console.error("Project loading error:", error);
    projectsStatus.textContent = "Something went wrong while loading projects.";
  }
}

// ==============================
// CREATE PROJECT CARD
// ==============================
function createProjectCard(project) {
  const section = document.createElement("section");
  section.classList.add("project-card");

  const title = document.createElement("h2");
  title.textContent = project.title;

  const description = document.createElement("p");
  description.textContent = project.description;

  const techList = document.createElement("ul");

  if (Array.isArray(project.technologies)) {
    project.technologies.forEach(technology => {
      const li = document.createElement("li");
      li.textContent = technology;
      techList.appendChild(li);
    });
  }

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("project-links");

  if (Array.isArray(project.links)) {
    project.links.forEach(link => {
      if (!link.label || !link.url) return;

      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      linksContainer.appendChild(anchor);
    });
  }

  section.appendChild(title);
  section.appendChild(description);

  if (techList.children.length > 0) {
    section.appendChild(techList);
  }

  if (linksContainer.children.length > 0) {
    section.appendChild(linksContainer);
  }

  return section;
}

// ==============================
// FORM HANDLING
// ==============================
function setupFormHandling() {
  const form = document.querySelector("form");

  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const subjectInput = document.getElementById("subject");

    if (subjectInput && subjectInput.value.trim() === "") {
      alert("Please select a subject.");
      return;
    }

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        alert("Message sent successfully!");
        form.reset();

        const selectedText = document.querySelector(".selected-text");

        if (selectedText) {
          selectedText.textContent = "Select Subject";
        }
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Form error:", error);
      alert("Something went wrong. Please check your connection and try again.");
    }
  });
}

// ==============================
// BUTTON CLICK ANIMATION
// ==============================
function setupButtonAnimations() {
  document.querySelectorAll(".buttons a").forEach(button => {
    button.addEventListener("click", () => {
      button.classList.add("active");

      setTimeout(() => {
        button.classList.remove("active");
      }, 300);
    });
  });
}

// ==============================
// CUSTOM DROPDOWN
// ==============================
function setupCustomDropdown() {
  const dropdown = document.querySelector(".custom-dropdown");

  // Prevent JavaScript from breaking on pages without the dropdown
  if (!dropdown) return;

  const selectedText = dropdown.querySelector(".selected-text");
  const options = dropdown.querySelectorAll(".options div");
  const hiddenInput = document.getElementById("subject");
  const selectedBox = dropdown.querySelector(".selected");

  if (!selectedText || !hiddenInput || !selectedBox) return;

  selectedBox.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  options.forEach(option => {
    option.addEventListener("click", () => {
      selectedText.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;
      dropdown.classList.remove("active");
    });
  });

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}