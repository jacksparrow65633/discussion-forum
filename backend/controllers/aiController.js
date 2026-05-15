const { GoogleGenAI } = require("@google/genai");
const {
    PostIdeasPrompt,
    generateReplyPrompt,
    SummaryPrompt,
    postIdeasPrompt,
    postSummaryPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate content from title
// @route   POST /api/ai/generate
// @access  Private
const generatePost = async (req, res) => {
    try {
        const { title, tone } = req.body;
        if (!title || !tone) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = `Write a clean markdown-formatted blog post titled "${title}". Use a ${tone} tone. Include an introduction, headings, and a conclusion. Do NOT include any code blocks, programming examples, scripts, or technical snippets.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        // Updated: safe access to response
        let rawText = response.output_text || response.text || "";
        if (!rawText) {
            return res.status(500).json({ message: "AI returned empty response" });
        }

        res.status(200).json(rawText);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate post",
            error: error.message,
        });
    }
};

// @desc    Generate post ideas from title
// @route   POST /api/ai/generate-ideas  // fixed typo
// @access  Private
const generatePostIdeas = async (req, res) => {
    try {
        const { topics } = req.body;

        if (!topics) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = postIdeasPrompt(topics);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        let rawText = response.output_text || response.text || "";
        if (!rawText) {
            return res.status(500).json({ message: "AI returned empty response" });
        }

        // Clean it: Remove ```json and ``` from beginning and end
        const cleanedText = rawText
            .replace(/^```json\s*/, "")
            .replace(/```$/, "")
            .trim();

        // Safe JSON parse
        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON parsing error:", e, "rawText:", rawText);
            return res.status(500).json({ message: "Failed to parse AI output" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate post ideas",
            error: error.message,
        });
    }
};

// @desc    Generate comment reply
// @route   POST /api/ai/generate-reply
// @access  Private
const generateCommentReply = async (req, res) => {
    try {
        const { author, content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = generateReplyPrompt({ author, content });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        let rawText = response.output_text || response.text || "";
        if (!rawText) {
            return res.status(500).json({ message: "AI returned empty response" });
        }

        res.status(200).json(rawText);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate comment reply",
            error: error.message,
        });
    }
};

// @desc    Generate post summary
// @route   POST /api/ai/generate-summary
// @access  Private
const generatePostSummary = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = postSummaryPrompt(content);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        let rawText = response.output_text || response.text || "";
        if (!rawText) {
            return res.status(500).json({ message: "AI returned empty response" });
        }

        const cleanedText = rawText
            .replace(/^```json\s*/, "")
            .replace(/```$/, "")
            .trim();

        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON parsing error:", e, "rawText:", rawText);
            return res.status(500).json({ message: "Failed to parse AI output" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate post summary",
            error: error.message,
        });
    }
};

module.exports = {
    generatePost,
    generatePostIdeas,
    generateCommentReply,
    generatePostSummary,
};