# Security Guidelines

## 🔐 Sensitive Files (NEVER COMMIT)

The following files contain sensitive information and are protected in `.gitignore`:

- `CREDENTIALS.md` - All API keys, passwords, and OAuth credentials
- `.env`, `.env.local`, `.env*.local` - Environment variables
- `*.key`, `*.p8`, `*.p12`, `*.jks` - Certificate and keystore files
- `secrets/` - Any secrets directory

## ✅ Current Security Status

- ✅ Repository: **PRIVATE** on GitHub
- ✅ CREDENTIALS.md: **IGNORED** by git
- ✅ Environment files: **PROTECTED** by .gitignore

## 🛡️ Best Practices

1. **Never commit API keys or passwords** - Always use environment variables
2. **Use `.env.example` files** - Provide templates without actual values
3. **Review before commit** - Always run `git status` before committing
4. **Rotate compromised keys** - If a key is accidentally committed, rotate it immediately

## 📝 Environment Variables Setup

### Web App
1. Copy `web/.env.example` to `web/.env.local`
2. Fill in your Supabase URL and Anon Key from `CREDENTIALS.md`
3. Never commit `.env.local`

### Mobile App
1. Copy `mobile/.env.example` to `mobile/.env`
2. Fill in your credentials from `CREDENTIALS.md`
3. Never commit `.env`

## 🚨 Emergency Response

If you accidentally commit sensitive data:

1. **Rotate all compromised keys immediately**
2. Remove the commit from history using `git filter-branch` or BFG Repo-Cleaner
3. Force push to remote (if already pushed)
4. Consider the keys/passwords permanently compromised

## 📞 Contact

For security concerns, contact the repository owner immediately.

