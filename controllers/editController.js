const connection = require("../models/connection");
const uploadFile = require("../helpers/uploadFile");

// Function to fetch a contestant by ID
const getContestantById = async (awardId, contestantId) => {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM contestants WHERE award_id = ? AND id = ?",
      [awardId, contestantId]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching contestant by ID:", error);
    throw error;
  }
};

// Function to update contestant details
const updateContestant = async (
  awardId,
  contestantId,
  editedDetails,
  photoFile
) => {
  try {
    // Fetch the existing contestant details for photo URL
    const [existingContestant] = await connection.execute(
      "SELECT * FROM contestants WHERE award_id = ? AND id = ?",
      [awardId, contestantId]
    );

    // Upload photo if provided, or use the existing one
    let photoUrl = existingContestant[0].photo_url;
    if (photoFile) {
      const uploadedPhoto = await uploadFile(
        photoFile,
        { name: editedDetails.nickname },
        "photo"
      );
      photoUrl = uploadedPhoto.photo;
    }

    // Update contestant details in the database
    const updateQuery = `
      UPDATE contestants
      SET
        nickname = ?,
        level = ?,
        photo_url = ?,
        votes = ?
      WHERE award_id = ? AND id = ?
    `;
    const values = [
      editedDetails.nickname,
      editedDetails.level,
      photoUrl,
      editedDetails.votes,
      awardId,
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
    const awardId = req.params.awardId;
    const contestantId = req.params.contestantId;
    const contestant = await getContestantById(awardId, contestantId);

    res.render("admin/edit-contestant", { contestant, awardId });
  } catch (error) {
    console.error("Error rendering edit page:", error);
    req.flash("error", "Error rendering edit page. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

// Function to handle the edit contestant form submission
const editContestant = async (req, res) => {
  try {
    const awardId = req.params.awardId;
    const contestantId = req.params.contestantId;
    const editedDetails = req.body;
    const photoFile = req.files ? req.files.photo : null;

    await updateContestant(awardId, contestantId, editedDetails, photoFile);

    req.flash("success", "Contestant updated successfully.");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating contestant:", error);
    req.flash("error", "Error updating contestant. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

module.exports = { updateContestant, renderEditContestantPage, editContestant };
