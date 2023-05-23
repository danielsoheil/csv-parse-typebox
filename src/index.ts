import { Static, TSchema } from "@sinclair/typebox";
import { CastingContext, parse } from "csv-parse";
import Ajv, { ValidateFunction } from "ajv";
const ajv = new Ajv({ coerceTypes: true });

const onRecord = <T extends TSchema>(
  recordSchema: T,
  recordValidateFunction: ValidateFunction,
  record: {},
  context: CastingContext
) => {
  // ignore header
  for (const index in Object.keys(record)) {
    if (Object.keys(record)[index] === Object.values(record)[index]) return;
  }

  // validate record
  if (!recordValidateFunction(record)) {
    throw new Error("cannot validate this record");
  }

  return record;
};

function typeboxParse<T extends TSchema>(
  input: Buffer | string,
  recordSchema: T,
  recordValidateFunction: ValidateFunction = ajv.compile(recordSchema)
): Promise<Static<T>[]> {
  return new Promise((resolve, reject) => {
    parse(
      input,
      {
        delimiter: ",",
        columns: Object.keys(recordSchema.properties),
        onRecord: (record, context) =>
          onRecord(recordSchema, recordValidateFunction, record, context),
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
