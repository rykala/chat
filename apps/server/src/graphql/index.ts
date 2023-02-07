import { readFileSync } from "fs";
import { resolve } from "path";
import { resolvers } from "./resolvers";

const path = resolve(__dirname, "./schema.gql");
const typeDefs = readFileSync(path, "utf8");

export { typeDefs, resolvers };
