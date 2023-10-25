// import { NextApiRequest, NextApiResponse } from "next";
import typeSafeAuthOptions from "../../auth/typeOptions";
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// export const config = {
//   runtime: "edge",
// };

const handler = async (req, res): Promise<any> => {
  try {
    const session: any = await getServerSession(req, res, typeSafeAuthOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId: string = session.user.id;

    // Call Supabase function to get documents by user ID
    const { data: documents, error } = await supabaseAdmin.rpc("get_unique_document_names_and_dates_by_user_id", {
      query_user_id: userId,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ data: documents });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });

  }
};

export default handler;
