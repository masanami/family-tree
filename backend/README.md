# Family Tree Backend API

RESTful API for managing family tree data with person information and family relationships.

## Tech Stack
- Node.js with TypeScript
- Express.js
- PostgreSQL
- Jest for testing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start PostgreSQL:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Persons
- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get person by ID
- `GET /api/persons/search?q=query` - Search persons
- `POST /api/persons` - Create new person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person

### Relationships
- `GET /api/relationships` - Get all relationships
- `GET /api/relationships/:id` - Get relationship by ID
- `GET /api/relationships/person/:personId` - Get person's relationships
- `GET /api/relationships/person/:personId/children` - Get person's children
- `GET /api/relationships/person/:personId/parents` - Get person's parents
- `GET /api/relationships/person/:personId/siblings` - Get person's siblings
- `GET /api/relationships/person/:personId/spouses` - Get person's spouses
- `POST /api/relationships` - Create new relationship
- `PUT /api/relationships/:id` - Update relationship dates
- `DELETE /api/relationships/:id` - Delete relationship

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking