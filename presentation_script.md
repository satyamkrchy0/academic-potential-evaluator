# 🎬 EmployEdge: Voiceover & Screen Recording Script

This script is formatted specifically for your setup: **Record your screen on your PC, and read this script from your second device.** 

Pace your actions on screen to match the voiceover. 

---

## ⚙️ Preparation Before Recording
1. **VS Code:** Open `dashboard.html`, `server.js` (or your backend controller), and `app.py` (your ML model script) in separate tabs.
2. **Browser:** Open `http://localhost:3000/dashboard.html` and be logged in. 
3. **Start Screen Recording** on your PC.

---

### Scene 1: The Problem & Introduction (0:00 - 0:40)

**🖥️ VISUAL (On PC):** 
* Start with the browser open to the `Dashboard` at the top.
* Slowly move your mouse over the "Profile Readiness" ring and the KPI cards to show the hover effects. 

**🎙️ VOICEOVER (Read from 2nd Device):**
> "Hello everyone, I'm Satyam, and this is EmployEdge—an AI-powered platform designed to predict a student's employment readiness. 
>
> Today, students rely heavily on CGPA, but recruiters look for much more—coding skills, communication, and internships. EmployEdge takes a holistic look at a student's entire profile and uses a custom Machine Learning model to calculate their exact placement probability and provide actionable career advice."

---

### Scene 2: The Architecture & Code (0:40 - 1:30)

**🖥️ VISUAL (On PC):** 
* Alt+Tab to **VS Code**.
* *When you say "Frontend":* Click the `dashboard.html` tab. Scroll slightly.
* *When you say "Gateway":* Click the `server.js` tab.
* *When you say "Brain":* Click the `app.py` tab.

**🎙️ VOICEOVER:**
> "Before showing the demo, let's look under the hood. I designed this using a modern, 3-layer architecture.
>
> First, the Frontend. I built this entirely with vanilla HTML, CSS, and JS to maximize performance, creating a premium glassmorphism UI from scratch.
> 
> Second, the Gateway. This is a Node.js and Express backend that handles secure JWT authentication and stores user history in MongoDB.
>
> Finally, the Brain. This is a Python Flask API running a custom Artificial Neural Network. I trained this model using TensorFlow on 45,000 student records to ensure highly accurate predictions."

---

### Scene 3: The Live Evaluation (1:30 - 2:45)

**🖥️ VISUAL (On PC):** 
* Alt+Tab back to the **Browser (Dashboard)**.
* Scroll down to the **"New Evaluation"** form. 
* Slowly fill it out: Select Degree, adjust the CGPA slider, click the star ratings for Coding and Communication.
* Hover over the **"Analyze Profile 🚀"** button, then click it. 
* Let the skeleton loaders run. Once the result appears, scroll down to show the AI Career Plan.

**🎙️ VOICEOVER:**
> "Let's see it in action. On the dashboard, a student can run a new evaluation by inputting their academics and self-assessing their skills using these interactive sliders and star ratings.
>
> When I click 'Analyze', the Node backend instantly routes this data to the Python ML Engine. 
> 
> The neural network evaluates the profile and returns a confidence score. But it doesn't stop there. The platform dynamically generates an 'AI Career Plan', highlighting specific strengths, and pinpointing risk factors—like a lack of internships—so the student knows exactly what to improve."

---

### Scene 4: Profile & Image Processing (2:45 - 3:30)

**🖥️ VISUAL (On PC):** 
* Click **"My Profile"** in the left sidebar.
* Scroll slightly to show the skill progress bars and achievement badges.
* Hover over the large Profile Avatar at the top. Click the 📷 camera icon, select a picture, and upload it. 

**🎙️ VOICEOVER:**
> "The platform is highly personalized. On the Profile page, metrics are visualized through gamified achievement badges and skill bars.
>
> I've also built client-side image processing. When a user uploads a profile picture, the frontend automatically center-crops and resizes the image using the HTML5 Canvas API for highly efficient local storage. It instantly syncs across the entire dashboard."

---

### Scene 5: History & PDF Export (3:30 - 4:15)

**🖥️ VISUAL (On PC):** 
* Click **"Evaluation History"** in the left sidebar.
* Click the search bar and type "CSE" or "B.Tech" to show the filter working, then clear it.
* Click the **"🔍 View"** button on one of the rows. 
* When the modal opens, click **"📄 Download PDF"**. Open the downloaded PDF.

**🎙️ VOICEOVER:**
> "Every prediction is securely saved to the database. The History page allows students to track their progress over time, complete with a fast, client-side search and filter system.
>
> Students can view the exact details of any past evaluation. And with a single click, the platform generates a beautifully formatted PDF report containing all their metrics and AI advice, which they can easily share with mentors or career counselors."

---

### Scene 6: Conclusion (4:15 - 4:45)

**🖥️ VISUAL (On PC):** 
* Close the PDF and go back to the sleek **Dashboard** page. Move the mouse around to show the custom green cursor and the particles.

**🎙️ VOICEOVER:**
> "To wrap up, EmployEdge isn't just a prototype—it's built to the standards of a production SaaS application, featuring secure authentication, cross-origin resource sharing, and a scalable machine learning pipeline. 
>
> My next goal is to integrate a Generative AI model for conversational career coaching. 
>
> Thank you! I'm happy to answer any questions about the ML model, the architecture, or the UI design."
