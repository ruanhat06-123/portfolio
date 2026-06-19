// ==============================
// SUPABASE SETTINGS
// ==============================
// Public publishable/anon key is okay for frontend use.
// NEVER use your service_role key in frontend JavaScript.

const SUPABASE_URL = "https://dvjosisqpvopbxcglwhl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0LJnUqBnCZohvWoIFn5NWA_B3UtoKFv";

let supabaseClient = null;

if (
  typeof supabase !== "undefined" &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY
) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("Supabase library was not loaded. Check the Supabase script tag in projects.html.");
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
  setupContactForm();
  setupButtonAnimations();
  setupCustomDropdown();
  loadProjects();

  console.log("Public JS Loaded:", document.title);
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
      !url.startsWith("#") &&
      !link.hasAttribute("target")
    ) {
      link.addEventListener("click", event => {
        event.preventDefault();

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

  // Only run on projects.html
  if (!projectsContainer) return;

  if (!projectsStatus) {
    console.error("Missing #projects-status element in projects.html.");
    return;
  }

  if (!supabaseClient) {
    projectsStatus.textContent =
      "Supabase is not connected. Check the Supabase CDN script and main.js settings.";
    return;
  }

  projectsStatus.textContent = "Loading projects...";

  try {
    const { data: projects, error } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase project load error:", error);
      projectsStatus.textContent =
        "Failed to load projects from the database. Check your Supabase RLS policies.";
      return;
    }

    console.log("Projects loaded from Supabase:", projects);

    if (!projects || projects.length === 0) {
      projectsStatus.textContent =
        "No published projects found. Make sure your project is marked as published in the admin dashboard.";
      projectsContainer.innerHTML = "";
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
    projectsStatus.textContent =
      "Something went wrong while loading projects.";
  }
}

// ==============================
// CREATE PROJECT CARD
// ==============================
function createProjectCard(project) {
  const section = document.createElement("section");
  section.classList.add("project-card");

  const title = document.createElement("h2");
  title.textContent = project.title || "Untitled Project";

  const description = document.createElement("p");
  description.textContent = project.description || "No description available.";

  const techList = document.createElement("ul");

  const technologies = normalizeTechnologies(project.technologies);

  technologies.forEach(technology => {
    const li = document.createElement("li");
    li.textContent = technology;
    techList.appendChild(li);
  });

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("project-links");

  const links = normalizeLinks(project.links);

  links.forEach(link => {
    if (!link.label || !link.url) return;

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.textContent = link.label;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    linksContainer.appendChild(anchor);
  });

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
// NORMALIZE TECHNOLOGIES
// ==============================
function normalizeTechnologies(technologies) {
  if (Array.isArray(technologies)) {
    return technologies;
  }

  if (typeof technologies === "string") {
    return technologies
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

// ==============================
// NORMALIZE LINKS
// ==============================
function normalizeLinks(links) {
  if (Array.isArray(links)) {
    return links;
  }

  if (typeof links === "string") {
    try {
      const parsedLinks = JSON.parse(links);
      return Array.isArray(parsedLinks) ? parsedLinks : [];
    } catch (error) {
      console.error("Could not parse project links:", error);
      return [];
    }
  }

  return [];
}

// ==============================
// CONTACT FORM HANDLING
// ==============================
function setupContactForm() {
  const form = document.querySelector("form");

  if (!form) return;

  // Only handle your Formspree contact form
  if (!form.action || !form.action.includes("formspree.io")) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

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
      console.error("Contact form error:", error);
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

  selectedBox.addEventListener("click", event => {
    event.stopPropagation();
    dropdown.classList.toggle("active");
  });

  options.forEach(option => {
    option.addEventListener("click", () => {
      selectedText.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;
      dropdown.classList.remove("active");
    });
  });

  document.addEventListener("click", event => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });
}
