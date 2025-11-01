# Contributing to Back To Base

Thank you for your interest in contributing to Back To Base! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists
- Provide clear use case
- Explain expected behavior
- Consider implementation complexity

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure backend tests pass
   - Test frontend functionality
   - Check responsive design

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add participant export feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Add screenshots for UI changes

## 📝 Code Style Guidelines

### JavaScript/React

- Use ES6+ features
- Functional components with hooks
- Destructure props
- Use meaningful variable names
- Add JSDoc comments for functions

```javascript
/**
 * Sends invitation emails to participants
 * @param {string} eventId - The event ID
 * @param {Array} participantIds - Array of participant IDs
 * @returns {Promise<Object>} Result of email sending
 */
const sendInvitations = async (eventId, participantIds) => {
  // Implementation
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Group related classes
- Use semantic color names

```jsx
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Submit
</button>
```

### API Design

- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Clear error messages

```javascript
// Success
{
  status: 'success',
  message: 'Operation completed',
  data: { ... }
}

// Error
{
  status: 'error',
  statusCode: 400,
  message: 'Validation error',
  errors: [...]
}
```

## 🧪 Testing

### Backend Testing

```bash
cd server
npm test
```

### Frontend Testing

```bash
cd client
npm test
```

### Manual Testing Checklist

- [ ] Authentication flow
- [ ] Event CRUD operations
- [ ] CSV upload
- [ ] Email sending
- [ ] Check-in process
- [ ] Theme toggle
- [ ] Responsive design
- [ ] Error handling

## 📁 Project Structure

```
backtobase/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
└── server/          # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── middleware/
    └── package.json
```

## 🎯 Development Workflow

1. **Setup development environment**
   ```bash
   # Backend
   cd server
   npm install
   npm run dev

   # Frontend
   cd client
   npm install
   npm start
   ```

2. **Make changes**
   - Write clean, documented code
   - Follow existing patterns
   - Test thoroughly

3. **Commit changes**
   - Use conventional commits
   - Keep commits focused

4. **Submit PR**
   - Ensure all tests pass
   - Update documentation
   - Request review

## 🏷️ Commit Message Convention

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add WhatsApp notification integration
fix: resolve check-in token expiration issue
docs: update Gmail OAuth setup guide
style: format code with prettier
refactor: extract email service to separate module
test: add unit tests for participant controller
chore: update dependencies
```

## 🐛 Debugging Tips

### Backend

```javascript
// Add debug logs
console.log('Debug:', variableName);

// Use debugger
debugger;

// Check error details
console.error('Error:', error.message);
console.error('Stack:', error.stack);
```

### Frontend

```javascript
// React DevTools
// Component inspection
// Props and state debugging

// Console debugging
console.log('Component props:', props);
console.log('State:', state);
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Nodemailer Guide](https://nodemailer.com/)

## 🔒 Security

- Never commit sensitive data (API keys, passwords)
- Use environment variables
- Validate all user input
- Sanitize data before database operations
- Follow OWASP security guidelines

## 📋 PR Checklist

Before submitting:

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commits are clear
- [ ] Branch is up to date
- [ ] No console errors
- [ ] Responsive design checked
- [ ] Tested in multiple browsers

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Appreciated in project README

## 💬 Community

- Be respectful and inclusive
- Help others learn
- Share knowledge
- Provide constructive feedback

## 📞 Getting Help

- Create an issue for questions
- Join discussions
- Check existing documentation
- Ask the community

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Back To Base! 🚀
