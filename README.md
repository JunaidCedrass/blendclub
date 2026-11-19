# BlendClub

Static BlendClub smoothie ordering page for field-side pickup.

## Project structure

```text
BlendClub/
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       └── blendclub-logo.jpeg
└── apps-script/
	└── Code.gs
```

`apps-script/Code.gs` contains the Google Apps Script order endpoint used by the checkout flow.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Netlify deployment

Connect the repository to Netlify and deploy the branch containing these files.
The included `netlify.toml` runs `npm run build` and publishes `dist`. If the
site has build settings configured in the Netlify dashboard, check that they
also use that build command and publish directory.
