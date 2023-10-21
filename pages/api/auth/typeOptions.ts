import { authOptions } from "./[...nextauth]";
import{NextAuthOptions} from "next-auth";

const typeSafeAuthOptions = authOptions as NextAuthOptions;

export default typeSafeAuthOptions;

