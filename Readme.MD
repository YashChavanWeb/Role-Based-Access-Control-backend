# 📘 Role-Based Document Sharing System (MERN)

- Role-Based Document Sharing System where access to documents is controlled based on the user's role and team. Users can register, log in, and access documents with different permissions for viewing, editing, and deleting based on the role-based access control logic. The backend is powered by Node.js, Express, and MongoDB, with user authentication handled via JWT and bcrypt for password hashing.
---

## 🔧 Tech Stack

| Layer    | Tech Used              |
| -------- | ---------------------- |
| Frontend | React.js + Axios       |
| Backend  | Node.js + Express      |
| Database | MongoDB + Mongoose     |
| Auth     | JWT + bcrypt           |
| Access   | Custom RBAC middleware |

---

## 🧱 Project Structure

```
backend/
├── controllers/
│   └── authController.js
│   └── documentController.js
│   └── userController.js
├── middlewares/
│   └── auth.js
│   └── accessControl.js
│   └── restrictTo.js
├── models/
│   └── User.js
│   └── Document.js
├── routes/
│   └── authRoutes.js
│   └── documentRoutes.js
│   └── userRoutes.js
├── rbac/
│   └── roles.js
│   └── permissions.js
├── utils/
│   └── generateToken.js
│   └── validateInput.js
├── config/
│   └── db.js
├── .env
├── server.js
```

---

## 🔐 Authentication

### Login/Register (JWT)

- JWT contains: `userId`, `role`, `team`
- Store JWT in **HttpOnly cookies** or Authorization header

### Passwords

- Use `bcrypt` to hash passwords
- Compare hashes during login

---

## 👤 User Model

### `models/User.js`

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  team: { type: String, required: true },
  role: { type: String, enum: ['Junior', 'Senior', 'Head'], default: 'Junior' },
});
```

---

## 📄 Document Model

### `models/Document.js`

```js
const documentSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    type: { type: String, enum: ['manager', 'employee'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: String,
    sharedWithTeam: String, // for manager docs
    editAccessRoles: [String], // ['Senior', 'Head']
  },
  { timestamps: true }
);
```

---

## 🔏 Access Control (RBAC)

### Defined Roles

#### `rbac/roles.js`

```js
module.exports = ['Junior', 'Senior', 'Head'];
```

### Permission Logic

#### `rbac/permissions.js`

```js
exports.checkPermission = (user, doc, action) => {
  const isOwner = doc.ownerId?.toString() === user.userId;
  const isHead = user.role === 'Head';
  const sameTeam = doc.team === user.team || doc.sharedWithTeam === user.team;

  if (action === 'view') {
    if (doc.type === 'manager' && doc.sharedWithTeam === user.team) return { allowed: true };
    if (doc.type === 'employee' && doc.team === user.team) return { allowed: true };
  }

  if (action === 'edit') {
    if (isOwner) return { allowed: true };
    if (doc.type === 'manager' && sameTeam && doc.editAccessRoles.includes(user.role))
      return { allowed: true };
    if (doc.type === 'employee' && sameTeam && (doc.editAccessRoles.includes(user.role) || isHead))
      return { allowed: true };
  }

  if (action === 'delete') {
    if (isOwner) return { allowed: true };
    if (doc.type === 'employee' && sameTeam && isHead) return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient permissions' };
};
```

---

## 🛡️ Middleware

### `middlewares/auth.js`

```js
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
```

### `middlewares/accessControl.js`

```js
const Document = require('../models/Document');
const { checkPermission } = require('../rbac/permissions');

exports.canAccess = (action) => async (req, res, next) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });

  const result = checkPermission(req.user, doc, action);
  if (!result.allowed) return res.status(403).json({ message: result.reason });

  req.document = doc;
  next();
};
```

### `middlewares/restrictTo.js` (for admin actions)

```js
exports.restrictTo =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: role not permitted' });
    }
    next();
  };
```

---

## 📁 Routes

### `routes/authRoutes.js`

```js
router.post('/register', register); // default role = 'Junior'
router.post('/login', login);
```

### `routes/documentRoutes.js`

```js
router.use(verifyToken);

router.post('/', createDocument);
router.get('/:id', canAccess('view'), getDocument);
router.put('/:id', canAccess('edit'), updateDocument);
router.delete('/:id', canAccess('delete'), deleteDocument);
```

### `routes/userRoutes.js`

```js
router.patch('/:id/role', verifyToken, restrictTo('Head'), updateUserRole);
```

---

## ⚙️ Controllers

### `authController.js`

Handles register/login with:

- Password hashing
- JWT generation
- Default role assignment

### `documentController.js`

Handles:

- Creating documents (manager/employee)
- Fetching documents with access control
- Editing/deleting with role checks

### `userController.js`

```js
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await User.findByIdAndUpdate(id, { role });
  res.json({ message: 'Role updated' });
};
```

---

## ✅ Role & Security Checklist

| Feature                      | Status |
| ---------------------------- | ------ |
| Default role on registration | ✅     |
| Prevent role spoofing        | ✅     |
| JWT authentication           | ✅     |
| Access control middleware    | ✅     |
| Head role override           | ✅     |
| Manager document access      | ✅     |
| Employee document access     | ✅     |
| Secure role update endpoint  | ✅     |

---

## 📌 Sample `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/rbac-system
JWT_SECRET=supersecurejwtkey
```

---

## 🚀 Next Steps

1. ✅ Backend: Implement and test with Postman
2. 🔐 Protect routes in frontend (Axios + token)
3. 🧠 Create Admin UI for role management
4. 🧪 Add unit tests (Jest)
5. 📦 Dockerize for deployment (optional)
