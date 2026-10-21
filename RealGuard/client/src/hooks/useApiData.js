import { useEffect, useState } from 'react';

// Busca dados do backend uma vez. Devolve { data, error, loading }.
export function useApiData(fetcher) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => {
      alive = false;
    };
  }, [fetcher]);

  return state;
}
