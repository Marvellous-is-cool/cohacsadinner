const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/clientController");
const adminController = require("../../controllers/adminController");
const voteNowRouter = require("./voteNow.js");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminContestantRouter = require("../adminRoutes/adminContestantRoute"); // Import the adminContestantRoute

// // // Index route
router.get("/", async (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).render("suspended");
  }
});

// router.get("/votingbooth", async (req, res) => {
//   try {
//     const awards = await clientController.getAwards();
//     res.render("main", { awards });
//   } catch (error) {
//     console.error("Error rendering main:", error);
//     res.status(500).render("suspended");
//   }
// });

router.get("/end", async (req, res) => {
  try {
    res.render("bye");
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).send("Internal Server Error");
    res.render("bye");
  }
});

// router.post("/vote", async (req, res) => {
//   try {
//     const { award } = req.body;

//     // Fetch selected award details
//     const selectedAward = await clientController.getSelectedAward(award);

//     // Fetch contestants for the selected award
//     const contestants = await clientController.getContestantsForAward(award);

//     // Add this line to log the fetched contestants

//     res.render("contestants", {
//       selectedAward,
//       contestants,
//     });
//   } catch (error) {
//     console.error("Error processing vote:", error);
//     res.status(500).render("suspended");
//   }
// });

// router.get("/contestant/:id/votenow/payment", async (req, res) => {
//   try {
//     const contestantId = req.params.id;

//     // Fetch contestant details by ID with associated award title
//     const selectedContestant = await clientController.getContestantById(
//       contestantId
//     );

//     // Pass both selectedContestant and awardTitle to the template
//     res.render("voteNow", {
//       selectedContestant,
//       awardTitle: selectedContestant.award_titles[0], // Assuming there's only one award title
//     });
//   } catch (error) {
//     console.error("Error fetching contestant details:", error);
//     res.status(500).render("suspended");
//   }
// });

// router.use("/", voteNowRouter);

// // Define the route for /voteNowSucess
// router.get("/voteNowSucess", async (req, res) => {
//   try {
//     const { status, email, contestantId } = req.query;

//     // Fetch contestant details by ID using the correct function
//     const selectedContestant = await clientController.getContestantById(
//       parseInt(contestantId)
//     );

//     res.render("voteNowSucess", {
//       status,
//       email,
//       contestantId,
//       selectedContestant,
//     });
//   } catch (error) {
//     console.error("Error fetching contestant details:", error);
//     res.status(500).render("suspended");
//   }
// });

// // Apply authMiddleware only to the routes under /admin
router.use("/admin", authMiddleware, adminContestantRouter);

// Admin login route accessible without /admin prefix
router.get("/login", (req, res) => {
  const error = req.flash("error")[0]; // Get the first error message
  res.render("admin-login", { error });
});

// // Admin authentication route
router.post("/authenticate", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { success, error, admin } = await adminController.authenticateAdmin(
      username,
      password
    );

    if (success) {
      // Authentication successful
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          res.status(500).render("suspended");
        } else {
          req.session.admin = true;
          req.session.adminUsername = admin.username; // Include admin's username

          // Set session expiration to 20 hours from now
          const sessionExpiration = 20 * 60 * 60 * 1000; // 20 hours in milliseconds
          req.session.cookie.expires = new Date(Date.now() + sessionExpiration);
          req.session.cookie.maxAge = sessionExpiration;

          res.redirect("/admin/dashboard");
        }
      });
    } else {
      // Authentication failed
      req.flash(
        "error",
        error || "Incorrect username or password. Please try again."
      );

      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error during admin authentication:", error);
    res.status(500).render("suspended");
  }
});

// Logout route
router.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).render("suspended");
    } else {
      // Redirect to the login page after destroying the session
      res.redirect("/");
    }
  });
});
// // Endpoint to handle session destruction when the tab or connection is closed
router.post("/destroy-session", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).render("suspended");
    } else {
      res.sendStatus(200);
    }
  });
});

// // router.get("/live/votes", async (req, res) => {
// //   try {
// //     // Fetch admin dashboard data using the admin controller
// //     const awards = await adminController.getDashboardData();
// //     res.render("votes", { awards });
// //   } catch (error) {
// //     console.error("Error fetching admin dashboard data:", error);
// //     res.status(500).send("Internal Server Error");
// //   }
// // });

// router.get("/live/votes", async (req, res) => {
//   try {
//     res.render("suspended");
//   } catch (error) {
//     console.error("Error rendering index:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

module.exports = router;
