import localFont from "next/font/local";

export const futuraPtLight = localFont({
  src: "./fonts/FuturaCyrillicBook.ttf",
  variable: "--font-futura-pt",
  display: "swap",
  weight: "400",
});

export const raleway = localFont({
  src: [
    {
      path: "./fonts/Raleway-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-oswald",
  display: "swap",
  weight: "100 900",
});
