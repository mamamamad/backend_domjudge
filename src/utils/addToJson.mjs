import fs from "fs";

/**
 * Adds new data to a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @param {object} newData - Data to add.
 */
export function addDataToJson(filePath, newData) {
  try {
    // Read the existing file (create if not exists)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }

    // Read current data
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");

    // Add new data
    jsonData.push(newData);

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    console.log("✅ Data added successfully!");
  } catch (err) {
    console.error("❌ Error adding data to JSON:", err.message);
  }
}
