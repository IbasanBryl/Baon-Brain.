# BaonBrain

BaonBrain is a static student-budgeting landing page that helps students track their baon, preview spending risk, and understand how their weekly allowance is being used.

The site is built with plain HTML, CSS, and JavaScript. It does not require a build step or package installation.

## Features

- Responsive one-page landing page for desktop and mobile.
- Interactive weekly baon simulator with quick expense buttons.
- Live overview cards for income, expenses, budgets, savings, and forecast data.
- Smooth section navigation with mobile menu support.
- Starter guide download generated in the browser.
- Developer/team section with links to individual member pages.
- Browser `localStorage` support so simulator values can persist between visits.

## Project Structure

```text
.
├── index.html       # Main landing page
├── landing.css      # Landing page styles and responsive layout
├── site.js          # Navigation, simulator, overview sync, and guide download logic
├── bb-logo.png      # Main BaonBrain logo
└── Member/          # Team member pages and supporting assets
```

## Getting Started

Because this is a static website, you can run it by opening `index.html` directly in a browser.

For a local development server, you can also use one of these options:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If you are using VS Code, the Live Server extension also works well for previewing changes.

## Main Files

- `index.html` contains the page sections, content, cards, buttons, and team links.
- `landing.css` controls the visual design, layout, responsive behavior, cards, and animations.
- `site.js` powers the mobile navigation, smooth scrolling, starter guide download, simulator state, forecast labels, and overview updates.
- `Member/` contains individual team member output pages linked from the Developers section.

## Interactive Behavior

The hero simulator starts with a sample weekly allowance and spending amount. When a user clicks a quick expense button, the page updates:

- remaining allowance
- total spent
- saved amount
- risk status
- forecast message
- overview dashboard values

The reset button clears the saved simulator and overview state from `localStorage`.

## Customization Notes

- Update page text and sections in `index.html`.
- Adjust colors, spacing, cards, and responsive breakpoints in `landing.css`.
- Change simulator defaults, budget values, forecast behavior, or download content in `site.js`.
- Add or edit team member pages inside the `Member/` folder.

## Credits

BaonBrain was created by the project team listed in the Developers section of the site:

- Ferrer, Philip Andrie P.
- Ibasan, Bryl Rian P.
- Cerezo, Clark Tracy B.
- Pasqual, Shaqckane
- Tangco, Frederic
