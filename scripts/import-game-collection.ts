import { importAndWriteCollectionJson } from '../app/lib/gameCollectionImport';

async function main() {
  const records = await importAndWriteCollectionJson();
  console.log(`Imported ${records.length} records into data/gameCollection.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});