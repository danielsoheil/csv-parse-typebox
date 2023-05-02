import { TObject } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { CastingContext, parse } from "csv-parse";
import type { Callback, Parser } from "csv-parse/dist/cjs/index.d.cts";
import { TypeCompiler, TypeCheck } from "@sinclair/typebox/compiler";


const onRecord = <T extends TObject>(
  schema: T,
  recordType: TypeCheck<T>,
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
  if (!recordType.Check(parsedRecord)) {
    throw new Error("cannot validate this record");
  }

  return parsedRecord;
};
function typeboxParse<T extends TObject>(
  schema: T,
  input: Buffer | string,
  callback?: Callback
): Parser {
  const RecordType = TypeCompiler.Compile(schema);
  return parse(
    input,
    {
      delimiter: ",",
      columns: Object.keys(schema.properties),
      onRecord: (record, context) => onRecord(schema, RecordType, record, context),
    },
    callback
  );
}

export { typeboxParse as parse };
