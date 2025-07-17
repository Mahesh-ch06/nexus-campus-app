# 🚀 Nexus Campus App

A comprehensive campus management application built with React, TypeScript, and Supabase.

## 📋 Features

- **Student Dashboard**: Complete profile management, points tracking, leaderboard
- **Authentication**: Secure login/signup with forgot password functionality
- **Events & Clubs**: Browse and join campus events and clubs
- **Digital ID Card**: QR code-based student identification
- **Campus Store**: Browse and purchase campus services
- **Staff Portal**: Points allocation and student management
- **Partner Dashboard**: Business partner integration

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (Database, Auth, Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Quick Start

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CampusConnect-demo.git
   cd CampusConnect-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📸 One-Click Checkpoint System

This project includes a powerful checkpoint system for easy version management:

### Windows Users

**Create a checkpoint:**
```bash
checkpoint.bat create "Added new feature"
```

**List checkpoints:**
```bash
checkpoint.bat list
```

**Restore to a checkpoint:**
```bash
checkpoint.bat restore
```

**Push to GitHub:**
```bash
checkpoint.bat push
```

### PowerShell Users

**Create a checkpoint:**
```powershell
.\checkpoint.ps1 create "Added new feature"
```

**List checkpoints:**
```powershell
.\checkpoint.ps1 list
```

**Restore to a checkpoint:**
```powershell
.\checkpoint.ps1 restore
```

**Push to GitHub:**
```powershell
.\checkpoint.ps1 push
```

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cf3f1bc6-42ae-4000-a6a5-bbc0b84a1227) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cf3f1bc6-42ae-4000-a6a5-bbc0b84a1227) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
