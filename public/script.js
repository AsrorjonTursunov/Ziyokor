const courses = [
  {
    id: 1,
    name: "Frontend dasturlash",
    category: "it",
    categoryName: "DASTURLASH",
    icon: "</>",
    description: "HTML, CSS va JavaScript orqali saytlar yaratishni o‘rganing.",
  },
  {
    id: 2,
    name: "Backend dasturlash",
    category: "it",
    categoryName: "DASTURLASH",
    icon: "{ }",
    description:
      "Node.js, API va ma'lumotlar bazasi bilan ishlashni o‘rganing.",
  },
  {
    id: 3,
    name: "Python dasturlash",
    category: "it",
    categoryName: "DASTURLASH",
    icon: "Py",
    description: "Python, algoritmlar va dasturlash asoslarini o‘rganing.",
  },
  {
    id: 4,
    name: "Ingliz tili",
    category: "language",
    categoryName: "TILLAR",
    icon: "EN",
    description: "Ingliz tilida gapirish, grammatika va lug‘atni o‘rganing.",
  },
  {
    id: 5,
    name: "Rus tili",
    category: "language",
    categoryName: "TILLAR",
    icon: "RU",
    description: "Rus tilida muloqot qilish va grammatikani o‘rganing.",
  },
  {
    id: 6,
    name: "Matematika",
    category: "education",
    categoryName: "FANLAR",
    icon: "∑",
    description: "Matematik fikrlash va masalalar yechishni o‘rganing.",
  },
];

// Kurs kartochkalari
const courseGrid = document.querySelector("#courseGrid");
const courseSelect = document.querySelector("#courseSelect");

function renderCourses(filter = "all") {
  const filtered =
    filter === "all"
      ? courses
      : courses.filter((course) => course.category === filter);

  courseGrid.innerHTML = "";

  filtered.forEach((course) => {
    const card = document.createElement("article");
    card.className = "course-card";

    card.innerHTML = `
      <div class="course-cover">
        <span class="course-category">${course.categoryName}</span>
        <span class="course-icon"></span>
      </div>
      <div class="course-body">
        <h3>${course.name}</h3>
        <p>${course.description}</p>
        <div class="course-bottom">
          <span>✦ Ziyokor Academy</span>
          <a href="#contact">Batafsil ↗</a>
        </div>
      </div>
    `;

    card.querySelector(".course-icon").textContent = course.icon;

    card.querySelector("a").addEventListener("click", () => {
      courseSelect.value = course.name;
    });

    courseGrid.appendChild(card);
  });
}

renderCourses();

// Kurs tanlash
courseSelect.innerHTML = '<option value="">Kursni tanlang</option>';

courses.forEach((course) => {
  const option = document.createElement("option");
  option.value = course.name;
  option.textContent = course.name;
  courseSelect.appendChild(option);
});

// Filter
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    renderCourses(button.dataset.filter);
  });
});

// Mobil menyu
const menuBtn = document.querySelector("#menuBtn");
const navLinks = document.querySelector("#navLinks");

menuBtn.addEventListener("click", () => {
  const opened = navLinks.classList.toggle("open");
  menuBtn.textContent = opened ? "✕" : "☰";
  menuBtn.setAttribute("aria-expanded", String(opened));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

// Animatsiyalar
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// Yuqoriga qaytish
const backTop = document.querySelector("#backTop");

window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 500);
});

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Joriy yil
document.querySelector("#year").textContent = new Date().getFullYear();

// Arizalarni backendga yuborish
const applicationForm = document.querySelector("#applicationForm");
const formMessage = document.querySelector("#formMessage");

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document.querySelector("#fullName").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const course = courseSelect.value;

  const submitButton = applicationForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  formMessage.textContent = "Ariza yuborilmoqda...";
  formMessage.className = "form-message";

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        phone,
        course,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Xatolik yuz berdi.");
    }

    formMessage.textContent = result.message;
    formMessage.className = "form-message success";

    applicationForm.reset();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.className = "form-message error";
  } finally {
    submitButton.disabled = false;
  }
});
