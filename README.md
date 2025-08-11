# Overeasy - AI-Powered Web Application Security Testing Platform

Overeasy is an intelligent security testing platform that leverages AI agents to automatically discover and test for vulnerabilities in web applications. It learns from security documentation and applies that knowledge to perform comprehensive security assessments.

## 🎯 Overview

Overeasy combines the power of AI with automated testing to help developers identify security vulnerabilities in their web applications. The platform:

- **Learns** from security articles, documentation, and vulnerability reports
- **Tests** applications using AI agents that understand and apply security best practices
- **Tracks** vulnerabilities and provides detailed evidence for remediation
- **Evolves** by continuously learning from new security resources

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React + TypeScript with TanStack Router
- **Backend**: tRPC + Prisma + PostgreSQL
- **AI/ML**: Anthropic Claude (via AI SDK)
- **Testing**: Playwright for browser automation
- **Infrastructure**: Docker, Nginx, MinIO for storage
- **Authentication**: Google OAuth with JWT tokens
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS

### Key Components

```
overeasy/
├── src/
│   ├── routes/           # TanStack Router pages
│   ├── components/       # React components
│   ├── server/
│   │   ├── ai/          # AI agents and tools
│   │   │   ├── agents/  # Testing & learning agents
│   │   │   ├── tools/   # Firecrawl, Playwright, network tools
│   │   │   └── prompts/ # Agent system prompts
│   │   ├── trpc/        # API procedures and routers
│   │   ├── auth.ts      # JWT authentication
│   │   └── freestyle.ts # VM management API
│   ├── schemas/         # Zod validation schemas
│   └── stores/          # Zustand state management
├── prisma/              # Database schema
└── docker/              # Docker configuration
```

## 🚀 Features

### 1. **Project Management**

- Create projects for different web applications
- Define target URLs and testing contexts
- Organize security testing efforts by application

### 2. **Learning Extraction**

- Input URLs of security articles, CVE reports, or documentation
- AI agents automatically extract and summarize security learnings
- Build a knowledge base specific to your application's tech stack

### 3. **Automated Security Testing**

- AI agents test applications based on accumulated learnings
- Uses multiple testing approaches:
  - **Web Scraping**: Firecrawl for content analysis
  - **Browser Automation**: Playwright for dynamic testing
  - **API Testing**: Direct HTTP requests to endpoints
  - **VM Execution**: Python scripts in isolated environments
- Generates comprehensive test reports with evidence

### 4. **Vulnerability Management**

- Categorizes vulnerabilities by severity (Critical, High, Medium, Low)
- Provides detailed evidence including:
  - Steps to reproduce
  - Request/response data
  - Python test scripts
  - Screenshots (via Playwright)
- Tracks remediation status

### 5. **Agent Execution Viewer**

- Real-time visibility into AI agent thinking process
- Shows tool calls, responses, and reasoning
- Helps understand how vulnerabilities were discovered

## 🔄 How It Works

### Learning Phase

1. **Input Security Resources**

   - User provides URLs to security articles, CVEs, or documentation
   - Can include OWASP guides, security blogs, or vulnerability reports

2. **Content Extraction**

   - Learning Extractor agent uses Firecrawl to scrape content
   - Processes and cleans the extracted text
   - Identifies key security concepts and vulnerabilities

3. **Knowledge Storage**
   - Stores summarized learnings in the database
   - Links learnings to specific projects
   - Builds a contextual security knowledge base

### Testing Phase

1. **Test Initialization**

   - User triggers a test run for a project
   - System spins up an isolated VM for testing
   - Loads all relevant learnings for the project

2. **Reconnaissance**

   - Testing agent analyzes the target application
   - Uses Firecrawl to understand page structure
   - Extracts JavaScript files to find API endpoints
   - Maps application functionality

3. **Vulnerability Testing**

   - For each learning, designs specific test cases
   - Executes tests using multiple approaches:
     - **Playwright**: Automated browser testing for XSS, CSRF, etc.
     - **Python Scripts**: Custom exploitation scripts in VM
     - **API Calls**: Direct endpoint testing for injection, auth bypass
   - Systematically checks for:
     - Injection vulnerabilities (SQL, Command, XSS)
     - Authentication/Authorization flaws
     - Data exposure issues
     - Business logic vulnerabilities
     - Configuration problems

