import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Header from "@/components/Header";

export type HeaderProps = SliceComponentProps<Content.HeaderSlice>;

export default function HeaderSlice({ slice }: HeaderProps) {
  return <Header {...slice.primary} />;
} 