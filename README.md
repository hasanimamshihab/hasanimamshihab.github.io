# Academic Website for Md Hasan Imam Shihab

A polished, responsive academic portfolio website designed for GitHub Pages.

## What is included

- `index.html` — main website
- `assets/styles.css` — full responsive visual design
- `assets/app.js` — dynamic loading for profile, projects, skills, and publications
- `data/profile.json` — edit your name, title, links, education, research areas, projects, and skills
- `data/publications.json` — displayed publication list
- `scripts/update_publications_from_scholar.py` — optional Google Scholar updater
- `scripts/bibtex_to_publications.py` — stable manual BibTeX-to-JSON fallback
- `.github/workflows/deploy.yml` — deploys the site to GitHub Pages
- `.github/workflows/update-publications.yml` — weekly publication update workflow

## First setup on GitHub Pages

1. Create a GitHub repository named either:
   - `YOUR_GITHUB_USERNAME.github.io` for a personal website, or
   - any repository name, such as `academic-website`, for a project website.
2. Upload all files in this folder to the repository.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions**.
5. Push to the `main` branch. The deploy workflow will publish the website.

## Required edits before publishing

Edit `data/profile.json` and replace:

- `YOUR_SCHOLAR_ID`
- `YOUR_GITHUB_USERNAME`
- `YOUR_LINKEDIN_USERNAME`
- `YOUR_ORCID_ID`
- research text, project text, and education details if needed

Replace `assets/profile-placeholder.svg` with your professional photo if you want.

## Publication update options

### Option A: Automatic Google Scholar refresh

1. Open your public Google Scholar profile URL.
2. Copy the value after `user=`. Example: if the URL is `https://scholar.google.com/citations?user=ABC123`, the ID is `ABC123`.
3. In GitHub, go to **Settings → Secrets and variables → Actions → Variables**.
4. Add a repository variable named `SCHOLAR_USER_ID`.
5. Run **Actions → Update publications from Google Scholar → Run workflow**.

Important: Google Scholar does not provide a stable official public API. This workflow uses the third-party `scholarly` package, so occasional failure is possible. Keep the BibTeX option as a reliable fallback.

### Option B: Manual BibTeX fallback

1. Export publications from Google Scholar as BibTeX.
2. Paste them into `publications.bib`.
3. Run:

```bash
python scripts/bibtex_to_publications.py publications.bib
```

4. Commit and push `data/publications.json`.

## Updating continuously with Codex

Use GitHub as the source of truth. The practical workflow is:

1. Open the GitHub repository in Codex or ChatGPT with GitHub access.
2. Ask Codex to update a section, add a project, improve design, or fix text.
3. Review the changes.
4. Commit or merge the change into `main`.
5. GitHub Actions redeploys the site automatically.

This lets the website improve continuously while every change stays version-controlled.

## Local preview

From the website folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.
