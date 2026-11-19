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

## Orders and delivery

Customers select a delivery area: nearby (R15), local (R25), or outer (R35).
The area is self-selected, not verified by distance. Define which addresses
belong to each area before launch, and check each delivery address manually.
No Google Maps API key or Google Cloud billing is required for this checkout.

Create a Google spreadsheet, open **Extensions > Apps Script**, and copy
`apps-script/Code.gs` into the project. Deploy it as a web app executing as
your account with access for anyone, and authorize it. Set the Netlify
environment variable `SHEETS_URL` to the deployment's `/exec` URL, then
redeploy the website. Update the Apps Script deployment to a new version after
changing its code. The spreadsheet stays private; the first order creates an
Orders tab with headings. If the tab already exists, its eighth column now
holds the selected area; rename the heading to Delivery Area if needed.

Order submission runs through a Netlify function so the website can confirm
the Apps Script response. Netlify Functions and Apps Script have usage limits.
If a request fails after the sheet was updated, confirmation can be uncertain:
check the sheet before resubmitting to avoid duplicate orders. Test a pickup
and a delivery order on the deployed site before accepting real orders.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

Run checks with `node --test tests`. The Vite development server
does not run Netlify Functions; use Netlify Dev with `SHEETS_URL` configured or
test order submission on the deployed site.

## Netlify deployment

Connect the repository to Netlify and deploy the branch containing these files.
The included `netlify.toml` runs `npm run build` and publishes `dist`. If the
site has build settings configured in the Netlify dashboard, check that they
also use that build command and publish directory.
