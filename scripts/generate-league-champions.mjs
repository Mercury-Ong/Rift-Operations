const versionsResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
if (!versionsResponse.ok) {
  throw new Error(`Failed to fetch versions: ${versionsResponse.status}`);
}

const versions = await versionsResponse.json();
const version = versions[0];

const championsResponse = await fetch(
  `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
);
if (!championsResponse.ok) {
  throw new Error(`Failed to fetch champion list: ${championsResponse.status}`);
}

const payload = await championsResponse.json();
const champions = Object.values(payload.data)
  .map((champion) => {
    const firstTag = Array.isArray(champion.tags) && champion.tags.length ? champion.tags[0] : "";

    let championClass = "FIGHTER";
    if (firstTag === "Tank") championClass = "TANK";
    if (firstTag === "Assassin") championClass = "ASSASSIN";
    if (firstTag === "Mage") championClass = "MAGE";
    if (firstTag === "Marksman") championClass = "MARKSMAN";
    if (firstTag === "Support") championClass = "SUPPORT";

    return {
      id: champion.id,
      name: champion.name,
      championClass,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const rows = champions.map(
  (champion) =>
    `  { id: ${JSON.stringify(champion.id)}, name: ${JSON.stringify(champion.name)}, laneTags: ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"], championClass: ${JSON.stringify(champion.championClass)}, comfortScore: 5 },`,
);

const output = [
  'import { Champion } from "@/lib/models";',
  "",
  "// Generated from Riot Data Dragon champion.json",
  `export const leagueChampionsVersion = ${JSON.stringify(version)};`,
  "",
  "export const leagueChampions: Champion[] = [",
  ...rows,
  "];",
  "",
].join("\n");

await import("node:fs/promises").then((fs) =>
  fs.writeFile("src/lib/data/leagueChampions.ts", output, "utf8"),
);

console.log(`Generated ${champions.length} champions for version ${version}.`);
