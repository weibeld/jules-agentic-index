
import './style.css';

const imageGrid = document.getElementById('image-grid');
const chipsContainer = document.getElementById('chips-container');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const allTagsButton = document.getElementById('all-tags-button');
const allTagsDropdown = document.getElementById('all-tags-dropdown');

let projects = [];
let allTags = new Set();
let selectedTags = new Set();

async function fetchData() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    projects = await response.json();
    renderProjects(projects);
    extractTags(projects);
    renderTags();
    populateDropdown();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function renderProjects(projectsToRender) {
  imageGrid.innerHTML = '';
  if (projectsToRender.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  projectsToRender.forEach(project => {
    const card = document.createElement('div');
    card.className = 'flex flex-col gap-4 p-4 bg-white/50 dark:bg-[#1a2734] rounded-xl border border-gray-200/50 dark:border-white/10';
    card.innerHTML = `
      <h3 class="text-black dark:text-white text-base font-medium leading-normal hover:text-primary dark:hover:text-primary cursor-pointer">${project.url}</h3>
      <div class="flex flex-col gap-2">
        <p class="text-gray-600 dark:text-[#92adc8] text-sm font-normal leading-normal flex items-center gap-2"><span class="material-symbols-outlined text-base">folder_managed</span> ${project.org}</p>
        <p class="text-gray-600 dark:text-[#92adc8] text-sm font-normal leading-normal flex items-center gap-2"><span class="material-symbols-outlined text-base">star</span> ${project.stars} Stars</p>
        <p class="text-gray-600 dark:text-[#92adc8] text-sm font-normal leading-normal flex items-center gap-2"><span class="material-symbols-outlined text-base">calendar_today</span> Released: ${project.released}</p>
      </div>
      <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-200/50 dark:border-white/10">
        ${project.tags.map(tag => `<span class="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;
    imageGrid.appendChild(card);
  });
}

function extractTags(projects) {
  projects.forEach(project => {
    project.tags.forEach(tag => allTags.add(tag));
  });
}

function renderTags() {
  const tagCounts = {};
  projects.forEach(project => {
    project.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
  const topTags = sortedTags.slice(0, 5);

  topTags.forEach(tag => {
    const button = document.createElement('button');
    button.className = `flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium leading-normal bg-gray-100 dark:bg-[#243647] text-gray-700 dark:text-white`;
    button.innerHTML = `<p>${tag}</p>`;
    button.addEventListener('click', () => {
      toggleTag(tag, button);
      filterAndRenderProjects();
    });
    if (chipsContainer.lastChild) {
      chipsContainer.insertBefore(button, chipsContainer.lastChild);
    } else {
      chipsContainer.appendChild(button);
    }
  });
}

function populateDropdown() {
  const dropdownContent = allTagsDropdown.querySelector('.py-1');
  if (dropdownContent) {
    while (dropdownContent.firstChild) {
      dropdownContent.removeChild(dropdownContent.firstChild);
    }

    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach(tag => {
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'text-gray-700 dark:text-white block px-4 py-2 text-sm';
      link.textContent = tag;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const button = Array.from(chipsContainer.querySelectorAll('button')).find(btn => btn.textContent === tag);
        toggleTag(tag, button);
        filterAndRenderProjects();
        allTagsDropdown.classList.add('hidden');
      });
      dropdownContent.appendChild(link);
    });
  }
}

function toggleTag(tag, button = null) {
  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
    if (button) {
      button.classList.remove('bg-primary/20', 'dark:bg-[#243647]', 'text-primary', 'dark:text-white', 'ring-1', 'ring-inset', 'ring-primary/30', 'dark:ring-transparent');
      button.classList.add('bg-gray-100', 'dark:bg-[#243647]', 'text-gray-700', 'dark:text-white');
    }
  } else {
    selectedTags.add(tag);
    if (button) {
      button.classList.add('bg-primary/20', 'dark:bg-[#243647]', 'text-primary', 'dark:text-white', 'ring-1', 'ring-inset', 'ring-primary/30', 'dark:ring-transparent');
      button.classList.remove('bg-gray-100', 'dark:bg-[#243647]', 'text-gray-700', 'dark:text-white');
    }
  }
}

function filterAndRenderProjects() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.url.toLowerCase().includes(searchTerm) ||
      project.org.toLowerCase().includes(searchTerm) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    const matchesTags =
      selectedTags.size === 0 ||
      Array.from(selectedTags).every(tag => project.tags.includes(tag));

    return matchesSearch && matchesTags;
  });
  renderProjects(filteredProjects);
}

allTagsButton.addEventListener('click', () => {
  allTagsDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
  if (!allTagsButton.contains(event.target) && !allTagsDropdown.contains(event.target)) {
    allTagsDropdown.classList.add('hidden');
  }
});

searchInput.addEventListener('input', filterAndRenderProjects);

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});
