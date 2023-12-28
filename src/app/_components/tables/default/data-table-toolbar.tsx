"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="text"
          placeholder="Filter quote..."
          value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("text")?.setFilterValue(event.target.value)
          }
          className="h-8 w-1/3 lg:w-[150px]"
        />
        <Input
          type="text"
          placeholder="Filter book..."
          value={
            (table.getColumn("bookTitle")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("bookTitle")?.setFilterValue(event.target.value)
          }
          className="h-8 w-1/3 lg:w-[150px]"
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
          className="h-8 w-1/3 lg:w-[150px]"
        />
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
