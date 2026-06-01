import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/patreon/url', (req, res) => {
    const origin = req.query.origin;
    if (!origin) return res.status(400).json({error: 'origin required'});
    const redirectUri = origin + '/api/patreon/callback';
    
    // Pass origin via state so we can reconstruct the exact redirectUri in the callback
    const params = new URLSearchParams({
      client_id: process.env.PATREON_CLIENT_ID || 'EZDVY8KjKxZ8G95-TNEi4IC_hXWF5Ua4WWaVDjoag4ZSiUBghbete1kth_1qWVWH',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identity identity.memberships',
      state: origin as string
    });
    
    const authUrl = `https://www.patreon.com/oauth2/authorize?${params}`;
    res.json({ url: authUrl });
  });

  app.get(['/api/patreon/callback', '/api/patreon/callback/'], async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.send('No code provided');

    // Get origin from state
    let origin = typeof state === 'string' ? state : undefined;
    if (!origin) {
         return res.send('No state provided (origin tracking lost)');
    }
    
    const redirectUri = origin + '/api/patreon/callback';

    try {
        const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code.toString(),
                grant_type: 'authorization_code',
                client_id: process.env.PATREON_CLIENT_ID || 'EZDVY8KjKxZ8G95-TNEi4IC_hXWF5Ua4WWaVDjoag4ZSiUBghbete1kth_1qWVWH',
                client_secret: process.env.PATREON_CLIENT_SECRET || 'KlXXkWOlXwyEkWsM736d-xV5nPYPu3NEXgy74551Q645YizqEN4-xEz9KT2iw2RF',
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.send(`OAuth Error: ${tokenData.error} - ${tokenData.error_description}`);
        }

        // Fetch User identity
        const userResp = await fetch('https://www.patreon.com/api/oauth2/v2/identity?include=memberships.campaign&fields[member]=patron_status', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResp.json();
        
        let isPro = false;
        // Check if user has an active patron status
        if (userData.included) {
             const activeMembership = userData.included.find((inc: any) => inc.type === 'member' && inc.attributes && inc.attributes.patron_status === 'active_patron');
             if (activeMembership) {
                  isPro = true;
             }
        }

        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', isPro: ${isPro} }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. You can close this window now.</p>
            </body>
          </html>
        `);

    } catch (e: any) {
        res.send(`Server Error: ${e.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
