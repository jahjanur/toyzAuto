import { Archivo, Geist, Geist_Mono } from "next/font/google";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Font CSS variables shared by the site and admin root layouts. */
export const fontVars = `${archivo.variable} ${geist.variable} ${geistMono.variable}`;
