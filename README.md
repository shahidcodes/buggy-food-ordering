# Food Ordering Application

# Submission

- You're required to fork the repo and submit a pull request for your changes
- Make sure you write the commit message properly
- Make sure to do one commit per issue, do not commit several issues together.

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and database connection
├── models/         # MongoDB/Mongoose data models
├── pages/          # Next.js pages and API routes
├── store/          # Global state management with Zustand
├── styles/         # CSS styles
└── utils/          # Helper functions
```

## Tech Stack

- **Framework**: Next.js with TypeScript
- **UI**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Authentication**: Custom JWT implementation
- **Form Handling**: React Hook Form
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB running locally or a MongoDB Atlas account
- Docker and Docker Compose installed (optional, for local mongodb)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shahidcodes/buggy-food-ordering
   cd buggy-food-ordering
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Run local mongodb using docker compose:

```bash
cd docker && docker-compose up -d
```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
