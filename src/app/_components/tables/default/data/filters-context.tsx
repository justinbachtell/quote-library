"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "~/trpc/react";

// Define the shape of your context state
export interface FilterOptions {
  topics: Array<{ label: string; value: string }>;
  types: Array<{ label: string; value: string }>;
  tags: Array<{ label: string; value: string }>;
}

// Create the context with a default empty state
const FiltersContext = createContext<FilterOptions>({
  topics: [],
  types: [],
  tags: [],
});

export const useFilters = () => useContext(FiltersContext);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State to hold the filter options
  const [topics, setTopics] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [types, setTypes] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [tags, setTags] = useState<Array<{ label: string; value: string }>>([]);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = () => {
      const getTopics = api.topic.getAll.useQuery();
      const topicsData =
        getTopics.data?.map((topic) => ({
          label: topic.name,
          value: topic.name.toLowerCase(),
        })) ?? [];
      setTopics(topicsData);
    };
    fetchTopics();
  }, [topics]);

  // Fetch types
  useEffect(() => {
    const fetchTypes = () => {
      const getTypes = api.type.getAll.useQuery();
      const typesData =
        getTypes.data?.map((type) => ({
          label: type.name,
          value: type.name.toLowerCase(),
        })) ?? [];
      setTypes(typesData);
    };
    fetchTypes();
  }, [types]);

  // Fetch tags
  useEffect(() => {
    const fetchTags = () => {
      const getTags = api.tag.getAll.useQuery();
      const tagsData =
        getTags.data?.map((tag) => ({
          label: tag.name,
          value: tag.name.toLowerCase(),
        })) ?? [];
      setTags(tagsData);
    };
    fetchTags();
  }, [tags]);

  return (
    <FiltersContext.Provider value={{ topics, types, tags }}>
      {children}
    </FiltersContext.Provider>
  );
};
