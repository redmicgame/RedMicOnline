export default async function handler(req: any, res: any) {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('No code provided');

    // Get origin from state
    let origin = typeof state === 'string' ? state : undefined;
    if (!origin) {
         return res.status(400).send('No state provided (origin tracking lost)');
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
            return res.status(400).send(`OAuth Error: ${tokenData.error} - ${tokenData.error_description}`);
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

        res.status(200).send(`
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
        res.status(500).send(`Server Error: ${e.message}`);
    }
}
