export default function handler(req: any, res: any) {
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
    res.status(200).json({ url: authUrl });
}
