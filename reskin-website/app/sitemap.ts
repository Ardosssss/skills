import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/haarentfernung", "/tattooentfernung", "/preise", "/studio", "/ratgeber", "/kontakt", "/buchen", "/impressum", "/datenschutz", "/agb"];
  return paths.map((p) => ({
    url: `${site.url}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : ["/haarentfernung", "/tattooentfernung", "/preise"].includes(p) ? 0.9 : 0.5,
  }));
}
