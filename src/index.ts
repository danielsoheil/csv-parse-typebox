import { TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { CastingContext, parse } from "csv-parse";
import { TypeCompiler, TypeCheck } from "@sinclair/typebox/compiler";

const onRecord = <T extends TSchema>(
  recordSchema: T,
  recordSchemaCompiled: TypeCheck<T>,
  record: {},
  context: CastingContext
) => {
  // ignore header
  for (const index in Object.keys(record)) {
    if (Object.keys(record)[index] === Object.values(record)[index]) return;
  }

  // parse record
  const parsedRecord = Value.Convert(recordSchema, record);

  // validate record
  if (!recordSchemaCompiled.Check(parsedRecord)) {
    throw new Error("cannot validate this record");
  }

  return parsedRecord;
};

function typeboxParse<T extends TSchema>(
  input: Buffer | string,
  recordSchema: T,
  recordSchemaCompiled: TypeCheck<T> = TypeCompiler.Compile(recordSchema)
): Promise<[]> {
  return new Promise((resolve, reject) => {
    parse(
      input,
      {
        delimiter: ",",
        columns: Object.keys(recordSchema.properties),
        onRecord: (record, context) =>
          onRecord(recordSchema, recordSchemaCompiled, record, context),
      },
      (error, records) => {
        if (error) {
          reject(error);
        } else {
          resolve(records);
        }
      }
    );
  });
}

export { typeboxParse as parse };
