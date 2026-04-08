// lib/parseFullUniversityData.js

export function parseFullUniversityData(html, universityInfo) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const result = {
    id: universityInfo.universityID,
    name: universityInfo.universityName,
    year: universityInfo.year,
    region: universityInfo.regionName,
    generalInfo: {},
    mainIndicators: {},      // from #result
    sections: {},            // each napde table (III_1, III_2, etc.)
    additional: {},          // from #analis_dop
    regionalRole: [],        // from #analis_reg
  };

  // ----- General info (#info) -----
  const infoRows = doc.querySelectorAll("#info tr");
  infoRows.forEach(row => {
    const th = row.querySelector(".tt");
    const td = row.querySelector("td:last-child");
    if (th && td) {
      const label = th.textContent.trim();
      let value = td.textContent.trim();
      result.generalInfo[label] = value;
    }
  });

  // ----- Main performance indicators (#result) -----
  const resultTable = doc.querySelector("#result");
  if (resultTable) {
    const rows = resultTable.querySelectorAll("tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        const nameCell = cells[1]?.querySelector(".n") || cells[1];
        const name = nameCell?.textContent?.trim();
        const value = cells[2]?.textContent?.trim();
        const threshold = cells[3]?.textContent?.trim();
        const change = cells[4]?.textContent?.trim();
        if (name) {
          result.mainIndicators[name] = {
            value: value,
            threshold: threshold,
            change: change
          };
        }
      }
    });
  }

  // ----- Helper: parse a napde table (detailed sections) -----
  const parseNapdeTable = (table) => {
    const data = {};
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        const nameCell = cells[1]?.querySelector(".n") || cells[1];
        const name = nameCell?.textContent?.trim();
        const unit = cells[2]?.textContent?.trim();
        const value = cells[3]?.textContent?.trim();
        if (name && value) {
          data[name] = { value, unit };
        }
      }
    });
    return data;
  };

  // ----- Sections: find all div with subsection and following table.napde -----
  const subsections = doc.querySelectorAll(".subsection");
  subsections.forEach(sub => {
    const anchor = sub.querySelector("a");
    const sectionId = anchor ? anchor.getAttribute("name") : "";
    let nextTable = sub.nextElementSibling;
    while (nextTable && nextTable.tagName !== "TABLE") {
      nextTable = nextTable.nextElementSibling;
    }
    if (nextTable && nextTable.classList.contains("napde")) {
      const sectionName = sub.textContent.trim();
      result.sections[sectionName] = parseNapdeTable(nextTable);
    }
  });

  // Also handle the main educational, research etc. tables that might be inside blockcontent without subsection
  const allNapdeTables = doc.querySelectorAll("table.napde");
  allNapdeTables.forEach(table => {
    // Check if already captured
    let found = false;
    for (let s in result.sections) {
      if (result.sections[s] === parseNapdeTable(table)) found = true;
    }
    if (!found) {
      // Try to find preceding subsection or section title
      let prev = table.previousElementSibling;
      let title = "Дополнительные данные";
      while (prev && prev.tagName !== "SPAN" && !prev.classList?.contains("subsection")) {
        prev = prev.previousElementSibling;
      }
      if (prev && prev.classList?.contains("subsection")) {
        title = prev.textContent.trim();
      }
      result.sections[title] = parseNapdeTable(table);
    }
  });

  // ----- Additional characteristics (#analis_dop) -----
  const dopTable = doc.querySelector("#analis_dop");
  if (dopTable) {
    const rows = dopTable.querySelectorAll("tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        const name = cells[1]?.textContent?.trim();
        const unit = cells[2]?.textContent?.trim();
        const value = cells[3]?.textContent?.trim();
        if (name && value) {
          result.additional[name] = { value, unit };
        }
      }
    });
  }

  // ----- Regional role (#analis_reg) -----
  const regTable = doc.querySelector("#analis_reg");
  if (regTable) {
    const rows = regTable.querySelectorAll("tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        const ugname = cells[0]?.textContent?.trim();
        const kont = cells[1]?.textContent?.trim();
        const shareOrg = cells[2]?.textContent?.trim();
        const shareRegion = cells[3]?.textContent?.trim();
        if (ugname && !ugname.includes("Реализуемые")) {
          result.regionalRole.push({
            ugname,
            kont,
            shareOrg,
            shareRegion
          });
        }
      }
    });
  }

  return result;
}
