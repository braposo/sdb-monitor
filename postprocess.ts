// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import { readJSON, writeCSV } from "https://deno.land/x/flat@0.0.13/mod.ts";

type Item = {
  mintAddress: string;
  price: number;
  title: string;
};

type RawData = {
  results: Array<Item>;
};

type ParsedData = {
  id: number;
  price: number;
  rank: string;
  url: string;
};

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0];
const data: RawData = await readJSON(filename);
const moonrank: Record<string, string> = await readJSON("wolves-rank.json");

const enhancedData: Array<ParsedData> = data.results
  .map((item) => {
    const [_, id] = item.title.split("#");
    const url = `https://magiceden.io/item-details/${item.mintAddress}`;

    return {
      id: parseInt(id),
      price: item.price,
      rank: moonrank[id],
      url,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.id - b.id);

console.log("Initial items:", data.results.length);
console.log("Processed items:", enhancedData.length);

await writeCSV("wolves-data-processed.csv", enhancedData);
console.log("Wrote data");
