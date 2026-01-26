export function useShortLink() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const getShortLink = async (shortId?: string) => {
    if (!shortId) {
      return undefined;
    }

    try {
      const response = await fetch(`${apiUrl}/short-link/${shortId}`);

      if (!response.ok) {
        throw new Error(`Error fetching short link: ${response.statusText}`);
      }

      const data = await response.json();

      return data.base64string as string | undefined;
    } catch (error) {
      console.error('Failed to fetch short link:', error);
      alert('Failed to load the shared link. VPN disabled or invalid link?');
      throw new Error('Failed to fetch short link');
    }
  }

  const updateShortLink = async (shortId: string, permanent: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/short-link/${shortId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permanent }),
      });
    } catch (error) {
      console.error('Failed to update short link:', error);
      throw new Error('Failed to update short link');
    }
  }

  const createShortLink = async (base64string: string) => {
    try {
      const response = await fetch(`${apiUrl}/short-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64string }),
      });

      if (!response.ok) {
        throw new Error(`Error creating short link: ${response.statusText}`);
      }

      const data = await response.json();

      return data.shortId as string;
    } catch (error) {
      console.error('Failed to create short link:', error);
      throw new Error('Failed to create short link');
    }
  }

  return {
    getShortLink,
    createShortLink,
    updateShortLink,
  }
}
