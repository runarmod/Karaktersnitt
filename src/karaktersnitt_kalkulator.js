/**
 * This script adds a checkbox to each row in the "Mine resultater" table.
 * The average grade is then calculated based on the selected rows.
 * The script is only executed on the "Mine resultater" page.
 */

const gradeNames = ["A", "B", "C", "D", "E", "Ikke bestått"];
const gradeCounts = {};
const creditCounts = {};

gradeNames.forEach((grade) => {
  gradeCounts[grade] = 0;
  creditCounts[grade] = 0;
});

let chosenSubjects = getAllSubjects();

document.getElementById("mineResultaterTittel").innerHTML = `
<details>
  <summary>Resultater - klikk for å se snitt</summary>
  <h2>
    <div>
      Snittet ditt er <b><abbr id="snitt">BLANK</abbr></b> (<b id="snittBokstav">-</b>).
      <br />
      Du har <b id="antallEmner">BLANK</b> <span id="emnerOrd">emner</span> som
      teller i snittet.
    </div>
    <table class="karakterTabell">
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>E</th>
          <th>F</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="antallA">0</td>
          <td id="antallB">0</td>
          <td id="antallC">0</td>
          <td id="antallD">0</td>
          <td id="antallE">0</td>
          <td id="antallF">0</td>
        </tr>
      </tbody>
    </table>

    <table class="ekstraKarakterTabell">
      <caption>
        Legg til ekstra karakterer
      </caption>
      <thead>
        <tr>
          <th>Karakter (A-F)</th>
          <th>Studiepoeng</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr id="form">
          <td><input type="text" /></td>
          <td><input type="number" min="1" max="30" step="0.5" /></td>
          <td><button id="addButton" class="leggtil">Legg til</button></td>
        </tr>
      </tbody>
    </table>
  </h2>
</details>`;

const css = `
.karakterTabell,
.ekstraKarakterTabell {
  margin-top: 20px;
  table-layout: fixed;
  width: 400px;
}

.karakterTabell tr th,
.ekstraKarakterTabell tr th {
  background-color: #a0a0a0;
}

.karakterTabell tr th,
.karakterTabell tr td,
.ekstraKarakterTabell tr th,
.ekstraKarakterTabell tr td {
  border: 1px solid black;
  text-align: center;
}

input,
button.leggtil,
button.fjern {
  width: 100%;
  margin: 0;
}

button.leggtil {
  background-color: #4caf50;
}

button.fjern {
  background-color: #ff474e;
  color: white;
  border: none;
  cursor: pointer;
}

.rasktvalg {
  margin-bottom: 5px !important;
}

button#ingen,
button#alle {
  background-color: #555;
  color: white;
  border: none;
  cursor: pointer;
  margin: 5px;
}

button#ingen:hover,
button#alle:hover {
  background-color: #333;
}`;

const allNone = document.createElement("div");
allNone.innerHTML = `
<div class="rasktvalg">
  Raskt valg:
  <button id="ingen" type="button">Velg ingen</button>
  <button id="alle" type="button">Velg alle</button>
</div>`;

const styleSheet = document.createElement("style");
styleSheet.textContent = css;
document.head.appendChild(styleSheet);

const snittElement = document.getElementById("snitt");
const snittBokstavElement = document.getElementById("snittBokstav");
const antallEmnerElement = document.getElementById("antallEmner");
const emnerOrdElement = document.getElementById("emnerOrd");
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addGrade);

const visningResultat = document.querySelector(".visningResultat");
const rasktValgAlreadyAdded = document.querySelector(".rasktvalg");
if (visningResultat && !rasktValgAlreadyAdded) {
  visningResultat.appendChild(allNone);
}

const antallKarakterer = [];
for (let i = 0; i < 6; i++) {
  antallKarakterer.push(document.getElementById("antall" + "ABCDEF"[i]));
}

// Let the page load before adding the checkboxes
const changeButtonsTds = getElementsInsideElement(
  document.querySelector(".radioknapper").children[0].children[0],
  "td",
  "tag"
);

const changeButtonsLabels = Array.from(changeButtonsTds).map((td) =>
  getFirstElementInsideElement(td, "input", "tag")
);

const DELAY_MS = 300;

for (const changeButton of changeButtonsLabels) {
  changeButton.addEventListener("click", () => {
    setTimeout(() => {
      createAllCheckboxes();
      toggleNotChosen();
      createBoldLines();
    }, DELAY_MS);
  });
}

document.getElementById("alle").addEventListener("click", selectAll);
document.getElementById("ingen").addEventListener("click", selectNone);

createBoldLines();

const checkboxesAlreadyAdded = document.querySelector(".subject-checkbox");
if (!checkboxesAlreadyAdded) {
  createAllCheckboxes();
}

