import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent = `${projects.length} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedYear = null;
let query = '';

function applyFilters() {
  let queryFiltered = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderPieChart(queryFiltered);

  const displayed = selectedYear
    ? queryFiltered.filter((p) => p.year === selectedYear)
    : queryFiltered;
  renderProjects(displayed, projectsContainer, 'h2');
}

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  ).sort(([a], [b]) => b - a);

  let newData = newRolledData.map(([label, value]) => ({ label, value }));

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  newArcs.forEach((arc, idx) => {
    const isSelected = newData[idx].label === selectedYear;
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', isSelected ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === newData[idx].label ? null : newData[idx].label;
        applyFilters();
      });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', d.label === selectedYear ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

applyFilters();

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  applyFilters();
});