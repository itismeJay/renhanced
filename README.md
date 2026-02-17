# RezuMax 📄

> A professional, full-stack resume builder that lets you create, customize, and export ATS-friendly resumes — deployed and production-ready.

🔗 **Live Demo:** [rezumax.vercel.app](https://rezumax.vercel.app)

---

## 📸 Preview

RezuMax features a real-time preview that mirrors the exported PDF exactly — what you see is what you get.

---

## ✨ Features

- **14 Customizable Section Types** — Education, Experience, Projects, Skills, Certifications, Awards, Leadership, Research, Publications, Volunteer, Languages, Interests, Custom, and Summary
- **Drag-and-Drop Reordering** — Rearrange sections in any order with persistent state
- **Real-Time Preview** — Live resume preview that updates as you type
- **Multi-Page Support** — Preview and PDF automatically paginate when content exceeds one page (Letter size: 8.5" × 11")
- **ATS-Friendly PDF Export** — Download a real PDF with selectable, searchable text (not an image)
- **Auto-Save** — All changes are saved automatically to the database
- **Dynamic Section Visibility** — Toggle sections on/off without deleting your data
- **Clean Jake Ryan Template** — Professional serif design used in top tech resumes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 | Full-stack React framework (App Router) |
| React | UI component library |
| TypeScript | Type safety across the entire codebase |
| TailwindCSS | Utility-first styling |
| React-PDF (`@react-pdf/renderer`) | ATS-friendly PDF generation |

### Backend
| Technology | Purpose |
|---|---|
| Next.js API Routes | Server-side logic |
| Drizzle ORM | Type-safe database queries |
| PostgreSQL | Relational database |

### Infrastructure
| Technology | Purpose |
|---|---|
| Vercel | Frontend deployment & serverless functions |
| PostgreSQL (hosted) | Production database |

---

## 🏗️ Architecture

```
rezumax/
├── app/
│   ├── edit/[resumeId]/          # Resume editor page
│   │   ├── page.tsx              # Main editor layout
│   │   └── resume-preview.tsx    # Live preview panel
│   └── api/                      # API routes
│
├── components/
│   ├── resume/
│   │   ├── JakeRyanResume.tsx    # HTML preview template
│   │   └── sections/
│   │       └── jake-ryan-sections.tsx  # All 14 section components
│   └── pdf/
│       ├── jake-ryan-pdf.tsx     # React-PDF template (mirrors preview)
│       └── download-button.tsx   # PDF export button
│
├── types/
│   └── resume-data.ts            # Shared TypeScript types
│
└── db/
    └── schema.ts                 # Drizzle ORM database schema
```

---

## 🧠 Key Technical Decisions

### Why React-PDF over html2canvas?

| | React-PDF | html2canvas |
|---|---|---|
| Output | Real PDF text | Image embedded in PDF |
| ATS Compatibility | ✅ Fully selectable & searchable | ❌ Not readable by ATS |
| Quality | ✅ Sharp at any zoom | ❌ Pixelated |
| File Size | ✅ Small | ❌ Large image files |

### Component Map Pattern (No Switch Statements)

Instead of a fragile switch statement, section rendering uses an object lookup map:

```typescript
const components: Record<string, React.ComponentType<any>> = {
  summary: JakeRyanSections.SummarySection,
  education: JakeRyanSections.EducationSection,
  experience: JakeRyanSections.ExperienceSection,
  projects: JakeRyanSections.ProjectsSection,
  // ... 10 more sections
};

const SectionComponent = components[section.type];
```

This makes adding new section types trivial — just add one line to the map.

### Multi-Page Preview

The preview uses `ResizeObserver` to dynamically measure content height and renders the correct number of fixed-size page containers (816px × 1056px = Letter size at 96 DPI):

```typescript
const observer = new ResizeObserver(() => {
  const contentHeight = contentRef.current.scrollHeight;
  const pagesNeeded = Math.ceil(contentHeight / CONTENT_HEIGHT);
  setPages(Math.max(1, pagesNeeded));
});
```

Each page uses `translateY` to show the correct slice of content — no resizing, just additional pages.

### Multi-Page PDF

React-PDF handles pagination automatically with:
- `<Page wrap>` — enables automatic page creation
- `wrap={false}` on each entry — prevents entries from splitting across pages
- `minPresenceAhead={36}` — ensures at least 0.5 inch of space before placing an entry

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/itsnotjay/rezumax.git
cd rezumax

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/rezumax

# Auth (if applicable)
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📄 Supported Resume Sections

| Section | Description |
|---|---|
| **Summary** | Professional summary or objective |
| **Education** | Schools, degrees, GPA, coursework |
| **Experience** | Work history with bullet points |
| **Projects** | Personal/professional projects with links |
| **Skills** | Languages, frameworks, tools, libraries |
| **Certifications** | Certificates with issuer and credential ID |
| **Awards** | Honors and recognitions |
| **Leadership** | Leadership roles and achievements |
| **Research** | Academic or professional research |
| **Publications** | Papers, articles, books |
| **Volunteer** | Community and volunteer work |
| **Languages** | Spoken languages with proficiency |
| **Interests** | Personal interests and hobbies |
| **Custom** | Any custom section you define |

---

## 📐 PDF Specifications

| Property | Value |
|---|---|
| Paper Size | US Letter (8.5" × 11") |
| Top/Bottom Padding | 40pt |
| Left/Right Padding | 50pt |
| Font Family | Times New Roman (Times-Roman) |
| Base Font Size | 11pt |
| Line Height | 1.3 |
| Section Title Size | 11pt Bold, Uppercase |
| Name Size | 17.6pt Bold |

---

## 💡 How It Works

```
User edits resume in the editor
        ↓
Changes auto-saved to PostgreSQL via Drizzle ORM
        ↓
JakeRyanResume.tsx renders live HTML preview
(multi-page using ResizeObserver + translateY)
        ↓
User clicks "Export PDF"
        ↓
jake-ryan-pdf.tsx renders same content via React-PDF
(multi-page via wrap + minPresenceAhead)
        ↓
PDF blob generated client-side
        ↓
User downloads ATS-friendly PDF ✅
```

---

## 🌐 Deployment

The app is deployed on **Vercel** with a hosted **PostgreSQL** database.

```bash
# Build for production
npm run build

# Deploy (if using Vercel CLI)
vercel --prod
```

---

## 🗺️ Roadmap

- [ ] Multiple resume templates
- [ ] AI-powered bullet point suggestions
- [ ] Resume sharing via public link
- [ ] Analytics dashboard (views, downloads)
- [ ] Rate limiting for API routes
- [ ] Dark mode editor

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Rb Jay Salamanes**

- GitHub: [@itsmeJay](https://github.com/itsmeJay)
- LinkedIn: [linkedin.com/in/rbjay-salamanes](https://linkedin.com/in/rbjay-salamanes)
- Email: itsnotjaysalamanes@gmail.com

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Jake Ryan Resume Template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs) — Original LaTeX resume design
- [React-PDF](https://react-pdf.org/) — PDF generation library
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM
- [NeetCode](https://neetcode.io/) — For keeping me sharp while building this 😄

---

*Built with ❤️ in Philippines 🇵🇭*
