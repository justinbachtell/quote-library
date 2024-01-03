import { api } from "~/trpc/react";

export default function useFilters() {
  const topics = useTopics();
  const tags = useTags();
  const types = useTypes();

  console.log("topics", topics);
  console.log("tags", tags);
  console.log("types", types);

  return { topics, tags, types };
}

export const useTopics = () => {
  const getTopics = api.topic.getAll.useQuery();

  const topics =
    getTopics.data?.map((topic) => ({
      label: topic.name,
      value: topic.name.toLowerCase(),
    })) ?? [];

  return topics;
};

export const useTags = () => {
  const getTags = api.tag.getAll.useQuery();

  const tags =
    getTags.data?.map((tag) => ({
      label: tag.name,
      value: tag.name.toLowerCase(),
    })) ?? [];

  return tags;
};

export const useTypes = () => {
  const getTypes = api.type.getAll.useQuery();

  const types =
    getTypes.data?.map((type) => ({
      label: type.name,
      value: type.name.toLowerCase(),
    })) ?? [];

  return types;
};