4. **Evidence Collection**

   - Documents each finding with:
     - Vulnerability description and impact
     - Reproduction steps
     - Test scripts used
     - Request/response pairs
     - Browser screenshots (when applicable)

5. **Reporting**
   - Generates comprehensive test report
   - Categorizes findings by severity
   - Provides remediation guidance

## 🛠️ Installation & Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- pnpm package manager
- Google OAuth credentials
- Anthropic API key
- Firecrawl API key

### Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
BASE_URL=http://localhost:8000
ADMIN_PASSWORD=your_admin_password
ANTHROPIC_API_KEY=your_anthropic_key
JWT_TOKEN=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FREESTYLE_API_URL=https://api.freestyle.sh
FIRECRAWL_API_KEY=your_firecrawl_key
```

### Running the Application

1. **Start with Docker:**

   ```bash
   ./scripts/run
   ```

2. **Database Setup:**

   ```bash
   pnpm prisma db push
   ```

3. **Development Mode:**

   ```bash
   pnpm dev
   ```

4. **Type Checking & Linting:**
   ```bash
   pnpm i && pnpm typecheck && pnpm lint
   ```

## 🔌 Integrations

### Firecrawl

- Web scraping and content extraction
- JavaScript analysis
- Link discovery
- Screenshot capture

### Playwright

- Browser automation for dynamic testing
- JavaScript execution context
- Form interaction and submission
- Cookie and session manipulation
- Visual regression testing

### Freestyle VMs

- Isolated Linux environments for testing
- Python script execution
- Package installation (pip, apt-get)
- Network request capabilities
- File system access for test artifacts

### MinIO

- Object storage for test artifacts
- Screenshots and evidence storage
- Test script archival

## 🔐 Security Architecture

### Authentication

- Google OAuth for user authentication
- JWT tokens for stateless session management
- Token-based API authentication

### Isolation

- Each user gets dedicated VM for testing
- Tests run in isolated environments
- No cross-contamination between projects

### Data Protection

- Sensitive data encrypted at rest
- Secure token storage in browser
- API keys managed server-side only

## 📊 Database Schema

### Core Models

- **User**: Google OAuth users with VM assignments
- **Project**: Target applications for testing
- **Learning**: Extracted security knowledge
- **TestRun**: Security test executions
- **Vulnerability**: Discovered security issues
- **AgentExecution**: AI agent activity logs

## 🤖 AI Agents

### Learning Extractor Agent

- **Model**: Claude 3.5 Sonnet
- **Purpose**: Extract security insights from documentation
- **Tools**: Firecrawl for web scraping
- **Output**: Structured learnings with summaries

### Testing Agent

- **Model**: Claude 3.5 Sonnet
- **Purpose**: Perform security testing based on learnings
- **Tools**:
  - Firecrawl for reconnaissance
  - Playwright for browser automation
  - VM execution for custom scripts
  - Network requests for API testing
- **Output**: Vulnerability reports with evidence

## 🎨 UI Features

### Dashboard

- Project overview with learning counts
- Quick access to recent test runs
- Vulnerability statistics

### Project View

- Learning management interface
- Test run history
- Vulnerability tracking
- Settings and configuration

### Execution Viewer

- Real-time agent activity monitoring
- Tool call visualization
- Reasoning transparency
- Step-by-step execution logs

## 🚦 Development Workflow

1. **Code Organization**

   - Server code in `src/server/`
   - tRPC procedures in individual files
   - Zod schemas for validation
   - TypeScript throughout

2. **Best Practices**

   - Use `~/...` imports (maps to `src/...`)
   - Stateless JWT authentication
   - Atomic tRPC procedures
   - Comprehensive error handling

3. **Testing Strategy**
   - AI agents handle security testing
   - Playwright for UI automation
   - VM-based isolation for safety
   - Evidence-based vulnerability reporting
