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

The workflow is configured for Scholar user `U67qcK8AAAAJ` and runs weekly. It can
also be launched from **Actions → Update publications from Google Scholar → Run workflow**.

To show only selected publications, add a repository Actions variable named
`SCHOLAR_PUBLICATION_IDS`. Its value should be a comma-separated list of the IDs
after the colon in Scholar citation URLs, for example `abc123,def456`. If the
variable is empty, all publications are fetched. Every selected publication is
fully loaded so its complete co-author list is included.

Important: the Scholar profile must be public. A private profile is visible only
inside its owner's signed-in Google session, so GitHub Actions and a public GitHub
Pages site cannot read it. The updater exits safely without replacing the existing
publication data when the profile is private or unavailable. Google Scholar does
not provide an official public API; this workflow uses the third-party `scholarly`
package, so occasional failure is possible.

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
