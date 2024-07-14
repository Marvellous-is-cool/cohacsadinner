const connection = require("../models/connection"); // Update the path based on your file structure
const uploadFile = require("../helpers/uploadFile"); // Update the path based on your file structure

// Function to fetch a contestant by ID
const getContestantById = async (id) => {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM contestants WHERE id = ?",
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching contestant by ID:", error);
    throw error;
  }
};

// Function to update contestant details
const updateContestant = async (contestantId, editedDetails) => {
  try {
    // Fetch the existing contestant details for photo URL
    const [existingContestant] = await connection.execute(
      "SELECT * FROM contestants WHERE id = ?",
      [contestantId]
    );

    // Update contestant details in the database
    const updateQuery = `
        UPDATE contestants
        SET
          nickname = ?,
          level = ?,
          photo_url = ?,
          votes = ?
        WHERE id = ?
      `;

    // Upload photo if provided, or use the existing one
    editedDetails.photo_url = editedDetails.photo
      ? (await uploadFile(editedDetails.photo, editedDetails)).photo
      : existingContestant[0].photo_url;

    const values = [
      editedDetails.nickname,
      editedDetails.level,
      editedDetails.photo_url,
      editedDetails.votes,
      contestantId,
    ];

    await connection.query(updateQuery, values);

    console.log(`Contestant with ID ${contestantId} updated successfully.`);
  } catch (error) {
    console.error("Error updating contestant:", error);
    throw error;
  }
};

// Function to render the edit contestant page
const renderEditContestantPage = async (req, res) => {
  try {
    // Fetch the necessary data (e.g., contestant details) based on req.params
    const awardId = req.params.awardId;
    const contestantId = req.params.contestantId;
    const contestant = await getContestantById(contestantId);

    res.render("admin/edit-contestant", { awardId, contestant }); // Update the path here
  } catch (error) {
    console.error("Error rendering edit page:", error);
    req.flash("error", "Error rendering edit page. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

// Function to handle the edit contestant form submission
const editContestant = async (req, res) => {
  try {
    // Get the edited contestant details from the form submission
    const awardId = req.params.awardId;
    const contestantId = req.params.contestantId;
    const editedDetails = req.body; // Modify this based on your form structure

    // Update the contestant details in the database
    await updateContestant(contestantId, editedDetails); // Implement this function

    req.flash("success", "Contestant updated successfully.");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating contestant:", error);
    req.flash("error", "Error updating contestant. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

module.exports = { updateContestant, renderEditContestantPage, editContestant };
