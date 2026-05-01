console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/JWanderer73', title: 'GitHub' },
  ];
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

let nav = document.createElement('nav');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host !== location.host) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }
    nav.append(a);
  }

// Color scheme selector
const schemeLabel = document.createElement('label');
schemeLabel.className = 'color-scheme';
schemeLabel.textContent = 'Color scheme:';

const select = document.createElement('select');
select.id = 'color-scheme';
select.innerHTML = `
  <option value="light dark">Auto</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
`;

const savedScheme = localStorage.getItem('colorScheme') ?? 'light dark';
document.documentElement.style.colorScheme = savedScheme;
select.value = savedScheme;

select.addEventListener('change', () => {
  document.documentElement.style.colorScheme = select.value;
  localStorage.setItem('colorScheme', select.value);
});

schemeLabel.append(select);
document.body.append(schemeLabel);

// Preload contact form email from localStorage and handle submission
const emailInput = document.querySelector('#email');
if (emailInput) {
  emailInput.value = localStorage.getItem('userEmail') ?? '';
  emailInput.addEventListener('change', () => {
    localStorage.setItem('userEmail', emailInput.value);
  });

  const form = emailInput.closest('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = document.querySelector('#email').value;
    const subject = encodeURIComponent(document.querySelector('#subject').value);
    const message = encodeURIComponent(`From: ${from}\n\n${document.querySelector('#message').value}`);
    location.href = `mailto:jakewanderer8@gmail.com?subject=${subject}&body=${message}`;
  });
}
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const project of projects) {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-body">
        <p>${project.description}</p>
        ${project.year ? `<time class="project-year" datetime="${project.year}">c. ${project.year}</time>` : ''}
      </div>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}