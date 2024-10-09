import { useState } from "react";

interface UseApiProps {
  url: string;
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
}

export default function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = ({ url, method, headers, body }: UseApiProps) => {
    setIsLoading(true);
    
    fetch(url, { credentials: 'include', method, headers, body })
      .then((response) => response.json())
      .then((data) => setData(data))
      .finally(() => setIsLoading(false));
  };

  return { data, isLoading, handleFetch };
}