function selectAll() {
  document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
    if (!checkbox.checked) {
      checkbox.click();
    }
  });
}

function selectNone() {
  document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
    if (checkbox.checked) {
      checkbox.click();
    }
  });
}

function toggleNotChosen() {
  document.querySelectorAll(".subject-checkbox").forEach((checkbox) => {
    if (!chosenSubjects.includes(checkbox.title)) {
      checkbox.click();
    }
  });
}

/**
 * Creates bold lines between rows with different semesters, to easier distinguish between them.
 */
function createBoldLines() {
  const table = document.querySelector(
    ".table-standard.reflow.ui-panel-content"
  );
  const allRows = table.getElementsByTagName("tr");

  let previousRow = null;
  for (const row of allRows) {
    if (
      !(row.classList.contains("none") || row.classList.contains("resultatTop"))
    )
      continue;

    if (!previousRow) {
      previousRow = row;
      continue;
    }

    const previousSemester = previousRow.children[0].children[1].innerText;
    const currentSemester = row.children[0].children[1].innerText;

    if (previousSemester != currentSemester) {
      row.style.borderTop = "3px solid black";
    }

    previousRow = row;
  }
}

function getAllSubjects() {
  const table = document.querySelector(
    ".table-standard.reflow.ui-panel-content"
  );
  const allRows = table.getElementsByTagName("tr");

  return Array.from(allRows)
    .filter(rowIsInteresting)
    .map((row) => row.children[1].children[1].children[0].innerText);
}

/**
 * Creates checkboxes for each relevant row and attaches event
 * listener to update the average when checkbox is changed.
 */
function createAllCheckboxes() {
  for (const grade of gradeNames) {
    gradeCounts[grade] = 0;
    creditCounts[grade] = 0;
  }

  const table = document.querySelector(
    ".table-standard.reflow.ui-panel-content"
  );
  const allRows = table.getElementsByTagName("tr");

  for (const row of allRows) {
    if (!rowIsInteresting(row)) {
      continue;
    }
    const firstColumn = row.children[0];
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("subject-checkbox");
    checkbox.checked = true;

    const subject = row.children[1].children[1].children[0].innerText;
    checkbox.title = subject;

    const { grade, credits } = extractGradeAndCreditsFromRow(row);
    checkbox.addEventListener("change", (event) =>
      checkboxToggeled(subject, grade, credits, event.target.checked)
    );

    gradeCounts[grade]++;
    creditCounts[grade] += credits;

    firstColumn.appendChild(checkbox);
  }

  updateSnittBasedOnGradeCounts();
}

/**
 * Extracts the grade and credits from a given row element.
 *
 * @param {HTMLElement} row The row element containing the grade and credits.
 * @returns {Object} An object containing the extracted grade and credits.
 */
function extractGradeAndCreditsFromRow(row) {
  const grade = getFirstElementInsideElement(
    row.children[row.children.length - 2],
    "infoLinje",
    "class"
  ).innerText;

  const credits = parseFloat(
    row.children[row.children.length - 1].innerText.replace(",", ".")
  );

  return { grade, credits };
}

/**
 * Toggles the checkbox for a row and updates the grade and credit counts accordingly.
 *
 * @param {string} subject The subject of the row.
 * @param {string} grade The grade of the row.
 * @param {number} credits The credits of the row.
 * @param {boolean} toActive Indicates whether the checkbox is being toggled to active or inactive state.
 */
function checkboxToggeled(subject, grade, credits, toActive) {
  gradeCounts[grade] += toActive ? 1 : -1;
  creditCounts[grade] += toActive ? credits : -credits;

  if (chosenSubjects.includes(subject) && !toActive) {
    chosenSubjects = chosenSubjects.filter((s) => s !== subject);
  } else if (!chosenSubjects.includes(subject) && toActive) {
    chosenSubjects.push(subject);
  }

  updateSnittBasedOnGradeCounts();
}

function updateSnittBasedOnGradeCounts() {
  for (let i = 0; i < 6; i++) {
    antallKarakterer[i].innerText = gradeCounts[gradeNames[i]];
  }

  let sum = 0;
  let totalCredits = 0;
  gradeNames.forEach((grade) => {
    sum += (5 - gradeNames.indexOf(grade)) * creditCounts[grade];
    totalCredits += creditCounts[grade];
  });

  let numberOfGrades = 0;
  gradeNames.forEach((grade) => {
    numberOfGrades += gradeCounts[grade];
  });

  if (totalCredits == 0) {
    snittElement.innerText = "[Ingen emner valgt]";
    snittElement.title = "-";
    snittBokstavElement.innerText = "-";
  } else {
    const calculatedAverage = sum / totalCredits;
    const gcdValue = gcd(sum, totalCredits);
    const numerator = sum / gcdValue;
    const denominator = totalCredits / gcdValue;

    snittElement.innerText = calculatedAverage.toString().slice(0, 4);
    snittElement.title = `${numerator}/${denominator} ≈ ${calculatedAverage}`;

    snittBokstavElement.innerText =
      gradeNames[5 - Math.round(calculatedAverage)];
  }

  emnerOrdElement.innerText = "emner";
  if (numberOfGrades == 1) {
    emnerOrdElement.innerText = "emne";
  }

  antallEmnerElement.innerText = numberOfGrades;
}

