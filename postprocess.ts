import { readJSON, writeCSV } from "https://deno.land/x/flat@0.0.13/mod.ts";

type ParsedData = {
  id: number;
  price: number;
  rank: string;
  url: string;
};

type Item = {
  mintAddress: string;
  price: number;
  title: string;
};

const filename = Deno.args[0];
const data: { results: Array<Item> } = await readJSON(filename);
const moonrank: Record<string, string> = await readJSON(
  "zzz/sdb-moonrank.json"
);

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
  .filter(Boolean);

console.log("Initial items:", data.results.length);
console.log("Processed items:", enhancedData.length);

await writeCSV("sdb-data.csv", enhancedData);

const sortedData = enhancedData.sort((a, b) => {
  return parseInt(a.rank || "") - parseInt(b.rank || "");
});

const buckets = sortedData.reduce<Array<Array<ParsedData>>>(
  (data, item) => {
    let bucket: number | undefined = undefined;
    if (item.price <= 4) {
      bucket = 0;
    } else if (item.price <= 8) {
      bucket = 1;
    } else if (item.price <= 12) {
      bucket = 2;
    } else if (item.price <= 20) {
      bucket = 3;
    }

    if (bucket !== undefined) {
      data[bucket].push(item);
    }

    return data;
  },
  [[], [], [], []]
);

const topPicks = buckets.reduce((picks, bucket) => {
  const bucketSelection = bucket.slice(0, 3);
  return [...picks, ...bucketSelection];
}, []);

await writeCSV("sdb-toppicks.csv", topPicks);

console.log("Wrote data");
