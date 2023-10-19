import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from "@/utils";
import { getServerSession } from "next-auth"; // Adjusted the import

export const config = {
  runtime: "edge",
};

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const session: { user?: { id: string } } | null = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId: string = session.user.id;

    // Call Supabase function to get documents by user ID
    const { data: documents, error } = await supabaseAdmin.rpc("get_documents_by_user_id", {
      query_user_id: userId,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
