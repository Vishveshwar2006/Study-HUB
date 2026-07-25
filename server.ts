import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});
// Endpoint 1: Lesson Generator
app.post("/api/ai/lesson-generator", async (req, res) => {
  try {
    const { subject, topic, gradeLevel } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ error: "Subject and Topic are required" });
    }

    const prompt = `Create a high-quality educational lesson plan and resource for the following:
Subject: ${subject}
Topic: ${topic}
Grade Level / Physics Category: ${gradeLevel || "High School Physics Level"}

Please output highly structured Markdown content that is easy to read. Organize the response strictly into these 4 sections:
1. **Overview & Objectives**: An elegant summary of what the student will master, written in a clear, highly encouraging tone.
2. **Core Lessons (Dry Concepts Explained Simply)**: Break down the concept into 3 structured bullet points or sub-sections using very interactive, simple examples.
3. **Solved Examples**: Show 2 comprehensive step-by-step solved sample problems or standard application questions.
4. **Physics Practice Questions**: Provide 3 challenging diagnostic questions for the student to solve on their own, with brief hints for each.

Format it beautifully using clean Markdown headings, horizontal rules, and bold emphasis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let markdownText = response.text || "Failed to generate content.";
    
    // Extract search grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sourcesList = chunks
        .map((chunk: any) => {
          const title = chunk.web?.title || chunk.web?.uri || "Search Reference";
          const uri = chunk.web?.uri;
          return uri ? `- [${title}](${uri})` : null;
        })
        .filter(Boolean);

      if (sourcesList.length > 0) {
        markdownText += `\n\n---\n**🌐 Search Grounding References**:\n` + sourcesList.join("\n");
      }
    }

    res.json({ content: markdownText });
  } catch (error: any) {
    console.error("Error in /api/ai/lesson-generator:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint 2: AI Teacher Evaluator / Grading helper
app.post("/api/ai/grade", async (req, res) => {
  try {
    const { studentName, subject, testTitle, score, maxMarks, notes } = req.body;
    if (!studentName || !subject || score === undefined || maxMarks === undefined) {
      return res.status(400).json({ error: "Student name, subject, test details and scores are required" });
    }

    const percentage = ((score / maxMarks) * 100).toFixed(1);
    const prompt = `You are an elite academic personal coach.
Provide a highly encouraging, structured diagnostic feedback report for a student based on their test performance.

---
Student: ${studentName}
Subject: ${subject}
Assessment Name: ${testTitle}
Obtained Score: ${score} out of ${maxMarks} (${percentage}%)
Teacher's Custom Class Notes / Observations: ${notes || "No special notes provided."}
---

Please structure your response in Markdown with the following clear headings:
### 📊 Performance Analysis
Provide a professional, honest but encouraging appraisal of their percentage and standing. Highlight their strengths.

### 🔍 Key Learning Gaps & Pitfalls
Analyze where they likely slipped up or need core conceptual alignment (based on the subject, score, and any notes).

### 📈 Recommended Action Plan
Give 3 concrete, step-by-step actionable learning steps for the student to improve. Focus on practical studying techniques, specific practice areas, or schedule discipline.

