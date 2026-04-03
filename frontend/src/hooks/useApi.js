import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic hook for API calls with loading + error state
 * Usage: const { data, loading, execute } = useApi(getStudents);
 */
const useApi = (apiFn, initialData = null) => {
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'An error occurred';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute, setData };
};

export default useApi;
