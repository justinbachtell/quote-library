"use client";

import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useTopics, useTypes, useTags } from "./data/filter-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          type="text"
          placeholder="Filter quote..."
          value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("text")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full max-w-28"
        />
        <Input
          type="text"
          placeholder="Filter book..."
          value={
            (table.getColumn("bookTitle")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            table.getColumn("bookTitle")?.setFilterValue(event.target.value);
          }}
          className="h-8 w-full max-w-28"
        />
        <Input
          type="text"
          placeholder="Filter author..."
          value={
            (table.getColumn("authorNames")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("authorNames")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full max-w-28"
        />
        {table.getColumn("quoteTopics") && (
          <DataTableFacetedFilter
            column={table.getColumn("quoteTopics")}
            title="Topic"
            options={useTopics()}
          />
        )}
        {table.getColumn("quoteTypes") && (
          <DataTableFacetedFilter
            column={table.getColumn("quoteTypes")}
            title="Type"
            options={useTypes()}
          />
        )}
        {table.getColumn("quoteTags") && (
          <DataTableFacetedFilter
            column={table.getColumn("quoteTags")}
            title="Tag"
            options={useTags()}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
