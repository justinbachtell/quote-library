"use client";

import * as React from "react";
import { currentYear } from "~/lib/utils";

export default function Footer() {
  return (
    <div className="container mt-6 flex w-full flex-col items-center justify-center py-6">
      <div className="flex w-full items-center justify-center">
        <p>
          &copy; {currentYear}. Built by Justin Bachtell. All Rights Reserved.{" "}
        </p>
      </div>
    </div>
  );
}
