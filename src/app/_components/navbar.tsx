"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Icons, type Icon } from "~/app/_components/icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/app/_components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories: {
  title: string;
  href: string;
  description: string;
  icon: Icon;
}[] = [
  {
    title: "Quotes",
    href: "/categories/quotes",
    description: "A page to view all quotes and their authors.",
    icon: Icons.quote,
  },
  {
    title: "Authors",
    href: "/categories/authors",
    description: "A page to view all authors and their quotes.",
    icon: Icons.userRound,
  },
  {
    title: "Books",
    href: "/categories/books",
    description: "A page to view all books and their quotes.",
    icon: Icons.bookText,
  },
  {
    title: "Genres",
    href: "/categories/genres",
    description: "A page to view all genres and their quotes.",
    icon: Icons.libraryBig,
  },
  {
    title: "Topics",
    href: "/categories/topics",
    description: "A page to view all topics and their quotes.",
    icon: Icons.lightbulb,
  },
  {
    title: "Tags",
    href: "/categories/tags",
    description: "A page to view all tags and their quotes.",
    icon: Icons.tag,
  },
  {
    title: "Types",
    href: "/categories/types",
    description: "A page to view all types and their quotes.",
    icon: Icons.dna,
  },
  {
    title: "Publishers",
    href: "/categories/publishers",
    description: "A page to view all publishers and their quotes.",
    icon: Icons.building,
  },
  {
    title: "Cities",
    href: "/categories/cities",
    description: "A page to view all cities and their quotes.",
    icon: Icons.buildings,
  },
  {
    title: "States",
    href: "/categories/states",
    description: "A page to view all states and their quotes.",
    icon: Icons.tentTree,
  },
  {
    title: "Countries",
    href: "/categories/countries",
    description: "A page to view all countries and their quotes.",
    icon: Icons.globe,
  },
];

const createForms: {
  title: string;
  href: string;
  description: string;
  icon: Icon;
}[] = [
  {
    title: "Create Quote",
    href: "/forms/create-quote",
    description: "A page to create a new quote.",
    icon: Icons.quote,
  },
  {
    title: "Create Author",
    href: "/forms/create-author",
    description: "A page to create a new author.",
    icon: Icons.userRound,
  },
  {
    title: "Create Book",
    href: "/forms/create-book",
    description: "A page to create a new book.",
    icon: Icons.bookText,
  },
  {
    title: "Create Genre",
    href: "/forms/create-genre",
    description: "A page to create a new genre.",
    icon: Icons.libraryBig,
  },
  {
    title: "Create Topic",
    href: "/forms/create-topic",
    description: "A page to create a new topic.",
    icon: Icons.lightbulb,
  },
  {
    title: "Create Tag",
    href: "/forms/create-tag",
    description: "A page to create a new tag.",
    icon: Icons.tag,
  },
  {
    title: "Create Type",
    href: "/forms/create-type",
    description: "A page to create a new type.",
    icon: Icons.dna,
  },
  {
    title: "Create Publisher",
    href: "/forms/create-publisher",
    description: "A page to create a new publisher.",
    icon: Icons.building,
  },
  {
    title: "Create City",
    href: "/forms/create-city",
    description: "A page to create a new city.",
    icon: Icons.buildings,
  },
  {
    title: "Create State",
    href: "/forms/create-state",
    description: "A page to create a new state.",
    icon: Icons.tentTree,
  },
  {
    title: "Create Country",
    href: "/forms/create-country",
    description: "A page to create a new country.",
    icon: Icons.globe,
  },
];

type NavbarProps = {
  authenticated: boolean;
  user: boolean;
};

export default function Navbar({ authenticated, user }: NavbarProps) {
  const { setTheme } = useTheme();

  if (authenticated === true) {
    return (
      <NavigationMenu className="mb-2">
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] lg:grid-cols-3">
                {categories.map((category) => (
                  <ListItem
                    key={category.title}
                    href={category.href}
                    className="flex flex-col"
                  >
                    <span className="mb-1 flex flex-row gap-2 text-sm font-bold leading-none">
                      <category.icon className="h-4 w-4" />
                      {category.title}
                    </span>
                    <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {category.description}
                    </span>
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Create</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="light:bg-white grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] dark:bg-stone-800">
                {createForms.map((form) => (
                  <ListItem
                    key={form.title}
                    href={form.href}
                    className="flex flex-col"
                  >
                    <span className="mb-1 flex flex-row gap-2 text-sm font-bold leading-none">
                      <form.icon className="h-4 w-4" />
                      {form.title}
                    </span>
                    <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {form.description}
                    </span>
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={user ? "/api/auth/signout" : "/api/auth/signin"}
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {user ? "Sign out" : "Sign in"}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="nav" size="nav">
                  <Icons.sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Icons.moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  } else {
    return (
      <NavigationMenu className="mb-2 h-12">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] lg:grid-cols-3">
                {categories.map((category) => (
                  <ListItem
                    key={category.title}
                    href={category.href}
                    className="flex flex-col"
                  >
                    <span className="mb-1 flex flex-row gap-2 text-sm font-bold leading-none">
                      <category.icon className="h-4 w-4" />
                      {category.title}
                    </span>
                    <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {category.description}
                    </span>
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <Link href="https://justinbachtell.com" legacyBehavior passHref>
              <NavigationMenuLink
                target="_blank"
                className={navigationMenuTriggerStyle()}
              >
                Contact
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={user ? "/api/auth/signout" : "/api/auth/signin"}
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {user ? "Sign out" : "Sign in"}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="nav" size="nav">
                  <Icons.sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Icons.moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
