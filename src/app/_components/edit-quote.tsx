/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { api } from "~/trpc/react";
import { stringRegex, alphanumericRegex } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface EditQuoteProps {
  quoteId: number | undefined;
}

type SelectOption = {
  id: number;
  title?: string;
  firstName?: string;
  lastName?: string;
};

export default function EditQuote({ quoteId }: EditQuoteProps) {
  const router = useRouter();

  const id = Number(quoteId);

  // Fetch the quote data
  const { data: quoteData, isLoading } =
    api.quote.getQuoteWithBookAndAuthorsById.useQuery(id, {
      enabled: !!id,
    });

  // Fetch the data
  const getBooks = api.book.getAll.useQuery();
  const getAuthors = api.author.getAll.useQuery();
  const getTopics = api.topic.getAll.useQuery();
  const getTags = api.tag.getAll.useQuery();
  const getTypes = api.type.getAll.useQuery();

  // State variables for form inputs and selections
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(quoteData?.[0]?.text ?? "");
  const [bookId, setBookId] = useState<number>(quoteData?.[0]?.bookId ?? 0);
  const [context, setContext] = useState(quoteData?.[0]?.context ?? "");
  const [pageNumber, setPageNumber] = useState(
    quoteData?.[0]?.pageNumber ?? "",
  );
  const [quotedBy, setQuotedBy] = useState<number>(
    quoteData?.[0]?.quotedBy ?? 0,
  );
  const [isImportant, setIsImportant] = useState(
    quoteData?.[0]?.isImportant ?? false,
  );
  const [isPrivate, setIsPrivate] = useState(
    quoteData?.[0]?.isPrivate ?? false,
  );
  const [selectedAuthorNames, setSelectedAuthorNames] = useState<string[]>(
    quoteData?.[0]?.quoteAuthors ?? [],
  );
  const [isAuthorPopoverOpen, setIsAuthorPopoverOpen] = useState(false);
  const [selectedTopicNames, setSelectedTopicNames] = useState<string[]>(
    quoteData?.[0]?.quoteTopics ?? [],
  );
  const [isTopicPopoverOpen, setIsTopicPopoverOpen] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    quoteData?.[0]?.quoteTags ?? [],
  );
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [selectedTypeNames, setSelectedTypeNames] = useState<string[]>(
    quoteData?.[0]?.quoteTypes ?? [],
  );
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [selectedGenreNames, setSelectedGenreNames] = useState<string[]>(
    quoteData?.[0]?.quoteGenres ?? [],
  );
  const [isGenrePopoverOpen, setIsGenrePopoverOpen] = useState(false);

  // Define the schema for quote validation
  const quoteSchema = z.object({
    text: z
      .string()
      .min(1, { message: "Text must be at least 1 character" })
      .max(3000, { message: "Text must be less than 2000 characters" }),
    bookId: z
      .number()
      .min(1, { message: "Book ID must be at least 1" })
      .max(100000, {
        message: "Book ID must be less than 100,000 characters",
      }),
    context: z
      .string()
      .max(2000, { message: "Context must be less than 2000 characters" })
      .regex(stringRegex, {
        message:
          "Context must only contain letters, spaces, parentheses, periods, and hyphens",
      })
      .optional(),
    pageNumber: z
      .string()
      .max(10, { message: "Page Number must be less than 15 characters" })
      .regex(alphanumericRegex, {
        message: "Page Number must only contain letters, numbers, and hyphens",
      })
      .optional(),
    quotedBy: z
      .number()
      .max(100000, {
        message: "Quoted By must be less than 100,000 characters",
      })
      .optional(),
    isImportant: z.boolean(),
    isPrivate: z.boolean(),
    authorNames: z
      .array(z.number())
      .max(100000, {
        message: "Author ID must be less than 100,000 characters",
      })
      .optional(),
    topicNames: z
      .array(z.number())
      .max(100000, {
        message: "Topic ID must be less than 100,000 characters",
      })
      .optional(),
    tagNames: z
      .array(z.number())
      .max(100000, {
        message: "Tag ID must be less than 100,000 characters",
      })
      .optional(),
    typeNames: z
      .array(z.number())
      .max(100000, {
        message: "Type ID must be less than 100,000 characters",
      })
      .optional(),
    genreNames: z
      .array(z.number())
      .max(100000, {
        message: "Genre ID must be less than 100,000 characters",
      })
      .optional(),
  });

  // Update mutation
  const updateQuote = api.quote.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Quote updated!",
        description: "Your quote has been updated.",
      });
      router.push(`/quotes/${quoteId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteQuote = api.quote.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Quote deleted!",
        description: "Your quote has been deleted.",
      });
      router.push(`/quotes`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  // Function to handle deletion of the quote
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      deleteQuote.mutate({ id });
    }
  };

  // Initialize the form with the fetched quote data
  const form = useForm<z.infer<typeof quoteSchema>>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      text: quoteData?.[0]?.text ?? "",
      bookId: quoteData?.[0]?.bookId ?? 0,
      context: quoteData?.[0]?.context ?? "",
      pageNumber: quoteData?.[0]?.pageNumber ?? "",
      quotedBy: quoteData?.[0]?.quotedBy ?? 0,
      isImportant: quoteData?.[0]?.isImportant ?? false,
      isPrivate: quoteData?.[0]?.isPrivate ?? false,
      /* quoteAuthors: quoteData?.[0]?.quoteAuthors ?? [],
      quoteTopics: quoteData?.[0]?.quoteTopics ?? [],
      quoteTags: quoteData?.[0]?.quoteTags ?? [],
      quoteTypes: quoteData?.[0]?.quoteTypes ?? [],
      quoteGenres: quoteData?.[0]?.quoteGenres ?? [], */
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof quoteSchema>) => {
    updateQuote.mutate({
      ...values,
      id,
    });
  };

  // Function to toggle selection of items in the popover
  type ArrayFieldNames =
    | "authorNames"
    | "topicNames"
    | "tagNames"
    | "typeNames"
    | "genreNames";
  const toggleSelection = (
    name: string,
    selectedNames: string[],
    setSelectedNames: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: ArrayFieldNames,
  ) => {
    const newSelection = selectedNames.includes(name)
      ? selectedNames.filter((existingName) => existingName !== name)
      : [...selectedNames, id];
    // setSelectedNames(newSelection);
    // form.setValue(fieldName, newSelection, { shouldValidate: true });
  };

  useEffect(() => {
    if (quoteData?.[0]) {
      form.reset({
        text: quoteData[0].text ?? "",
        bookId: quoteData[0].bookId ?? 0,
        context: quoteData[0].context ?? "",
        pageNumber: quoteData[0].pageNumber ?? "",
        quotedBy: quoteData[0].quotedBy ?? 0,
        isImportant: quoteData[0].isImportant ?? false,
        isPrivate: quoteData[0].isPrivate ?? false,
        /* quoteAuthors: quoteData[0].quoteAuthors,
        quoteTopics: quoteData[0].quoteTopics,
        quoteTags: quoteData[0].quoteTags,
        quoteTypes: quoteData[0].quoteTypes,
        quoteGenres: quoteData[0].quoteGenres, */
      });
    }
  }, [quoteData, form]);

  useEffect(() => {
    if (quoteData?.[0]) {
      setText(quoteData[0].text ?? "");
      setIsImportant(quoteData[0].isImportant ?? false);
      setIsPrivate(quoteData[0].isPrivate ?? false);
      setPageNumber(quoteData[0].pageNumber ?? "");
      setContext(quoteData[0].context ?? "");
      setBookId(quoteData[0].bookId ?? 0);
      setQuotedBy(quoteData[0].quotedBy ?? 0);
      setSelectedAuthorNames(quoteData[0].quoteAuthors);
      setSelectedTopicNames(quoteData[0].quoteTopics);
      setSelectedTagNames(quoteData[0].quoteTags);
      setSelectedTypeNames(quoteData[0].quoteTypes);
      setSelectedGenreNames(quoteData[0].quoteGenres);
    }
  }, [quoteData]);

  // Function to get display value for Select components
  const getDisplayValues = (
    id: number,
    items: SelectOption[],
    labelFields: Array<keyof SelectOption>,
  ): string => {
    const item = items.find((i) => i.id === id);
    if (item) {
      return labelFields.map((field) => item[field] ?? "").join(" ");
    }
    return "";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row gap-4">
        <Button
          className="border-1 mx-auto min-w-16 max-w-24 justify-center rounded border bg-stone-800 text-white hover:bg-stone-50 hover:text-stone-800"
          onClick={() => {
            setEditMode(!editMode);
          }}
        >
          {editMode ? "Cancel" : "Edit Quote"}
        </Button>
        <Button
          className="border-1 mx-auto min-w-16 max-w-24 justify-center rounded border bg-red-600 text-white hover:bg-red-800"
          onClick={handleDelete}
        >
          Delete Quote
        </Button>
      </div>
      {editMode && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="my-8 flex flex-col gap-6"
          >
            <div className="flex w-full flex-col gap-6">
              {/* Quote Text Field */}
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Quote</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Quote text"
                        className="rounded"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The quote text.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-col gap-6">
              {/* Quote Context Field */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Quote's Context</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <FormControl>
                      <Textarea
                        placeholder="Quote context"
                        className="rounded"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The quote's context.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-col gap-6 md:flex-row md:gap-4">
              {/* Quote Page Number Field */}
              <FormField
                control={form.control}
                name="pageNumber"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col md:w-1/3">
                    <FormLabel className="font-bold">Page Number</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <FormControl>
                      <Input type="text" className="rounded" {...field} />
                    </FormControl>
                    <FormDescription>The quote's page number.</FormDescription>
                  </FormItem>
                )}
              />
              {/* Quote Author Field */}
              <FormField
                control={form.control}
                name="isImportant"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-row items-center space-x-3 space-y-0 md:w-1/3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Important Quote?</FormLabel>
                      <FormDescription>
                        Check this box if this quote is very important to you.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {/* Quote Private Field */}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-row items-center space-x-3 space-y-0 md:w-1/3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Private Quote?</FormLabel>
                      <FormDescription>
                        Check this box if this quote is private.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-col gap-6 md:flex-row md:gap-4">
              {/* Quote Book Field */}
              <FormField
                control={form.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Book</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <Select
                      value={bookId.toString()}
                      onValueChange={(value) => setBookId(Number(value))}
                    >
                      <SelectTrigger className="rounded">
                        <SelectValue placeholder="Select a book">
                          {getDisplayValues(bookId, getBooks.data ?? [], [
                            "title",
                          ])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getBooks.data?.map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The book the quote is from.
                    </FormDescription>
                  </FormItem>
                )}
              />
              {/* Quote Author Field */}
              <FormField
                control={form.control}
                name="quotedBy"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Quoted Author</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <Select
                      value={quotedBy.toString()}
                      onValueChange={(value) => setQuotedBy(Number(value))}
                    >
                      <SelectTrigger className="rounded">
                        <SelectValue placeholder="Select an author">
                          {getDisplayValues(quotedBy, getAuthors.data ?? [], [
                            "firstName",
                            "lastName",
                          ])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getAuthors.data?.map((author) => (
                          <SelectItem
                            key={author.id}
                            value={author.id.toString()}
                          >
                            {`${author.firstName} ${author.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The author who is being quoted.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-col gap-6 md:flex-row md:gap-4">
              {/* Quote Topic Field */}
              <FormField
                control={form.control}
                name="topicNames"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Topic(s)</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <Popover
                      open={isTopicPopoverOpen}
                      onOpenChange={setIsTopicPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            role="combobox"
                            aria-expanded={isTopicPopoverOpen}
                          >
                            Select Topic(s)
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="" side="bottom" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search topics"
                            className="rounded"
                          />
                          <CommandList>
                            <CommandEmpty>No topics found.</CommandEmpty>
                            <CommandGroup>
                              {getTopics.data?.map((topic) => (
                                <CommandItem
                                  key={topic.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    toggleSelection(
                                      topic.name,
                                      selectedTopicNames,
                                      setSelectedTopicNames,
                                      "topicNames",
                                    );
                                  }}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    {topic.name}
                                    <Checkbox
                                      checked={selectedTopicNames.includes(
                                        topic.name,
                                      )}
                                      onCheckedChange={() => {
                                        toggleSelection(
                                          topic.name,
                                          selectedTopicNames,
                                          setSelectedTopicNames,
                                          "topicNames",
                                        );
                                      }}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The topic(s) the quote is about.
                    </FormDescription>
                  </FormItem>
                )}
              />
              {/* Quote Tag Field */}
              <FormField
                control={form.control}
                name="tagNames"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Tag(s)</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <Popover
                      open={isTagPopoverOpen}
                      onOpenChange={setIsTagPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            role="combobox"
                            aria-expanded={isTopicPopoverOpen}
                          >
                            Select Tag(s)
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="" side="bottom" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search tags"
                            className="rounded"
                          />
                          <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                              {getTags.data?.map((tag) => (
                                <CommandItem
                                  key={tag.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    toggleSelection(
                                      tag.name,
                                      selectedTagNames,
                                      setSelectedTagNames,
                                      "tagNames",
                                    );
                                  }}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    {tag.name}
                                    <Checkbox
                                      checked={selectedTagNames.includes(
                                        tag.name,
                                      )}
                                      onCheckedChange={() => {
                                        toggleSelection(
                                          tag.name,
                                          selectedTagNames,
                                          setSelectedTagNames,
                                          "tagNames",
                                        );
                                      }}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The tag(s) the quote is about.
                    </FormDescription>
                  </FormItem>
                )}
              />
              {/* Quote Type Field */}
              <FormField
                control={form.control}
                name="typeNames"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="font-bold">Type(s)</FormLabel>
                    <FormMessage className="space-y-0 text-red-600" />
                    <Popover
                      open={isTypePopoverOpen}
                      onOpenChange={setIsTypePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            role="combobox"
                            aria-expanded={isTopicPopoverOpen}
                          >
                            Select Type(s)
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="" side="bottom" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search types"
                            className="rounded"
                          />
                          <CommandList>
                            <CommandEmpty>No types found.</CommandEmpty>
                            <CommandGroup>
                              {getTypes.data?.map((type) => (
                                <CommandItem
                                  key={type.name}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    toggleSelection(
                                      type.name,
                                      selectedTypeNames,
                                      setSelectedTypeNames,
                                      "typeNames",
                                    );
                                  }}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    {type.name}
                                    <Checkbox
                                      checked={selectedTypeNames.includes(
                                        type.name,
                                      )}
                                      onCheckedChange={() => {
                                        toggleSelection(
                                          type.name,
                                          selectedTypeNames,
                                          setSelectedTypeNames,
                                          "typeNames",
                                        );
                                      }}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The type(s) the quote is about.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-4 bg-stone-200" />
            {/* Submit Button */}
            <Button
              type="submit"
              className="border-1 rounded border bg-stone-800 text-white hover:bg-stone-50 hover:text-stone-800"
            >
              Update
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