function addGrade() {
  const gradeInput = document.querySelector(
    ".ekstraKarakterTabell input[type='text']"
  );
  const creditsInput = document.querySelector(
    ".ekstraKarakterTabell input[type='number']"
  );

  const grade =
    gradeInput.value.toLowerCase() === "f" ||
      gradeInput.value.toLowerCase() === "ikke bestått"
      ? "Ikke bestått"
      : gradeInput.value.toUpperCase();
  const credits = parseFloat(creditsInput.value.replace(",", "."));

  if (
    gradeNames.indexOf(grade) == -1 ||
    !isPositiveNumber(credits) ||
    credits > 30
  ) {
    alert("Ugyldig karakter eller studiepoeng.");
    return;
  }

  gradeInput.value = "";
  creditsInput.value = "";

  const tbody = document.querySelector(".ekstraKarakterTabell tbody");
  const formRow = document.getElementById("form");
  const newRow = document.createElement("tr");
  const newGrade = document.createElement("td");
  const newCredits = document.createElement("td");
  const newButton = document.createElement("td");

  newGrade.innerText = grade;
  newCredits.innerText = credits;
  newButton.innerHTML = '<button class="fjern">Fjern</button>';
  newButton.addEventListener("click", () => removeGrade(newRow));

  newRow.appendChild(newGrade);
  newRow.appendChild(newCredits);
  newRow.appendChild(newButton);

  tbody.insertBefore(newRow, formRow);

  gradeCounts[grade]++;
  creditCounts[grade] += credits;

  updateSnittBasedOnGradeCounts();
}

function removeGrade(row) {
  const grade = row.children[0].innerText;
  const credits = parseFloat(row.children[1].innerText);

  gradeCounts[grade]--;
  creditCounts[grade] -= credits;

  updateSnittBasedOnGradeCounts();

  row.remove();
}

// UTILITY FUNCTIONS

/**
 * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 *
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The greatest common divisor of a and b.
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {
    var temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

/**
 * Retrieves the first element inside a given element based on the specified name and type.
 *
 * @param {Element} element The parent element.
 * @param {string} name The name of the element to search for.
 * @param {string} type The type of search to perform. Can be "tag" or "class".
 * @returns {Element} The first matching element found, or an empty object if no match is found.
 */
function getFirstElementInsideElement(element, name, type) {
  const elements = getElementsInsideElement(element, name, type);
  if (elements.length > 0) {
    return elements[0];
  }
  return {};
}

/**
 * Retrieves all elements inside a given element based on the specified name and type.
 * @param {Element} element The parent element.
 * @param {string} name The name of the elements to search for.
 * @param {string} type The type of search to perform. Can be "tag" or "class".
 * @returns {Element[]} An array of matching elements found.
 */
function getElementsInsideElement(element, name, type) {
  let children;
  if (type == "tag") {
    children = document.getElementsByTagName(name);
  } else if (type == "class") {
    children = document.getElementsByClassName(name);
  }

  const elements = [];

  for (const child of children) {
    const parent = child ? child.parentNode : {};
    if (parent === element) {
      elements.push(child);
    }
  }
  return elements;
}

/**
 * Checks if a row is interesting based on certain criteria.
 *
 * @param {HTMLTableRowElement} element The row element to check.
 * @returns {boolean} True if the row is interesting, false otherwise.
 */
function rowIsInteresting(element) {
  // Subject has more than 0 points
  const lastColumn = element.children[element.children.length - 1];
  const content = lastColumn.innerText.replace(",", ".");
  if (!isPositiveNumber(content)) {
    return false;
  }

  // Grade is A - Ikke bestått(F)
  const secondLastColumn = element.children[element.children.length - 2];
  const div = getFirstElementInsideElement(
    secondLastColumn,
    "infoLinje",
    "class"
  );

  if (div.innerText.length == 0 || gradeNames.indexOf(div.innerText) == -1) {
    return false;
  }

  return true;
}

/**
 * Checks if a given string is a positive number.
 * @param {string} str The string to be checked.
 * @returns {boolean} Returns true if the string is a positive number, false otherwise.
 */
function isPositiveNumber(str) {
  if (str.length == 0 || str == "0") {
    return false;
  }
  return !isNaN(str) && !isNaN(parseFloat(str));
}
