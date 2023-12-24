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
        <div className="flex space-x-2">
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
    cell: ({ row }) => <div className="">{row.getValue("text")}</div>,
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
        <div className="flex space-x-2">
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
        <div className="flex space-x-2">
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
  },
  /* {
    accessorKey: "quotedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quoted By" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("quotedBy")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  }, */
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
