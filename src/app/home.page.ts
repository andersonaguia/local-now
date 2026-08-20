export const HOME_PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Server is running</title>
    <style>
      :root {
        --bg: #09090b;
        --card: #121216;
        --red: #e0234e;
        --text: #f4f4f5;
        --muted: #a1a1aa;
        --ok: #4ade80;
        --line: rgba(255, 255, 255, 0.08);
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        color: var(--text);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background:
          radial-gradient(900px 420px at 50% -10%, rgba(224, 35, 78, 0.22), transparent 55%),
          linear-gradient(180deg, #14080c 0%, var(--bg) 45%);
      }

      main {
        width: min(92vw, 420px);
        padding: 3rem 2.25rem;
        text-align: center;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 42%),
          var(--card);
        border: 1px solid var(--line);
        border-radius: 28px;
        box-shadow:
          0 0 0 1px rgba(224, 35, 78, 0.08),
          0 30px 80px rgba(0, 0, 0, 0.45);
      }

      .logo {
        width: 104px;
        height: 104px;
        margin: 0 auto 1.75rem;
        filter: drop-shadow(0 12px 28px rgba(224, 35, 78, 0.45));
      }

      h1 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.7rem;
        font-size: 1.65rem;
        font-weight: 650;
        letter-spacing: -0.03em;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--ok);
        box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
        animation: pulse 1.8s ease-out infinite;
      }

      p {
        margin-top: 0.7rem;
        color: var(--muted);
        font-size: 0.95rem;
      }

      @keyframes pulse {
        70% {
          box-shadow: 0 0 0 12px rgba(74, 222, 128, 0);
        }
      }
    </style>
  </head>
  <body>
    <main>
      <img
        class="logo"
        src="https://nestjs.com/img/logo-small.svg"
        width="104"
        height="104"
        alt="NestJS"
      />
      <h1><span class="dot" aria-hidden="true"></span> Server is running</h1>
      <p>Time Server is up and ready to receive requests.</p>
    </main>
  </body>
</html>
`;
