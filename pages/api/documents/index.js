import { getServerSession } from "next-auth/next"; // Adjusted the import
import { authOptions } from '../auth/[...nextauth]';

// const supabaseAdmin = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export const config = {
  runtime: "edge",
};

const handler = async (req, res) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    // Call Supabase function to get documents by user ID
    // const { data: documents, error } = await supabaseAdmin.rpc("get_documents_by_user_id", {
    //   query_user_id: userId,
    // });

    // if (error) {
    //   console.error(error);
    //   return res.status(500).json({ error: "Internal Server Error" });
    // }

    // console.log(documents)
    return res.status(200).json("all good");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
