const connection = require("../models/connection");
const uploadFile = require("../helpers/uploadFile");

// Get contestant by ID
const getContestantById = async (awardId, contestantId) => {
  try {
    const [rows] = await connection.execute(
      "SELECT c.*, ac.id AS award_contestant_id FROM contestants c JOIN award_contestants ac ON c.id = ac.contestant_id WHERE ac.award_id = ? AND c.id = ?",
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
    // Get existing contestant
    const [existingContestantRows] = await connection.execute(
      "SELECT * FROM contestants WHERE id = ?",
      [contestantId]
    );

    if (existingContestantRows.length === 0) {
      throw new Error(`Contestant with ID ${contestantId} not found.`);
    }

    const existingContestant = existingContestantRows[0];
    let photoUrl = existingContestant.photo_url;

    if (photoFile) {
      const contestantData = await uploadFile(
        photoFile,
        { name: editedDetails.nickname },
        "photo"
      );
      photoUrl = contestantData.photo;
      editedDetails.photo_url = photoUrl; // Update editedDetails with new photo_url
    }

    const updateQuery = `
      UPDATE contestants
      SET nickname = ?, department = ?, photo_url = ?, votes = ?
      WHERE id = ?
    `;
    const values = [
      editedDetails.nickname,
      editedDetails.department,
      photoUrl,
      editedDetails.votes,
      contestantId,
    ];

    await connection.query(updateQuery, values);
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

    if (!contestant) {
      console.error(
        `Contestant with ID ${contestantId} not found during render.`
      );
      req.flash("error", "Contestant not found. Please try again.");
      return res.redirect("/admin/dashboard");
    }

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

    // Fetch the contestant data to get the correct contestant ID
    const contestant = await getContestantById(awardId, contestantId);

    if (!contestant) {
      throw new Error(`Contestant with ID ${contestantId} not found.`);
    }

    await updateContestant(awardId, contestant.id, editedDetails, photoFile);

    req.flash("success", "Contestant updated successfully.");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating contestant:", error);
    req.flash("error", "Error updating contestant. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

module.exports = { updateContestant, renderEditContestantPage, editContestant };
