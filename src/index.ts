import { TObject } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { CastingContext, parse } from "csv-parse";
import type { Callback, Parser } from "csv-parse/dist/cjs/index.d.cts";

const onRecord = <T extends TObject>(
  schema: T,
  record: {},
  context: CastingContext
) => {
  // ignore header
  for (const index in Object.keys(record)) {
    if (Object.keys(record)[index] === Object.values(record)[index]) return;
  }

  // parse record
  const parsedRecord = Value.Convert(schema, record);

  // validate record
  if (!Value.Check(schema, parsedRecord)) {
    throw new Error("cannot validate this record");
  }

  return parsedRecord;
};
function typeboxParse<T extends TObject>(
  schema: T,
  input: Buffer | string,
  callback?: Callback
): Parser {
  return parse(
    input,
    {
      delimiter: ",",
      columns: Object.keys(schema.properties),
      onRecord: (record, context) => onRecord(schema, record, context),
    },
    callback
  );
}

export { typeboxParse as parse };
