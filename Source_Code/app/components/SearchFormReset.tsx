"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

const SearchFormReset = () => {
  const reset = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest("form");
    if (form) form.reset();
  };
  return (
    <button type="reset" onClick={reset}>
      <Link
        href="/"
        className="size-[50px] rounded-full bg-black flex justify-center items-center"
      >
        <X className="size-5" />
      </Link>
    </button>
  );
};

export default SearchFormReset;
