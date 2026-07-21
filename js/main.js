// ==============================
// SUPABASE SETTINGS
// ==============================
// Public publishable key is okay for frontend use.
// NEVER use your service_role key in frontend JavaScript.

const SUPABASE_URL = "https://dvjosisqpvopbxcglwhl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0LJnUqBnCZohvWoIFn5NWA_B3UtoKFv";

let supabaseClient = null;
let allProjects = [];

// Create Supabase client
if (typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase client created successfully.");
} else {
  console.error("Supabase library is not loaded. Check your script tags.");
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
  setupTechnologyFilter();

  loadProjects();
  loadTestimonials();

  console.log("Public JS loaded:", document.title);
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
// SETUP TECHNOLOGY FILTER
// ==============================
function setupTechnologyFilter() {
  const technologyFilter = document.getElementById("technology-filter");

  if (!technologyFilter) return;

  technologyFilter.addEventListener("change", () => {
    const selectedTechnology = technologyFilter.value;
    renderProjects(selectedTechnology);
  });
}

// ==============================
// LOAD PROJECTS FROM SUPABASE
// ==============================
async function loadProjects() {
  const projectsContainer = document.getElementById("projects-container");
  const projectsStatus = document.getElementById("projects-status");

  // Only run this on projects.html
  if (!projectsContainer) return;

  if (!projectsStatus) {
    console.error("Missing #projects-status element in projects.html.");
    return;
  }

  if (!supabaseClient) {
    projectsStatus.textContent =
      "Supabase is not connected. Check your Supabase script tag and main.js settings.";

    console.error("Supabase client was not created.");
    return;
  }

  projectsStatus.style.display = "block";
  projectsStatus.textContent = "Loading projects...";

  try {
    const { data: projects, error } = await supabaseClient
      .from("projects")
      .select(
        "id, title, description, technologies, links, display_order, is_featured, is_published, created_at"
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase project load error:", error);

      projectsStatus.textContent =
        "Failed to load projects from the database. Check the browser console.";

      return;
    }

    console.log("Projects returned from Supabase:", projects);

    if (!projects || projects.length === 0) {
      projectsStatus.textContent =
        "No published projects found. Make sure your project has is_published set to true.";

      projectsContainer.innerHTML = "";
      return;
    }

    allProjects = projects;

    populateTechnologyFilter(allProjects);
    renderProjects("all");

    projectsStatus.style.display = "none";

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  } catch (error) {
    console.error("Project loading error:", error);

    projectsStatus.textContent =
      "Something went wrong while loading projects. Check the browser console.";
  }
}

// ==============================
// POPULATE TECHNOLOGY FILTER
// ==============================
function populateTechnologyFilter(projects) {
  const technologyFilter = document.getElementById("technology-filter");

  if (!technologyFilter) return;

  const technologiesSet = new Set();

  projects.forEach(project => {
    const technologies = normalizeTechnologies(project.technologies);

    technologies.forEach(technology => {
      technologiesSet.add(technology);
    });
  });

  const sortedTechnologies = Array.from(technologiesSet).sort((a, b) =>
    a.localeCompare(b)
  );

  technologyFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Projects";
  technologyFilter.appendChild(allOption);

  sortedTechnologies.forEach(technology => {
    const option = document.createElement("option");
    option.value = technology;
    option.textContent = technology;
    technologyFilter.appendChild(option);
  });
}

// ==============================
// RENDER PROJECTS
// ==============================
function renderProjects(selectedTechnology = "all") {
  const projectsContainer = document.getElementById("projects-container");
  const projectsStatus = document.getElementById("projects-status");

  if (!projectsContainer) return;

  projectsContainer.innerHTML = "";

  const filteredProjects =
    selectedTechnology === "all"
      ? allProjects
      : allProjects.filter(project => {
          const technologies = normalizeTechnologies(project.technologies);
          return technologies.includes(selectedTechnology);
        });

  if (!filteredProjects || filteredProjects.length === 0) {
    if (projectsStatus) {
      projectsStatus.style.display = "block";
      projectsStatus.textContent = `No projects found for ${selectedTechnology}.`;
    }

    return;
  }

  if (projectsStatus) {
    projectsStatus.style.display = "none";
  }

  filteredProjects.forEach(project => {
    const projectCard = createProjectCard(project);
    projectsContainer.appendChild(projectCard);
  });
}

// ==============================
// CREATE PROJECT CARD
// ==============================
function createProjectCard(project) {
  const section = document.createElement("section");
  section.classList.add("project-card");

  const title = document.createElement("h2");
  title.classList.add("project-card-title");
  title.textContent = project.title || "Untitled Project";

  const description = document.createElement("p");
  description.textContent = project.description || "No description provided.";

  const techList = document.createElement("ul");

  const technologies = normalizeTechnologies(project.technologies);

  technologies.forEach(technology => {
    const li = document.createElement("li");
    li.textContent = technology;
    techList.appendChild(li);
  });

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("project-links");

  const projectLinks = normalizeLinks(project.links);

  projectLinks.forEach(link => {
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
// LOAD TESTIMONIALS FROM SUPABASE
// ==============================
async function loadTestimonials() {
  const testimonialsContainer = document.getElementById("testimonials-container");
  const testimonialsStatus = document.getElementById("testimonials-status");

  // Only run this on index.html
  if (!testimonialsContainer) return;

  if (!supabaseClient) {
    if (testimonialsStatus) {
      testimonialsStatus.textContent =
        "Supabase is not connected. Testimonials could not be loaded.";
    }

    console.error("Supabase client was not created for testimonials.");
    return;
  }

  if (testimonialsStatus) {
    testimonialsStatus.style.display = "block";
    testimonialsStatus.textContent = "Loading testimonials...";
  }

  try {
    const { data: testimonials, error } = await supabaseClient
      .from("testimonials")
      .select(
        "id, author_name, author_role, quote, display_order, is_published, created_at"
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase testimonial load error:", error);

      if (testimonialsStatus) {
        testimonialsStatus.textContent =
          "Failed to load testimonials from the database.";
      }

      return;
    }

    console.log("Testimonials returned from Supabase:", testimonials);

    if (!testimonials || testimonials.length === 0) {
      if (testimonialsStatus) {
        testimonialsStatus.textContent = "Testimonials will be added soon.";
      }

      return;
    }

    testimonialsContainer.innerHTML = "";

    testimonials.forEach(testimonial => {
      const testimonialCard = createTestimonialCard(testimonial);
      testimonialsContainer.appendChild(testimonialCard);
    });
  } catch (error) {
    console.error("Testimonial loading error:", error);

    if (testimonialsStatus) {
      testimonialsStatus.textContent =
        "Something went wrong while loading testimonials.";
    }
  }
}

// ==============================
// CREATE TESTIMONIAL CARD
// ==============================
function createTestimonialCard(testimonial) {
  const card = document.createElement("article");
  card.classList.add("testimonial-card");

  const quoteIcon = document.createElement("div");
  quoteIcon.classList.add("quote-icon");
  quoteIcon.textContent = "“";

  const quote = document.createElement("p");
  quote.classList.add("testimonial-text");
  quote.textContent = testimonial.quote || "No testimonial provided.";

  const author = document.createElement("div");
  author.classList.add("testimonial-author");

  const authorName = document.createElement("h4");
  authorName.textContent = testimonial.author_name || "Anonymous";

  const authorRole = document.createElement("p");
  authorRole.textContent = testimonial.author_role || "Client";

  author.appendChild(authorName);
  author.appendChild(authorRole);

  card.appendChild(quoteIcon);
  card.appendChild(quote);
  card.appendChild(author);

  return card;
}

// ==============================
// NORMALIZE TECHNOLOGIES
// ==============================
function normalizeTechnologies(technologies) {
  if (Array.isArray(technologies)) {
    return technologies
      .map(item => String(item).trim())
      .filter(Boolean);
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
// FORM HANDLING
// ==============================
function setupFormHandling() {
  const form = document.querySelector("form");

  if (!form) return;

  // Only handle Formspree contact form
  if (!form.action || !form.action.includes("formspree.io")) {
    return;
  }

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