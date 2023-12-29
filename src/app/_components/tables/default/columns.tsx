"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { type Quote } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: "isImportant",
    header: ({ column }) => <DataTableColumnHeader column={column} title="★" />,
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
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTopics")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "quoteTypes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Types" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTypes")}
          </span>
        </div>
      );
    },
  },
  /* {
    accessorKey: "quoteTags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("quoteTags")}
          </span>
        </div>
      );
    },
  }, */
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