### 💡 Motivational Message
A personal, uplifting sign-off note to boost the student's confidence. Include a custom quote or coaching mantra.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let feedbackText = response.text || "Feedback could not be generated.";

    // Extract search grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sourcesList = chunks
        .map((chunk: any) => {
          const title = chunk.web?.title || chunk.web?.uri || "Search Reference";
          const uri = chunk.web?.uri;
          return uri ? `- [${title}](${uri})` : null;
        })
        .filter(Boolean);

      if (sourcesList.length > 0) {
        feedbackText += `\n\n---\n**🌐 Search Grounding References**:\n` + sourcesList.join("\n");
      }
    }

    res.json({ feedback: feedbackText });
  } catch (error: any) {
    console.error("Error in /api/ai/grade:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint 3: Student AI Chat Assistant (with context)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, lessonTitle, subjectName, model, chatbotRole } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Valid message history array is required" });
    }

    const selectedModel = model || "gemini-3.5-flash";
    const roleKey = chatbotRole || "tutor";

    let roleSystemName = "AI Physics & STEM Tutor";
    let roleToneAndPurpose = "You are an expert STEM educator. You can break down complex physical chemistry, Limits evaluations, de Broglie waves, Newton's laws of motion, or composite Chain rules with absolute mathematical clarity.";
    
    if (roleKey === "admissions") {
      roleSystemName = "Admissions Counselor";
      roleToneAndPurpose = "You are the official Admissions Counselor for MP Digital School. You specialize in guiding prospective students and parents through our academic programs, batches, faculty, smart computer labs, fee structures, and online registration procedure. You help them take their next academic steps with enthusiasm!";
    } else if (roleKey === "coach") {
      roleSystemName = "Academic Study Coach";
      roleToneAndPurpose = "You are an elite academic personal coach and study mentor. You specialize in helping students with study strategies, timetables, discipline, mental resilience, motivation, exam preparation tips, and maintaining a high-performance streak.";
    }

    // Let's model a clean conversational context with actual website data loaded dynamically
    const contextInstruction = `You are the official ${roleSystemName} for **MP Digital School**, powered by state-of-the-art Artificial Intelligence.
${roleToneAndPurpose}

You have complete access to the official data of **MP Digital School** to answer any questions precisely:

--- OFFICIAL WEBSITE DATA & KNOWLEDGE SYSTEM ---

1. **Academic Programs & Batches Offered**:
   * **Advanced Mathematics & Analytical Mechanics (IIT-JEE Mains & Advanced Prep)**: Deep-dives into coordinate geometry, core calculus integration, electromagnetism, and classical mechanics. Focuses heavily on speed-optimization shortcuts and board-level step-by-step derivations. Program duration is a 1 / 2 Year course. Cost is $1500 per trimonthly term (early bird scholarships available).
   * **Biology Crackers & Applied Organic Chemistry (NEET UG Elite Coaching)**: Comprehensive syllabus coverage of plant physiology, genetics algorithms, evolutionary taxonomy, inorganic chemical reactions, and physical chemistry calculations. Program duration is a 1 / 2 Year course. Cost is $1500 per trimonthly term.
   * **Higher Secondary Science & Computing Labs (Advanced Scientific Boards Prep)**: Nurtures high-school students for board-level toppers lists. Includes integrated support with our allotted desk computers for simulated CBSE/ICSE programming and theoretical science assessments. Duration: Full Academic Year. Cost is $1500.

2. **Faculty Members / Expert Tutors**:
   * **Dr. Rachel Green**: Leads the Advanced Mathematics & Calculus team. Directs lessons on limits, continuity, derivative chain rules, nested composites, and rates of change.
   * **Prof. Alan Turing**: Directs Scientific Computing, matter wave probability amplitudes, and Machine Learning bootcamp structures.
   * **Sienna Miller**: Leads organic chemistry bootcamps, molecular structures, and hydrocarbons formulation.

3. **Smart Computer Labs & Physical Computer Desks**:
   * MP Digital School features highly modern, designated computing hubs: "Lab Alpha" and "Lab Beta".
   * Equipped with physical computer desks having unique identifiers (e.g., LAB-PC-01, LAB-PC-02, LAB-PC-03 in Lab Alpha; LAB-PC-04, LAB-PC-05 in Lab Beta) and corresponding dedicated local IP configurations (e.g., 192.168.1.101 to 192.168.1.105).
   * Access to these computer desks is activated/unlocked dynamically via the student's physical or digital QR Code Attendance Passes which contain their profile metadata to prevent key lockouts or unauthorized overrides.

4. **Tuition Fee Structure**:
   * Standard trimonthly bootcamp tuition cost is $1500.
   * Printed handbooks and study guides (like the printed Organic Chemistry Revision handbook) are priced at $250.
   * We support dynamic scholarship discounts. Early bird settlements are verified and recorded on student ledgers securely.

5. **Student Account Registration Process**:
   * An inspiring prospective student can register online on the MP Digital School public web portal.
   * Required fields include: Name, Preferred Batch (e.g., Alpha Calculus Elite, Quantum Mechanics Core, Hydrocarbons Bootcamp), Current School, Email, and Mobile number.
   * Upon submitting registration, the engine automatically creates a secure Student profile, generates a highly unique Roll Number starting with "RJ2026" followed by 4 random digits (e.g., RJ20267021), and provides a 6-character secure access credentials password.
   * **CRITICAL POLICY**: To ensure student cohort safety, new online-registered accounts start in an "Inactive" status. A standard registrar verification window of up to 24 hours is required, after which the administrator approves the profile, changing the status to "Active" and unleashing automatic classroom computer desk allotment keys.

6. **Location & Contact Hotline**:
   * Visitors can drop by our campus physically on Saturdays accompanied by their parents or guardian.
   * Inquiries submitted via our contact forms (Lead Generation system) receive immediate counselor callbacks.

--- BEHAVIORAL PROTOCOLS ---
- **Context Relevance**: You are helping with "${lessonTitle || "Academic Consultation"}" under the category: "${subjectName || "Public Hotline"}".
- **Tone**: Warm, encouraging, precise, professional, and academically distinguished. 
- **Formatting**: Format explanations beautifully with clean, readable Markdown layout, bullet points, headers, mathematical notations, and clean spacing.
- **Next Steps Guidelines**: Keep answers concise yet fully comprehensive of the truth. When talking about admissions, direct the client to register via our Public Portal join link or check outstanding ledgers. If relevant, ask a clever conceptual follow-up or check if they want to speak with one of our counselors. Do NOT provide fake/fictional contact numbers or emails - always reference official portal routines. Ensure all student password info or secure credentials policies are handled strictly. Avoid robotic or template-sounding intro statements. Proceed to reply to the user's message now.`;

    // Package the history for Gemini. We can use chat format or simply pack into a structured prompt
    const chatContents = messages.map((m: any) => {
      return `${m.role === "user" ? "Student" : roleSystemName}: ${m.content}`;
    }).join("\n");

    const fullPrompt = `${contextInstruction}\n\nChat History:\n${chatContents}\n\n${roleSystemName}:`;

    // Only apply googleSearch tool to supporting models
    const hasSearch = ["gemini-3.5-flash", "gemini-3.1-pro-preview"].includes(selectedModel);

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: fullPrompt,
      config: {
        tools: hasSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    let replyText = response.text || "I'm having a hard time formulating a response.";

    if (hasSearch) {
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const sourcesList = chunks
          .map((chunk: any) => {
            const title = chunk.web?.title || chunk.web?.uri || "Search Reference";
            const uri = chunk.web?.uri;
            return uri ? `- [${title}](${uri})` : null;
          })
          .filter(Boolean);

        if (sourcesList.length > 0) {
          replyText += `\n\n---\n**🌐 Search Grounding References**:\n` + sourcesList.join("\n");
        }
      }
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Serve frontend assets & Start Server Listener
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Physics tutor server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
