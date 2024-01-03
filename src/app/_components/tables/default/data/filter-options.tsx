import { api } from "~/trpc/react";

export default function useFilters() {
  const topics = useTopics();
  const tags = useTags();
  const types = useTypes();

  return { topics, tags, types };
}

export const useTopics = () => {
    const getTopics = api.topic.getAll.useQuery();

    const topics =
        getTopics.data?.map((topic) => topic.name) ?? [];

    return topics;
};


export const useTags = () => {
  const getTags = api.tag.getAll.useQuery();

    const tags =
        getTags.data?.map((tag) => tag.name) ?? [];

    return tags;
}

export const useTypes = () => {
  const getTypes = api.type.getAll.useQuery();

  const types =
        getTypes.data?.map((type) => type.name) ?? [];

  return types;
};
