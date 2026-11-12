"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";

/** next/link that keeps the visitor in their language (adds /fr for French). */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { locale } = useI18n();
  const localized = typeof href === "string" ? localizeHref(href, locale) : href;
  return <NextLink href={localized} {...rest} />;
}
