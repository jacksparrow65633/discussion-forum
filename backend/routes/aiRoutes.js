const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { generatePost, generatePostIdeas, generateCommentReply, generatePostSummary } = require("../controllers/aiController");

router.post("/generate", protect, generatePost);
router.post("/generate-ideas", protect, generatePostIdeas);
router.post("/generate-reply", protect, generateCommentReply);
router.post("/generate-summary", protect, generatePostSummary);

module.exports = router;