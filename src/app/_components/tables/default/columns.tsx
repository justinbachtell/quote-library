/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { type Quote } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import useFilters from "./data/filter-options";

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: "isImportant",
    header: ({ column }) => <DataTableColumnHeader column={column} title="★" />,
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="flex w-5 space-x-2">
          {row.getValue("isImportant") == true && (
            <Star
              className="fill-yellow-400 text-yellow-400"
              size={16}
              strokeWidth={2}
              stroke="currentColor"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "text",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quote" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => (
      <div className="flex min-w-72 space-x-2">{row.getValue("text")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "bookTitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Book" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="flex min-w-32 space-x-2">
          <span className="max-w-[200px] font-medium">
            {row.getValue("bookTitle")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "authorNames",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author(s)" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="flex min-w-16 space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("authorNames")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "quotedAuthor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quoted" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("quotedAuthor")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  /* {
    accessorKey: "pageNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Page(s)" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("pageNumber")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  }, */
  {
    accessorKey: "quoteTopics",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Topics" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      const topicList = useFilters().topics;
      const rowTopics = row.getValue("quoteTopics") as string[];

      // Check if rowTopics is an array of strings
      if (
        !Array.isArray(rowTopics) ||
        !rowTopics.every((topic) => typeof topic === "string")
      ) {
        return null;
      }

      // Filter topics that are in the topicList
      const validTopics = rowTopics.filter((topic) =>
        topicList.includes(topic),
      );

      if (validTopics.length === 0) {
        return null;
      }

      return (
        <div className="flex space-x-2">
          {validTopics.map((topic) => (
            <span key={topic} className="max-w-[500px] font-medium">
              {topic}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);

      // Ensure rowValue is an array of strings
      if (
        !Array.isArray(rowValue) ||
        !rowValue.every((topic) => typeof topic === "string")
      ) {
        return false;
      }

      // Assuming value is an array of strings, check if any of the row values are included in value
      if (Array.isArray(value)) {
        return rowValue.some((topic) => value.includes(topic));
      }

      // Assuming value is a string, check if it is included in the row values
      if (typeof value === "string") {
        return rowValue.includes(value);
      }

      return false;
    },
  },
  {
    accessorKey: "quoteTypes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Types" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      const typeList = useFilters().types;
      const rowTypes = row.getValue("quoteTypes") as string[];

      // Check if rowTypes is an array of strings
      if (
        !Array.isArray(rowTypes) ||
        !rowTypes.every((type) => typeof type === "string")
      ) {
        return null;
      }

      // Filter types that are in the typeList
      const validTypes = rowTypes.filter((type) => typeList.includes(type));

      if (validTypes.length === 0) {
        return null;
      }

      return (
        <div className="flex space-x-2">
          {validTypes.map((type) => (
            <span key={type} className="max-w-[500px] font-medium">
              {type}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);

      // Ensure rowValue is an array of strings
      if (
        !Array.isArray(rowValue) ||
        !rowValue.every((type) => typeof type === "string")
      ) {
        return false;
      }

      // Assuming value is an array of strings, check if any of the row values are included in value
      if (Array.isArray(value)) {
        return rowValue.some((type) => value.includes(type));
      }

      // Assuming value is a string, check if it is included in the row values
      if (typeof value === "string") {
        return rowValue.includes(value);
      }

      return false;
    },
  },
  {
    accessorKey: "quoteTags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      const tagList = useFilters().tags;
      const rowTags = row.getValue("quoteTags") as string[];

      // Check if rowTags is an array of strings
      if (
        !Array.isArray(rowTags) ||
        !rowTags.every((tag) => typeof tag === "string")
      ) {
        return null;
      }

      // Filter tags that are in the tagList
      const validTags = rowTags.filter((tag) => tagList.includes(tag));

      if (validTags.length === 0) {
        return null;
      }

      return (
        <div className="flex space-x-2">
          {validTags.map((tag) => (
            <span key={tag} className="max-w-[500px] font-medium">
              {tag}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);

      // Ensure rowValue is an array of strings
      if (
        !Array.isArray(rowValue) ||
        !rowValue.every((tag) => typeof tag === "string")
      ) {
        return false;
      }

      // Assuming value is an array of strings, check if any of the row values are included in value
      if (Array.isArray(value)) {
        return rowValue.some((tag) => value.includes(tag));
      }

      // Assuming value is a string, check if it is included in the row values
      if (typeof value === "string") {
        return rowValue.includes(value);
      }

      return false;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
