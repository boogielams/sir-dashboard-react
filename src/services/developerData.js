import { useState, useEffect, useCallback } from 'react';

// GitHub API endpoints for developer activity
const GITHUB_API_BASE = 'https://api.github.com';

// Network-specific search queries for GitHub
const networkQueries = {
  ethereum: ['ethereum language:solidity', 'ethereum language:javascript', 'ethereum language:typescript'],
  solana: ['solana language:rust', 'solana language:javascript', 'solana language:typescript'],
  base: ['base language:solidity', 'base language:javascript', 'base language:typescript'],
  sei: ['sei language:rust', 'sei language:javascript', 'sei language:typescript'],
  sui: ['sui language:rust', 'sui language:javascript', 'sui language:typescript'],
  polygon: ['polygon language:solidity', 'polygon language:javascript', 'polygon language:typescript'],
  arbitrum: ['arbitrum language:solidity', 'arbitrum language:javascript', 'arbitrum language:typescript'],
  optimism: ['optimism language:solidity', 'optimism language:javascript', 'optimism language:typescript'],
  avalanche: ['avalanche language:javascript', 'avalanche language:typescript', 'avalanche language:go'],
  bsc: ['bsc language:solidity', 'bsc language:javascript', 'bsc language:typescript']
};

// Realistic developer activity estimates based on actual ecosystem data
const realisticDeveloperData = {
  ethereum: {
    activeDevelopers: 8500,
    repositories: 8386,
    monthlyCommits: 45000,
    ecosystem: 'Dominant'
  },
  solana: {
    activeDevelopers: 3200,
    repositories: 8045,
    monthlyCommits: 28000,
    ecosystem: 'Mature'
  },
  base: {
    activeDevelopers: 1200,
    repositories: 4000,
    monthlyCommits: 15000,
    ecosystem: 'Growing'
  },
  sei: {
    activeDevelopers: 450,
    repositories: 850,
    monthlyCommits: 8000,
    ecosystem: 'Emerging'
  },
  sui: {
    activeDevelopers: 680,
    repositories: 1200,
    monthlyCommits: 12000,
    ecosystem: 'Emerging'
  },
  polygon: {
    activeDevelopers: 2100,
    repositories: 3200,
    monthlyCommits: 18000,
    ecosystem: 'Mature'
  },
  arbitrum: {
    activeDevelopers: 1800,
    repositories: 2800,
    monthlyCommits: 16000,
    ecosystem: 'Mature'
  },
  optimism: {
    activeDevelopers: 1600,
    repositories: 2400,
    monthlyCommits: 14000,
    ecosystem: 'Mature'
  },
  avalanche: {
    activeDevelopers: 1200,
    repositories: 1800,
    monthlyCommits: 10000,
    ecosystem: 'Mature'
  },
  bsc: {
    activeDevelopers: 2800,
    repositories: 4200,
    monthlyCommits: 22000,
    ecosystem: 'Mature'
  }
};

const fetchGitHubData = async (networkId) => {
  try {
    const queries = networkQueries[networkId];
    if (!queries) return null;

    const results = await Promise.allSettled(
      queries.map(query => 
        fetch(`${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=1`)
          .then(res => res.json())
      )
    );

    // Sum up total repositories across all queries
    const totalRepos = results
      .filter(result => result.status === 'fulfilled')
      .reduce((sum, result) => sum + (result.value.total_count || 0), 0);

    return {
      repositories: totalRepos,
      isLive: true
    };
  } catch (error) {
    console.warn(`Failed to fetch GitHub data for ${networkId}:`, error);
    return null;
  }
};

export const useDeveloperData = (networkId, refreshInterval = 300000) => { // 5 minutes
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeveloperData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get realistic base data
      const baseData = realisticDeveloperData[networkId];
      if (!baseData) {
        throw new Error(`No developer data available for ${networkId}`);
      }

      // Try to fetch live GitHub data
      const githubData = await fetchGitHubData(networkId);

      const combinedData = {
        lastUpdated: new Date().toISOString(),
        dataQuality: {
          activeDevelopers: 'estimated',
          repositories: githubData?.isLive ? 'live' : 'estimated',
          monthlyCommits: 'estimated',
          ecosystem: 'static'
        },
        activeDevelopers: baseData.activeDevelopers,
        repositories: githubData?.repositories || baseData.repositories,
        monthlyCommits: baseData.monthlyCommits,
        ecosystem: baseData.ecosystem,
        isLiveData: !!githubData?.isLive
      };

      setData(combinedData);
    } catch (err) {
      console.error(`Error fetching developer data for ${networkId}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [networkId]);

  useEffect(() => {
    fetchDeveloperData();
    const interval = setInterval(fetchDeveloperData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchDeveloperData, refreshInterval]);

  return { data, loading, error };
};

// Hook to get developer data for all networks
export const useAllDeveloperData = (refreshInterval = 300000) => {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const networkIds = Object.keys(realisticDeveloperData);
        
        const results = await Promise.allSettled(
          networkIds.map(async (networkId) => {
            const { data } = await fetchGitHubData(networkId);
            const baseData = realisticDeveloperData[networkId];
            
            return {
              networkId,
              data: {
                lastUpdated: new Date().toISOString(),
                dataQuality: {
                  activeDevelopers: 'estimated',
                  repositories: data?.isLive ? 'live' : 'estimated',
                  monthlyCommits: 'estimated',
                  ecosystem: 'static'
                },
                activeDevelopers: baseData.activeDevelopers,
                repositories: data?.repositories || baseData.repositories,
                monthlyCommits: baseData.monthlyCommits,
                ecosystem: baseData.ecosystem,
                isLiveData: !!data?.isLive
              }
            };
          })
        );

        const successfulData = results
          .filter(result => result.status === 'fulfilled')
          .reduce((acc, result) => {
            acc[result.value.networkId] = result.value.data;
            return acc;
          }, {});

        setAllData(successfulData);
      } catch (error) {
        console.error('Error fetching all developer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data: allData, loading };
}; 