import { useState, useEffect } from 'react';
import { ensureConjugations } from '../utils/conjugationEngine';

export function useVerbs() {
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'verbs.json')
      .then(r => r.json())
      .then(data => {
        const verbList = Array.isArray(data) ? data : [data];
        // Pre-generate conjugations for engine verbs
        for (const verb of verbList) {
          ensureConjugations(verb);
        }
        setVerbs(verbList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { verbs, loading };
}
