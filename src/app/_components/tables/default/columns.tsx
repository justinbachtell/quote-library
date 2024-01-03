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
      // const topicList = useFilters().topics;
      /* console.log("**** TOPICS LIST: ****", topicList);

      const topic = topicList?.find(
        (topic) => topic.label === row.getValue("quoteTopics"),
      );

      if (!topic) {
        console.log("**** NO TOPIC ****");
        return null;
      }

      console.log("**** TOPIC: ****", topic); */

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTopics")}
          </span>
        </div>
      );
    },
    filterFn: (row, label) => {
      return label.includes(row.getValue("quoteTopics"));
    },
  },
  {
    accessorKey: "quoteTypes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Types" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      // const typesList = useFilters().types;
      /* console.log("**** TYPES LIST: ****", typesList);

      const type = typesList?.find(
        (type) => type.label === row.getValue("quoteTypes"),
      );

      if (!type) {
        console.log("**** NO TYPE ****");
        return null;
      }

      console.log("**** TYPE: ****", type); */

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTypes")}
          </span>
        </div>
      );
    },
    filterFn: (row, label) => {
      return label.includes(row.getValue("quoteTypes"));
    },
  },
  {
    accessorKey: "quoteTags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      // const tagList = useFilters().tags;

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTags")}
          </span>
        </div>
      );
    },
    filterFn: (row, label) => {
      return label.includes(row.getValue("quoteTags"));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
