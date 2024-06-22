/**
 * This script adds a checkbox to each row in the "Mine resultater" table.
 * The average grade is then calculated based on the selected rows.
 * The script is only executed on the "Mine resultater" page.
 */

const allRows = document
  .querySelector(".table-standard.reflow.ui-panel-content")
  .getElementsByTagName("tr");

let checkedSubjects = [];

document.getElementById("mineResultaterTittel").innerHTML = `
<details open>
  <summary>Resultater - klikk for å se snitt</summary>
  <h2>
    <div>
      Snittet ditt er <b id="snitt">BLANK</b>.
      <br />
      Du har <b id="antallEmner">BLANK</b> <span id="emnerOrd">emner</span> som teller i snittet.
    </div>
    <table class="karakterTabell">
      <tr>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
        <th>E</th>
        <th>F</th>
      </tr>
      <tr>
        <td id="antallA">0</td>
        <td id="antallB">0</td>
        <td id="antallC">0</td>
        <td id="antallD">0</td>
        <td id="antallE">0</td>
        <td id="antallF">0</td>
      </tr>
    </table>
  </h2>
</details>`;

const css = `
  .karakterTabell {
    margin-top: 20px;
    table-layout: fixed;
    width: 400px;
  }

  .karakterTabell tr th {
    background-color: #a0a0a0;
  }

  .karakterTabell tr th,
  .karakterTabell tr td {
    border: 1px solid black;
    text-align: center;
  }`;

const styleSheet = document.createElement("style");
styleSheet.textContent = css;
document.head.appendChild(styleSheet);

const snittElement = document.getElementById("snitt");
const antallEmnerElement = document.getElementById("antallEmner");
const emnerOrdElement = document.getElementById("emnerOrd");
const antallKarakterer = [];
for (let i = 0; i < 6; i++) {
  antallKarakterer.push(document.getElementById("antall" + "ABCDEF"[i]));
}

let gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

// Let the page load before adding the checkboxes
const changeButtonsTds = getElementsInsideElement(
  document.querySelector(".radioknapper").children[0].children[0],
  "td",
  "tag"
);

const changeButtonsLabels = Array.from(changeButtonsTds).map((td) =>
  getFirstElementInsideElement(td, "label", "tag")
);

for (const changeButton of changeButtonsLabels) {
  changeButton.addEventListener("click", () => {
    setTimeout(() => {
      createCheckboxes(checkedSubjects);
    }, 150);
  });
}

createBoldLines();
createAllCheckboxes();

/**
 * Creates bold lines between rows with different semesters, to easier distinguish between them.
 */
function createBoldLines() {
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

/**
 * Creates checkboxes for each relevant row and attaches event
 * listener to update the average when checkbox is changed.
 */
function createAllCheckboxes() {
  for (const row of allRows) {
    if (!rowIsInteresting(row)) {
      continue;
    }
    const firstColoumn = row.children[0];
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("change", updateSnitt);
    firstColoumn.appendChild(checkbox);

    const subject = row.children[1].children[1].children[0].innerText;
    checkedSubjects.push(subject);
  }
}

/**
 * Creates checkboxes for each subject in the given array and attaches event
 * listener to update the average when checkbox is changed.
 *
 * @param {string[]} subjects The subjects to create checkboxes for.
 * @returns {void}
 */
function createCheckboxes(subjects) {
  for (const row of allRows) {
    if (!rowIsInteresting(row)) {
      continue;
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const subject = row.children[1].children[1].children[0].innerText;
    checkbox.checked = subjects.includes(subject);

    checkbox.addEventListener("change", updateSnitt);

    const firstColoumn = row.children[0];
    firstColoumn.appendChild(checkbox);
  }
}

/**
 * Updates the average grade based on the selected rows.
 */
function updateSnitt() {
  const checkedRows = [];
  checkedSubjects = [];
  gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  let total_credits = 0;

  for (const row of allRows) {
    if (!rowIsInteresting(row)) {
      continue;
    }
    const checkbox = getFirstElementInsideElement(
      row.children[0],
      "input",
      "tag"
    );

    if (checkbox.checked) {
      checkedRows.push(row);
      checkedSubjects.push(row.children[1].children[1].children[0].innerText);
    }
  }

  let sum = 0;
  for (const row of checkedRows) {
    const grade = getFirstElementInsideElement(
      row.children[row.children.length - 2],
      "infoLinje",
      "class"
    ).innerText;

    gradeCounts[grade]++;

    const credits = parseFloat(
      row.children[row.children.length - 1].innerText.replace(",", ".")
    );

    total_credits += credits;
    sum += (5 - "ABCDEF".indexOf(grade)) * credits;
  }

  if (sum == 0) {
    snittElement.innerText = "[Ingen emner valgt]";
  } else {
    snittElement.innerText = (sum / total_credits).toFixed(2);
  }

  emnerOrdElement.innerText = "emner";
  if (checkedRows.length == 1) {
    emnerOrdElement.innerText = "emne";
  }

  antallEmnerElement.innerText = checkedRows.length;
  updateGradeCounts();
}

function updateGradeCounts() {
  for (let i = 0; i < 6; i++) {
    antallKarakterer[i].innerText = gradeCounts["ABCDEF"[i]];
  }
}

updateSnitt();

// UTILITY FUNCTIONS

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
  const lastColoumn = element.children[element.children.length - 1];
  const content = lastColoumn.innerText.replace(",", ".");
  if (!isPositiveNumber(content)) {
    return false;
  }

  // Grade is A-F
  const secondLastColoumn = element.children[element.children.length - 2];
  const div = getFirstElementInsideElement(
    secondLastColoumn,
    "infoLinje",
    "class"
  );
  if (div.innerText.length != 1 || "ABCDEF".indexOf(div.innerText) == -1) {
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
