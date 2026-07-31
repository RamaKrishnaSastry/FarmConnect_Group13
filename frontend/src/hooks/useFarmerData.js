import { useState, useEffect, useCallback } from 'react';
import * as farmerApi from '../api/farmerApi';
import { useAuth } from './useAuth';

export const useFarmerData = () => {
  const { user } = useAuth();
  const [produce, setProduce] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refetch = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const [produceData, requestsData, deliveriesData, ratingsData] = await Promise.all([
          farmerApi.getProduceListing(user?.id || 1),
          farmerApi.getPurchaseRequests(user?.id || 1),
          farmerApi.getDeliveries(user?.id || 1),
          farmerApi.getRatings(user?.id || 1),
        ]);

        setProduce(Array.isArray(produceData) ? produceData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, refreshCounter]);

  return { produce, requests, deliveries, ratings, loading, error, refetch };
};
