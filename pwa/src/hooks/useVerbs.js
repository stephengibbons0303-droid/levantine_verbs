import { useState, useEffect } from 'react';

export function useVerbs() {
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'verbs.json')
      .then(r => r.json())
      .then(data => {
        setVerbs(Array.isArray(data) ? data : [data]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { verbs, loading };
}
