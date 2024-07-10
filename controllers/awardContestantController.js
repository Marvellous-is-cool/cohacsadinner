// awardContestantController.js

const db = require("../models/connection");

// Function to get contestants for a specific award
async function getContestantsForAward(awardId) {
  const sql = `
    SELECT contestants.*, award_contestants.award_id
    FROM contestants
    JOIN award_contestants ON contestants.id = award_contestants.contestant_id
    WHERE award_contestants.award_id = ?;
  `;

  try {
    const [results] = await db.execute(sql, [awardId]);

    return results;
  } catch (error) {
    console.error(
      "Error executing query in awardContestantController.js:",
      error
    );
    throw error;
  }
}

// Function to link a contestant to an award
function linkContestantToAward(contestantId, awardId) {
  const sql =
    "INSERT INTO award_contestants (contestant_id, award_id) VALUES (?, ?)";

  return new Promise((resolve, reject) => {
    db.query(sql, [contestantId, awardId], (err, results) => {
      if (err) {
        console.error(" Error linking contestant to award:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to unlink a contestant from all awards
async function unlinkContestantFromAllAwards(contestantId) {
  const sql = "DELETE FROM award_contestants WHERE contestant_id = ?";

  try {
    const [results] = await db.execute(sql, [contestantId]);

    return results;
  } catch (err) {
    console.error(" Error unlinking contestant from all awards:", err);
    throw err; // Re-throw the error to let the calling function handle it
  }
}

// Function to get awards for a specific contestant
function getAwardsForContestant(contestantId) {
  const sql = `
    SELECT awards.*, award_contestants.contestant_id
    FROM awards
    JOIN award_contestants ON awards.id = award_contestants.award_id
    WHERE award_contestants.contestant_id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [contestantId], (err, results) => {
      if (err) {
        console.error(" Error getting awards for contestant:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  getContestantsForAward,
  linkContestantToAward,
  unlinkContestantFromAllAwards,
  getAwardsForContestant,
  // Add other functions as needed...
};
