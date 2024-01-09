/**
 * This script adds a checkbox to each row in the "Mine resultater" table.
 * The average grade is then calculated based on the selected rows.
 * The script is only executed on the "Mine resultater" page.
 */

document.getElementById("mineResultaterTittel").innerHTML = `
<details>
    <summary>Resultater - klikk for Ã¥ se snitt</summary>
    Snittet ditt er <b id="snitt">BLANK</b>!
</details>`;

let snitt = document.getElementById("snitt");
let table = document.getElementsByTagName("table")[0];
let allRows = document.getElementsByTagName("tr");
let relevantRows = [].slice.call(allRows).filter(rowIsInteresting);

createCheckboxes();

/**
 * Creates checkboxes for each relevant row and attaches event
 * listener to update the average when checkbox is changed.
 */
function createCheckboxes() {
  for (let row of relevantRows) {
    let firstColoumn = row.children[0];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("change", updateSnitt);
    firstColoumn.appendChild(checkbox);
  }
}

/**
 * Updates the average grade based on the selected rows.
 */
function updateSnitt() {
  let checkedRows = relevantRows.filter(
    (row) =>
      getFirstElementInsideElement(row.children[0], "input", "tag").checked
  );

  let sum = 0;
  for (let row of checkedRows) {
    const grade = getFirstElementInsideElement(
      row.children[row.children.length - 2],
      "infoLinje",
      "class"
    ).innerText;

    sum += 5 - "ABCDEF".indexOf(grade);
  }
  if (sum == 0) {
    snitt.innerText = "[Ingen emner valgt]";
  } else {
    snitt.innerText = (sum / checkedRows.length).toFixed(2);
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
  let children;
  if (type == "tag") {
    children = document.getElementsByTagName(name);
  } else if (type == "class") {
    children = document.getElementsByClassName(name);
  }

  for (let child of children) {
    let parent = child ? child.parentNode : {};
    if (parent === element) {
      return child;
    }
  }
  return {};
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
