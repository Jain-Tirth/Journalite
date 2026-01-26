# Backend

Firebase backend configuration and services for Journalite.

## Structure

```
backend/
├── dataconnect/              # Firebase Data Connect
│   ├── dataconnect.yaml     # Data Connect configuration
│   ├── connector/           # Connector configurations
│   └── schema/              # GraphQL schemas
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
└── storage.rules            # Firebase Storage rules
```

## Firebase Services

### Firestore
- Database for journal entries and user data
- Client-side encryption for sensitive content
- Security rules enforce user-level access control

### Storage
- File storage for journal attachments
- Secure rules for user-specific access

### Data Connect
- GraphQL API for efficient data queries
- Schema-defined data models

## Deployment

Deploy all backend services:
```bash
firebase deploy
```

Deploy specific services:
```bash
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only dataconnect
```

## Security

All backend rules enforce strict user authentication and authorization. Journal entries are encrypted client-side before being stored in Firestore.
