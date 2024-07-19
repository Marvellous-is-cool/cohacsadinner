const connection = require("../models/connection");
const uploadFile = require("../helpers/uploadFile");

// Get contestant by ID
const getContestantById = async (awardId, contestantId) => {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM contestants c JOIN award_contestants ac ON c.id = ac.contestant_id WHERE ac.award_id = ? AND c.id = ?",
      [awardId, contestantId]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching contestant by ID:", error);
    throw error;
  }
};

// Update contestant
const updateContestant = async (
  awardId,
  contestantId,
  editedDetails,
  photoFile
) => {
  try {
    console.log("Updating contestant:", editedDetails, photoFile);

    // Get existing contestant
    const [existingContestant] = await connection.execute(
      "SELECT * FROM contestants WHERE id = ?",
      [contestantId]
    );
    console.log("Existing contestant:", existingContestant);

    if (existingContestant.length === 0) {
      throw new Error(`Contestant with ID ${contestantId} not found.`);
    }

    let photoUrl = existingContestant[0].photo_url;
    if (photoFile) {
      // Use uploadFile to handle file upload and get the generated filename
      const contestantData = await uploadFile(
        photoFile,
        { name: editedDetails.nickname }, // Pass an object with a 'name' property
        "photo"
      );
      console.log("Uploaded photo:", contestantData);
      photoUrl = contestantData.photo;
    }

    // Update query for the contestant
    const updateQuery = `
      UPDATE contestants
      SET nickname = ?, level = ?, photo_url = ?, votes = ?
      WHERE id = ?
    `;
    const values = [
      editedDetails.nickname,
      editedDetails.level,
      photoUrl,
      editedDetails.votes,
      contestantId,
    ];

    console.log("Updating with values:", values);

    await connection.query(updateQuery, values);
    console.log(`Contestant with ID ${contestantId} updated successfully.`);
  } catch (error) {
    console.error("Error updating contestant:", error);
    throw error;
  }
};

// Render edit contestant page
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

// Edit contestant
const editContestant = async (req, res) => {
  try {
    const awardId = req.params.awardId;
    const contestantId = req.params.contestantId;
    const editedDetails = req.body;
    const photoFile = req.files ? req.files.contestantPhoto : null;

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
